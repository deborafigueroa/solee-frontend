import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api/axiosConfig";

const FILTROS = [
  ["todas", "Todas"],
  ["activa", "Activas"],
  ["borrador", "Borradores"],
  ["pausada", "Pausadas"],
];

const fechaCorta = (iso) =>
  new Date(iso).toLocaleDateString("es-CL", {
    day: "numeric", month: "short", year: "numeric", timeZone: "America/Santiago",
  });

const reservados = (a) => a.cupoMaximo - a.cuposDisponibles;

function PanelOrganizador() {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState([]);
  const [vistas, setVistas] = useState({ vistasTotales: 0, porActividad: {} });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [filtro, setFiltro] = useState("todas");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [respuesta, resumen] = await Promise.all([
          api.get("/actividades/mis-actividades"),
          api
            .get("/analiticas/organizador")
            .catch(() => ({ data: { vistasTotales: 0, porActividad: {} } })),
        ]);
        setActividades(respuesta.data.actividades);
        setVistas(resumen.data);
      } catch (err) {
        setError("No se pudieron cargar tus actividades.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const cambiarEstado = async (act, nuevoEstado) => {
    setMensaje(null);
    try {
      const { data } = await api.put(`/actividades/${act._id}`, { estado: nuevoEstado });
      setActividades(actividades.map((a) => (a._id === act._id ? data : a)));
      if (act.estado === "borrador") setMensaje({ tipo: "ok", texto: `"${act.titulo}" ya está publicada.` });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudo cambiar el estado." });
    }
  };

  const eliminar = async (act) => {
    setMensaje(null);
    const n = act.estado === "borrador" ? 0 : reservados(act);
    const aviso = n > 0 ? ` Tiene ${n} reserva${n === 1 ? "" : "s"} confirmada${n === 1 ? "" : "s"} que se cancelarán.` : "";
    if (!window.confirm(`¿Eliminar "${act.titulo}"? Dejará de mostrarse en la plataforma.${aviso}`)) return;
    try {
      const { data } = await api.delete(`/actividades/${act._id}`);
      setActividades(actividades.filter((a) => a._id !== act._id));
      setMensaje({
        tipo: "ok",
        texto: data.reservasCanceladas > 0
          ? `Actividad eliminada. Se cancelaron ${data.reservasCanceladas} reservas.`
          : "Actividad eliminada.",
      });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudo eliminar la actividad." });
    }
  };

  const publicadas = actividades.filter((a) => a.estado !== "borrador");
  const cuposTotales = publicadas.reduce((acc, a) => acc + a.cupoMaximo, 0);
  const cuposReservados = publicadas.reduce((acc, a) => acc + reservados(a), 0);
  const ocupacion = cuposTotales > 0 ? Math.round((cuposReservados / cuposTotales) * 100) : 0;
  const nActivas = actividades.filter((a) => a.estado === "activa").length;

  const visibles = filtro === "todas" ? actividades : actividades.filter((a) => a.estado === filtro);

  const estiloEstado = (estado) =>
    estado === "activa" ? styles.badgeActive : estado === "borrador" ? styles.badgeDraft : styles.badgePaused;

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
            <p style={styles.statNumber}>{vistas.vistasTotales}</p>
            <p style={styles.statLabel}>Visualizaciones</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{cuposReservados}</p>
            <p style={styles.statLabel}>Reservas activas</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{ocupacion}%</p>
            <p style={styles.statLabel}>Tasa de ocupación</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{nActivas}</p>
            <p style={styles.statLabel}>Actividades activas</p>
          </div>
        </div>

        <div style={styles.filtros}>
          {FILTROS.map(([valor, etiqueta]) => (
            <button
              key={valor}
              style={filtro === valor ? styles.filtroActivo : styles.filtro}
              onClick={() => setFiltro(valor)}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        {cargando && <p style={styles.msg}>Cargando tus actividades...</p>}
        {error && <p style={styles.msg}>{error}</p>}
        {mensaje && (
          <p style={mensaje.tipo === "ok" ? styles.avisoOk : styles.avisoError}>{mensaje.texto}</p>
        )}
        {!cargando && !error && visibles.length === 0 && (
          <p style={styles.msg}>
            {actividades.length === 0
              ? "Aún no has creado actividades. Crea la primera con el botón de arriba."
              : "No tienes actividades en esta categoría."}
          </p>
        )}

        <div style={styles.list}>
          {visibles.map((act) => {
            const res = reservados(act);
            const pct = act.cupoMaximo > 0 ? Math.round((res / act.cupoMaximo) * 100) : 0;
            const terminada = new Date(act.fechaFin) < new Date();
            const esBorrador = act.estado === "borrador";
            const nVistas = vistas.porActividad[act._id] || 0;

            return (
              <div key={act._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.cardInfoBox}>
                    <h3 style={styles.cardTitle}>{act.titulo}</h3>
                    <p style={styles.cardInfo}>
                      📅 {fechaCorta(act.fechaInicio)} · {act.disciplina}
                      {terminada && !esBorrador ? " · terminada" : ""}
                    </p>
                  </div>
                  <span style={estiloEstado(act.estado)}>{act.estado}</span>
                </div>

                {esBorrador ? (
                  <p style={styles.draftNote}>Aún no es visible para el público. Revísala y publícala cuando esté lista.</p>
                ) : (
                  <div>
                    <div style={styles.barra}>
                      <div style={{ ...styles.barraRelleno, width: `${pct}%` }} />
                    </div>
                    <p style={styles.cupoTexto}>
                      {res} de {act.cupoMaximo} cupos reservados ·{" "}
                      {act.cuposDisponibles === 0 ? "agotada" : `${act.cuposDisponibles} disponibles`} · 👁{" "}
                      {nVistas} {nVistas === 1 ? "visualización" : "visualizaciones"}
                    </p>
                  </div>
                )}

                <div style={styles.actions}>
                  <button style={styles.btn} onClick={() => navigate(`/evento/${act._id}`)}>Ver como participante</button>
                  {!esBorrador && (
                    <button style={styles.btn} onClick={() => navigate(`/actividad/${act._id}/inscritos`)}>
                      Ver inscritos ({res})
                    </button>
                  )}
                  <button style={styles.btn} onClick={() => navigate(`/editar-actividad/${act._id}`)}>Editar</button>
                  <button style={styles.btn} onClick={() => navigate(`/duplicar-actividad/${act._id}`)}>Duplicar</button>
                  {esBorrador ? (
                    <button style={styles.btnPrimary} onClick={() => cambiarEstado(act, "activa")}>Publicar</button>
                  ) : (
                    <button style={styles.btn} onClick={() => cambiarEstado(act, act.estado === "activa" ? "pausada" : "activa")}>
                      {act.estado === "activa" ? "Pausar" : "Reactivar"}
                    </button>
                  )}
                  <button style={styles.btnDanger} onClick={() => eliminar(act)}>Eliminar</button>
                </div>
              </div>
            );
          })}
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
  statsRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: "110px", background: "white", borderRadius: "10px", padding: "14px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" },
  statNumber: { fontSize: "22px", fontWeight: "bold", color: "#D3A47D", margin: "0 0 4px 0" },
  statLabel: { fontSize: "12px", color: "#666", margin: 0 },
  filtros: { display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" },
  filtro: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontSize: "13px", fontFamily: font },
  filtroActivo: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #D3A47D", background: "#D3A47D", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px", fontFamily: font },
  msg: { textAlign: "center", color: "#888", marginTop: "30px" },
  avisoOk: { textAlign: "center", color: "#1e7e34", fontSize: "13px" },
  avisoError: { textAlign: "center", color: "#c0392b", fontSize: "13px" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "white", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" },
  cardInfoBox: { flex: 1 },
  cardTitle: { fontSize: "15px", margin: "0 0 6px 0", color: "#222" },
  cardInfo: { fontSize: "13px", color: "#666", margin: 0 },
  barra: { height: "8px", borderRadius: "4px", background: "#eee", overflow: "hidden" },
  barraRelleno: { height: "100%", background: "#D3A47D" },
  cupoTexto: { fontSize: "12px", color: "#666", margin: "6px 0 0" },
  draftNote: { fontSize: "12px", color: "#888", margin: 0 },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap" },
  btn: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", cursor: "pointer", fontSize: "12px", fontFamily: font },
  btnPrimary: { padding: "6px 12px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "bold", fontFamily: font },
  btnDanger: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #c0392b", background: "white", color: "#c0392b", cursor: "pointer", fontSize: "12px", fontFamily: font },
  badgeActive: { background: "#e6f4ea", color: "#1e7e34", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
  badgePaused: { background: "#fff3cd", color: "#997404", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
  badgeDraft: { background: "#e8eaf6", color: "#3f51b5", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
};

export default PanelOrganizador;