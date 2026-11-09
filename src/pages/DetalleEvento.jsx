import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Header from "../components/Header";
import MapaUbicacion from "../components/MapaUbicacion";
import api from "../api/axiosConfig";

const TZ = "America/Santiago";
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

const fechaLarga = (iso) =>
  mayuscula(
    new Date(iso).toLocaleDateString("es-CL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ,
    })
  );

const hora = (iso) =>
  new Date(iso).toLocaleTimeString("es-CL", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ,
  });

const armarHorario = (inicio, fin) => {
  if (fechaLarga(inicio) === fechaLarga(fin)) {
    return { fecha: fechaLarga(inicio), horas: `${hora(inicio)} a ${hora(fin)} h` };
  }
  return {
    fecha: `Desde el ${fechaLarga(inicio)}`,
    horas: `${hora(inicio)} h, hasta el ${fechaLarga(fin)} a las ${hora(fin)} h`,
  };
};

function DetalleEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esParticipante = usuario?.rol === "participante";

  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [reservaExistente, setReservaExistente] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");
  const [reservaNueva, setReservaNueva] = useState(null);

  useEffect(() => {
    const obtenerEvento = async () => {
      try {
        const response = await api.get(`/actividades/${id}`);
        setEvento(response.data);
      } catch (err) {
        setError("Evento no encontrado.");
      } finally {
        setCargando(false);
      }
    };
    obtenerEvento();
  }, [id]);

  // Saber si el participante ya tiene una reserva confirmada para esta actividad
  useEffect(() => {
    if (!esParticipante) return;
    const buscarReserva = async () => {
      try {
        const { data } = await api.get("/reservas/mis-reservas");
        const existente = data.reservas.find(
          (r) => r.estado === "confirmada" && r.actividad?._id === id
        );
        setReservaExistente(existente || null);
      } catch (e) {
        // Si falla, el servidor igual impide reservar dos veces
      }
    };
    buscarReserva();
  }, [id, esParticipante]);

  const cerrarModal = () => {
    setModalAbierto(false);
    setReservaNueva(null);
    setErrorReserva("");
  };

  const confirmarReserva = async () => {
    setReservando(true);
    setErrorReserva("");
    try {
      const { data } = await api.post("/reservas", { actividadId: id });
      setReservaNueva(data.reserva);
      setReservaExistente({ _id: data.reserva.id, codigoQR: data.reserva.codigoQR });
      setEvento((e) => ({ ...e, cuposDisponibles: data.actividad.cuposDisponibles }));
    } catch (err) {
      setErrorReserva(err.response?.data?.mensaje || "No se pudo completar la reserva.");
      try {
        const { data } = await api.get(`/actividades/${id}`);
        setEvento(data);
      } catch (e) {
        // se mantiene lo que ya se mostraba
      }
    } finally {
      setReservando(false);
    }
  };

  if (cargando) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "40px" }}>Cargando...</p>
      </>
    );
  }

  if (error || !evento) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "40px" }}>{error || "Evento no encontrado."}</p>
      </>
    );
  }

  const coords = evento.ubicacion?.coordinates;
  const tieneUbicacion = Array.isArray(coords) && coords.length === 2;
  const lat = tieneUbicacion ? coords[1] : null;
  const lng = tieneUbicacion ? coords[0] : null;
  const horario = armarHorario(evento.fechaInicio, evento.fechaFin);
  const sinCupos = evento.cuposDisponibles <= 0;
  const yaComenzo = new Date(evento.fechaInicio) <= new Date();
  const precioTexto = evento.precio === 0 ? "Gratis" : `$${evento.precio} CLP`;

  const avisoEstado =
    evento.estado === "borrador"
      ? "Vista previa: este borrador aún no es visible para el público."
      : evento.estado === "pausada"
      ? "Esta actividad está pausada y no aparece en las búsquedas."
      : "";

  let accion;
  if (!esParticipante) {
    accion = <p style={styles.hint}>Solo las cuentas de participante pueden reservar actividades.</p>;
  } else if (reservaExistente) {
    accion = (
      <div style={styles.reservedBox}>
        ✅ Ya tienes una reserva para esta actividad.{" "}
        <button style={styles.linkBtn} onClick={() => navigate("/mis-reservas")}>Ver mis reservas</button>
      </div>
    );
  } else if (evento.estado !== "activa") {
    accion = <button style={styles.joinDisabled} disabled>Actividad no disponible</button>;  
  } else if (yaComenzo) {
    accion = <button style={styles.joinDisabled} disabled>La actividad ya comenzó</button>;
  } else if (sinCupos) {
    accion = <button style={styles.joinDisabled} disabled>Sin cupos</button>;
  } else {
    accion = (
      <button style={styles.joinButton} onClick={() => setModalAbierto(true)}>
        Quiero participar
      </button>
    );
  }

  return (
    <>
      <Header />

      {modalAbierto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {!reservaNueva ? (
              <>
                <h2 style={styles.modalTitle}>Confirma tu reserva</h2>
                <p style={styles.modalLine}><strong>{evento.titulo}</strong></p>
                <p style={styles.modalLine}>📅 {horario.fecha}</p>
                <p style={styles.modalLine}>🕒 {horario.horas}</p>
                <p style={styles.modalLine}>📍 {evento.direccionTexto}</p>
                <p style={styles.modalLine}>💰 {precioTexto}</p>
                {evento.precio > 0 && (
                  <p style={styles.modalHint}>El pago se coordina directamente con el organizador.</p>
                )}
                {errorReserva && <p style={styles.error}>{errorReserva}</p>}
                <button style={styles.modalPrimary} onClick={confirmarReserva} disabled={reservando}>
                  {reservando ? "Reservando..." : "Confirmar reserva"}
                </button>
                <button style={styles.modalSecondary} onClick={cerrarModal}>Cancelar</button>
              </>
            ) : (
              <>
                <h2 style={styles.modalTitle}>¡Reserva confirmada!</h2>
                <p style={styles.modalLine}>Presenta este código al llegar a la actividad.</p>
                <div style={{ textAlign: "center", margin: "8px 0" }}>
                  <QRCodeSVG value={reservaNueva.codigoQR} size={160} />
                </div>
                <button style={styles.modalPrimary} onClick={() => navigate("/mis-reservas")}>
                  Ver mis reservas
                </button>
                <button style={styles.modalSecondary} onClick={cerrarModal}>Cerrar</button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/home")}>
          ← Volver
        </button>
        {avisoEstado && <div style={styles.previewBanner}>{avisoEstado}</div>}

        <div style={styles.content}>
          <span style={styles.badge}>{evento.disciplina}</span>
          <h1 style={styles.title}>{evento.titulo}</h1>

          <div style={styles.infoBox}>
            <p style={styles.info}>📅 <strong>{horario.fecha}</strong></p>
            <p style={styles.info}>🕒 {horario.horas} ({evento.horario})</p>
            <p style={styles.info}>
              {sinCupos ? "👥 Sin cupos disponibles" : `👥 ${evento.cuposDisponibles} de ${evento.cupoMaximo} cupos disponibles`}
            </p>
            <p style={styles.info}>💰 {precioTexto}</p>
            <p style={styles.info}>🎯 Nivel: {evento.nivel}</p>
            <p style={styles.info}>🧭 Modalidad: {evento.modalidad}</p>
          </div>

          <h3 style={styles.sectionTitle}>Descripción</h3>
          <p style={styles.description}>{evento.descripcion}</p>

          <h3 style={styles.sectionTitle}>Dónde</h3>
          {evento.modalidad === "virtual" ? (
            <p style={styles.description}>💻 Actividad virtual. {evento.direccionTexto}</p>
          ) : (
            <>
              <p style={styles.description}>📍 {evento.direccionTexto}</p>
              {evento.instrucciones && (
                <div style={styles.instrucciones}>
                  <strong>Cómo encontrar el lugar</strong>
                  <p style={styles.instruccionesTexto}>{evento.instrucciones}</p>
                </div>
              )}              
              {tieneUbicacion ? (
                <>
                  <MapaUbicacion lat={lat} lng={lng} />
                  <a
                    style={styles.directions}
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cómo llegar
                  </a>
                </>
              ) : (
                <p style={styles.hint}>El organizador no marcó la ubicación en el mapa.</p>
              )}
            </>
          )}

          <div style={{ marginTop: "8px" }}>{accion}</div>
        </div>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "20px" },
  modal: { background: "white", borderRadius: "16px", padding: "24px", maxWidth: "380px", width: "100%", display: "flex", flexDirection: "column", gap: "8px", fontFamily: font, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
  modalTitle: { fontSize: "18px", color: "#222", margin: "0 0 4px" },
  modalLine: { fontSize: "13px", color: "#555", margin: 0 },
  modalHint: { fontSize: "12px", color: "#888", margin: 0 },
  modalPrimary: { padding: "12px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font, marginTop: "8px" },
  modalSecondary: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontFamily: font },
  error: { color: "#c0392b", fontSize: "13px", margin: 0 },
  container: { maxWidth: "600px", margin: "0 auto", fontFamily: font },
  backButton: { margin: "16px 0 0 16px", padding: "8px 14px", background: "none", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", color: "#D3A47D", fontFamily: font },
  content: { padding: "20px" },
  badge: { display: "inline-block", background: "#D3A47D", color: "white", fontSize: "12px", padding: "4px 12px", borderRadius: "12px", marginBottom: "10px" },
  title: { fontSize: "24px", color: "#222", margin: "0 0 16px 0" },
  infoBox: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px", background: "white", borderRadius: "10px", padding: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  info: { fontSize: "14px", color: "#555", margin: 0 },
  sectionTitle: { fontSize: "16px", color: "#333", margin: "0 0 8px" },
  description: { fontSize: "14px", color: "#555", lineHeight: "1.6", margin: "0 0 16px" },
  hint: { fontSize: "13px", color: "#888", margin: "0 0 16px" },
  directions: { display: "inline-block", margin: "10px 0 22px", color: "#D3A47D", fontWeight: "bold", fontSize: "14px" },
  reservedBox: { background: "#e6f4ea", color: "#1e7e34", borderRadius: "10px", padding: "14px", fontSize: "14px" },
  linkBtn: { background: "none", border: "none", color: "#1e7e34", fontWeight: "bold", cursor: "pointer", textDecoration: "underline", fontFamily: font },
  joinButton: { width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontSize: "16px", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  joinDisabled: { width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: "#ddd", color: "#888", fontSize: "16px", fontWeight: "bold", cursor: "not-allowed", fontFamily: font },
  previewBanner: { margin: "12px 16px 0", background: "#fff3cd", color: "#997404", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" },
  instrucciones: { background: "#fff8e6", border: "1px solid #f0d9a0", borderRadius: "8px", padding: "10px 12px", fontSize: "13px", color: "#6b5a2a", marginBottom: "12px" },
  instruccionesTexto: { margin: "6px 0 0", whiteSpace: "pre-line", lineHeight: "1.5" },
};

export default DetalleEvento;