import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <>
      <Header />
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/home")}>
          ← Volver
        </button>

        <div style={styles.content}>
          <span style={styles.badge}>{evento.disciplina}</span>
          <h1 style={styles.title}>{evento.titulo}</h1>

          <div style={styles.infoBox}>
            <p style={styles.info}>📅 <strong>{horario.fecha}</strong></p>
            <p style={styles.info}>🕒 {horario.horas} ({evento.horario})</p>
            <p style={styles.info}>
              {sinCupos ? "👥 Sin cupos disponibles" : `👥 ${evento.cuposDisponibles} de ${evento.cupoMaximo} cupos disponibles`}
            </p>
            <p style={styles.info}>💰 {evento.precio === 0 ? "Gratis" : `$${evento.precio} CLP`}</p>
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

          <button style={sinCupos ? styles.joinDisabled : styles.joinButton} disabled={sinCupos}>
            {sinCupos ? "Sin cupos" : "Quiero participar"}
          </button>
        </div>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
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
  joinButton: { width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontSize: "16px", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  joinDisabled: { width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: "#ddd", color: "#888", fontSize: "16px", fontWeight: "bold", cursor: "not-allowed", fontFamily: font },
};

export default DetalleEvento;