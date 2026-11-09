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
  const [pestana, setPestana] = useState("confirmada");
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
  const confirmadas = reservas.filter((r) => r.estado === "confirmada");
  const otras = reservas.filter((r) => r.estado !== "confirmada");
  const visibles = pestana === "confirmada" ? confirmadas : otras;
  const reservados = actividad.cupoMaximo - actividad.cuposDisponibles;
  const pct = actividad.cupoMaximo > 0 ? Math.round((reservados / actividad.cupoMaximo) * 100) : 0;

  const copiarCorreos = async () => {
    const correos = confirmadas.map((r) => r.participante?.email).filter(Boolean);
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
        <p style={styles.sub}>Empieza el {formatoFecha(actividad.fechaInicio)} h</p>

        <div style={styles.cupos}>
          <div style={styles.barra}>
            <div style={{ ...styles.barraRelleno, width: `${pct}%` }} />
          </div>
          <p style={styles.cupoTexto}>
            {reservados} de {actividad.cupoMaximo} cupos reservados ·{" "}
            {actividad.cuposDisponibles === 0 ? "agotada" : `${actividad.cuposDisponibles} disponibles`}
          </p>
        </div>

        <div style={styles.tabs}>
          <button style={pestana === "confirmada" ? styles.tabActive : styles.tab} onClick={() => setPestana("confirmada")}>
            Confirmadas ({confirmadas.length})
          </button>
          <button style={pestana === "otras" ? styles.tabActive : styles.tab} onClick={() => setPestana("otras")}>
            Canceladas y otras ({otras.length})
          </button>
          {pestana === "confirmada" && confirmadas.length > 0 && (
            <button style={styles.copy} onClick={copiarCorreos}>
              {copiado ? "Correos copiados" : "Copiar correos"}
            </button>
          )}
        </div>

        {visibles.length === 0 ? (
          <p style={styles.msg}>
            {pestana === "confirmada" ? "Todavía no hay reservas confirmadas." : "No hay reservas en esta categoría."}
          </p>
        ) : (
          <div style={styles.list}>
            {visibles.map((r) => (
              <div key={r._id} style={styles.row}>
                <div>
                  <p style={styles.nombre}>{r.participante?.nombre || "Usuario no disponible"}</p>
                  <p style={styles.email}>{r.participante?.email || ""}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={r.estado === "confirmada" ? styles.badgeOk : styles.badgeOff}>{r.estado}</span>
                  <p style={styles.fecha}>Reservó el {formatoFecha(r.creadoEn)} h</p>
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
  cupos: { background: "white", borderRadius: "10px", padding: "14px", marginBottom: "16px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  barra: { height: "8px", borderRadius: "4px", background: "#eee", overflow: "hidden" },
  barraRelleno: { height: "100%", background: "#D3A47D" },
  cupoTexto: { fontSize: "12px", color: "#666", margin: "6px 0 0" },
  tabs: { display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" },
  tab: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontSize: "13px", fontFamily: font },
  tabActive: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #F19195", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px", fontFamily: font },
  copy: { marginLeft: "auto", padding: "7px 14px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", cursor: "pointer", fontSize: "12px", fontFamily: font },
  msg: { textAlign: "center", color: "#888", marginTop: "30px" },
  list: { display: "flex", flexDirection: "column", gap: "8px" },
  row: { background: "white", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", gap: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" },
  nombre: { margin: 0, fontSize: "14px", color: "#222", fontWeight: "bold" },
  email: { margin: "2px 0 0", fontSize: "12px", color: "#666" },
  fecha: { margin: "4px 0 0", fontSize: "11px", color: "#888" },
  badgeOk: { background: "#e6f4ea", color: "#1e7e34", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" },
  badgeOff: { background: "#eee", color: "#777", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" },
  privacy: { fontSize: "11px", color: "#999", marginTop: "20px", textAlign: "center" },
};

export default ReservasActividad;