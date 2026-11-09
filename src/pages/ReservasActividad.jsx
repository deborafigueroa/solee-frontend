import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api/axiosConfig";

const formatoFecha = (iso) =>
  new Date(iso).toLocaleString("es-CL", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santiago",
  });

function ReservasActividad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [pestana, setPestana] = useState("inscritos");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get(`/reservas/actividad/${id}`);
        setDatos(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || "No se pudieron cargar las reservas.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "40px" }}>Cargando...</p>
      </>
    );
  }

  if (error || !datos) {
    return (
      <>
        <Header />
        <div style={styles.container}>
          <button style={styles.back} onClick={() => navigate("/panel-organizador")}>← Volver al panel</button>
          <p style={styles.msg}>{error}</p>
        </div>
      </>
    );
  }

  const { actividad, reservas } = datos;
  const inscritos = reservas.filter((r) => r.estado !== "cancelada");
  const canceladas = reservas.filter((r) => r.estado === "cancelada");
  const visibles = pestana === "inscritos" ? inscritos : canceladas;

  const reservados = actividad.cupoMaximo - actividad.cuposDisponibles;
  const pct = actividad.cupoMaximo > 0 ? Math.round((reservados / actividad.cupoMaximo) * 100) : 0;

  const yaComenzo = new Date(actividad.fechaInicio) <= new Date();
  const asistieron = inscritos.filter((r) => r.estado === "asistió").length;
  const noAsistieron = inscritos.filter((r) => r.estado === "no asistió").length;
  const sinMarcar = inscritos.filter((r) => r.estado === "confirmada").length;

  const marcar = async (reserva, estado) => {
    setAviso("");
    try {
      await api.put(`/reservas/${reserva._id}/asistencia`, { estado });
      setDatos((d) => ({
        ...d,
        reservas: d.reservas.map((r) => (r._id === reserva._id ? { ...r, estado } : r)),
      }));
    } catch (err) {
      setAviso(err.response?.data?.mensaje || "No se pudo registrar la asistencia.");
    }
  };

  const copiarCorreos = async () => {
    const correos = inscritos.map((r) => r.participante?.email).filter(Boolean);
    try {
      await navigator.clipboard.writeText(correos.join(", "));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (e) {
      window.alert(correos.join(", "));
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <button style={styles.back} onClick={() => navigate("/panel-organizador")}>← Volver al panel</button>
        <h1 style={styles.title}>{actividad.titulo}</h1>
        <p style={styles.sub}>
          {yaComenzo ? "Comenzó el" : "Empieza el"} {formatoFecha(actividad.fechaInicio)} h
        </p>

        <div style={styles.cupos}>
          <div style={styles.barra}>
            <div style={{ ...styles.barraRelleno, width: `${pct}%` }} />
          </div>
          <p style={styles.cupoTexto}>
            {reservados} de {actividad.cupoMaximo} cupos reservados ·{" "}
            {actividad.cuposDisponibles === 0 ? "agotada" : `${actividad.cuposDisponibles} disponibles`}
          </p>
          {yaComenzo && (
            <p style={styles.cupoTexto}>
              Asistieron {asistieron} · No asistieron {noAsistieron} · Sin marcar {sinMarcar}
            </p>
          )}
        </div>

        <p style={styles.nota}>
          {yaComenzo
            ? "Marca la asistencia de cada persona. Quienes asistieron podrán dejar una reseña de tu actividad."
            : "La asistencia se podrá marcar cuando comience la actividad."}
        </p>

        <div style={styles.tabs}>
          <button style={pestana === "inscritos" ? styles.tabActive : styles.tab} onClick={() => setPestana("inscritos")}>
            Inscritos ({inscritos.length})
          </button>
          <button style={pestana === "canceladas" ? styles.tabActive : styles.tab} onClick={() => setPestana("canceladas")}>
            Canceladas ({canceladas.length})
          </button>
          {pestana === "inscritos" && inscritos.length > 0 && (
            <button style={styles.copy} onClick={copiarCorreos}>
              {copiado ? "Correos copiados" : "Copiar correos"}
            </button>
          )}
        </div>

        {aviso && <p style={styles.aviso}>{aviso}</p>}

        {visibles.length === 0 ? (
          <p style={styles.msg}>
            {pestana === "inscritos" ? "Todavía no hay inscritos." : "No hay reservas canceladas."}
          </p>
        ) : (
          <div style={styles.list}>
            {visibles.map((r) => (
              <div key={r._id} style={styles.row}>
                <div style={{ flex: 1 }}>
                  <p style={styles.nombre}>{r.participante?.nombre || "Usuario no disponible"}</p>
                  <p style={styles.email}>{r.participante?.email || ""}</p>
                  <p style={styles.fecha}>Reservó el {formatoFecha(r.creadoEn)} h</p>
                </div>

                <div style={styles.derecha}>
                  <span style={r.estado === "asistió" ? styles.badgeOk : styles.badgeOff}>{r.estado}</span>
                  {pestana === "inscritos" && yaComenzo && (
                    <div style={styles.botones}>
                      <button
                        style={r.estado === "asistió" ? styles.btnActivo : styles.btn}
                        onClick={() => marcar(r, "asistió")}
                      >
                        Asistió
                      </button>
                      <button
                        style={r.estado === "no asistió" ? styles.btnActivoOff : styles.btn}
                        onClick={() => marcar(r, "no asistió")}
                      >
                        No asistió
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={styles.privacy}>
          Estos datos se entregan solo para coordinar la actividad. No los uses para otros fines.
        </p>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  container: { maxWidth: "700px", margin: "0 auto", padding: "20px", fontFamily: font },
  back: { padding: "8px 14px", background: "none", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", color: "#D3A47D", fontFamily: font },
  title: { fontSize: "22px", color: "#222", margin: "16px 0 4px" },
  sub: { fontSize: "13px", color: "#666", margin: "0 0 16px" },
  cupos: { background: "white", borderRadius: "10px", padding: "14px", marginBottom: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  barra: { height: "8px", borderRadius: "4px", background: "#eee", overflow: "hidden" },
  barraRelleno: { height: "100%", background: "#D3A47D" },
  cupoTexto: { fontSize: "12px", color: "#666", margin: "6px 0 0" },
  nota: { fontSize: "12px", color: "#888", margin: "0 0 14px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" },
  tab: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontSize: "13px", fontFamily: font },
  tabActive: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #F19195", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px", fontFamily: font },
  copy: { marginLeft: "auto", padding: "7px 14px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", cursor: "pointer", fontSize: "12px", fontFamily: font },
  msg: { textAlign: "center", color: "#888", marginTop: "30px" },
  aviso: { textAlign: "center", color: "#c0392b", fontSize: "13px" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: { background: "white", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  nombre: { margin: 0, fontSize: "14px", color: "#222", fontWeight: "bold" },
  email: { margin: "2px 0 0", fontSize: "12px", color: "#666" },
  fecha: { margin: "4px 0 0", fontSize: "11px", color: "#888" },
  derecha: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" },
  botones: { display: "flex", gap: "6px" },
  btn: { padding: "5px 10px", borderRadius: "8px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontSize: "12px", fontFamily: font },
  btnActivo: { padding: "5px 10px", borderRadius: "8px", border: "1px solid #1e7e34", background: "#1e7e34", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "bold", fontFamily: font },
  btnActivoOff: { padding: "5px 10px", borderRadius: "8px", border: "1px solid #777", background: "#777", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "bold", fontFamily: font },
  badgeOk: { background: "#e6f4ea", color: "#1e7e34", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" },
  badgeOff: { background: "#eee", color: "#777", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" },
  privacy: { fontSize: "11px", color: "#999", marginTop: "20px", textAlign: "center" },
};

export default ReservasActividad;