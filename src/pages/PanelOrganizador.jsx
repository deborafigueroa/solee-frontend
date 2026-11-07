import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api/axiosConfig";

function PanelOrganizador() {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await api.get("/actividades/mis-actividades");
        setActividades(response.data.actividades);
      } catch (err) {
        setError("No se pudieron cargar tus actividades.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const cambiarEstado = async (act) => {
    setAviso("");
    const nuevoEstado = act.estado === "activa" ? "pausada" : "activa";
    try {
      const { data } = await api.put(`/actividades/${act._id}`, { estado: nuevoEstado });
      setActividades(actividades.map((a) => (a._id === act._id ? data : a)));
    } catch (err) {
      setAviso(err.response?.data?.mensaje || "No se pudo cambiar el estado.");
    }
  };

  const eliminar = async (act) => {
    setAviso("");
    if (!window.confirm(`¿Eliminar "${act.titulo}"? Dejará de mostrarse en la plataforma.`)) return;
    try {
      await api.delete(`/actividades/${act._id}`);
      setActividades(actividades.filter((a) => a._id !== act._id));
    } catch (err) {
      setAviso(err.response?.data?.mensaje || "No se pudo eliminar la actividad.");
    }
  };

  const cuposTotales = actividades.reduce((acc, a) => acc + a.cupoMaximo, 0);
  const cuposReservados = actividades.reduce((acc, a) => acc + (a.cupoMaximo - a.cuposDisponibles), 0);
  const ocupacion = cuposTotales > 0 ? Math.round((cuposReservados / cuposTotales) * 100) : 0;

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>Mis Actividades</h1>
          <button style={styles.newButton} onClick={() => navigate("/nueva-actividad")}>
            + Nueva Actividad
          </button>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{actividades.length}</p>
            <p style={styles.statLabel}>Actividades publicadas</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{cuposReservados}</p>
            <p style={styles.statLabel}>Cupos reservados</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{ocupacion}%</p>
            <p style={styles.statLabel}>Tasa de ocupación</p>
          </div>
        </div>

        {cargando && <p style={styles.msg}>Cargando tus actividades...</p>}
        {error && <p style={styles.msg}>{error}</p>}
        {aviso && <p style={styles.aviso}>{aviso}</p>}
        {!cargando && !error && actividades.length === 0 && (
          <p style={styles.msg}>Aún no has publicado actividades. Crea la primera con el botón de arriba.</p>
        )}

        <div style={styles.list}>
          {actividades.map((act) => (
            <div key={act._id} style={styles.card}>
              <div style={styles.cardInfoBox}>
                <h3 style={styles.cardTitle}>{act.titulo}</h3>
                <p style={styles.cardInfo}>
                  {act.cupoMaximo - act.cuposDisponibles} / {act.cupoMaximo} cupos reservados ·{" "}
                  {new Date(act.fechaInicio).toLocaleDateString("es-CL")}
                </p>
              </div>
              <div style={styles.actions}>
                <span style={act.estado === "activa" ? styles.badgeActive : styles.badgePaused}>
                  {act.estado}
                </span>
                <button style={styles.btn} onClick={() => navigate(`/editar-actividad/${act._id}`)}>Editar</button>
                <button style={styles.btn} onClick={() => cambiarEstado(act)}>
                  {act.estado === "activa" ? "Pausar" : "Reactivar"}
                </button>
                <button style={styles.btnDanger} onClick={() => eliminar(act)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  container: { maxWidth: "760px", margin: "0 auto", padding: "20px", fontFamily: font },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title: { fontSize: "22px", color: "#222", margin: 0 },
  newButton: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  statsRow: { display: "flex", gap: "12px", marginBottom: "24px" },
  statCard: { flex: 1, background: "white", borderRadius: "10px", padding: "16px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" },
  statNumber: { fontSize: "24px", fontWeight: "bold", color: "#D3A47D", margin: "0 0 4px 0" },
  statLabel: { fontSize: "12px", color: "#666", margin: 0 },
  msg: { textAlign: "center", color: "#888", marginTop: "30px" },
  aviso: { textAlign: "center", color: "#c0392b", fontSize: "13px" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "white", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" },
  cardInfoBox: { flex: 1, minWidth: "200px" },
  cardTitle: { fontSize: "15px", margin: "0 0 6px 0", color: "#222" },
  cardInfo: { fontSize: "13px", color: "#666", margin: 0 },
  actions: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  btn: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", cursor: "pointer", fontSize: "12px", fontFamily: font },
  btnDanger: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #c0392b", background: "white", color: "#c0392b", cursor: "pointer", fontSize: "12px", fontFamily: font },
  badgeActive: { background: "#e6f4ea", color: "#1e7e34", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
  badgePaused: { background: "#fff3cd", color: "#997404", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
};

export default PanelOrganizador;