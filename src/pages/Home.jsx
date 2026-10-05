import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api/axiosConfig";

const categorias = ["Todas", "música", "danza", "teatro", "artes visuales", "escritura", "fotografía", "cerámica", "tejido", "otros"];
const niveles = ["", "principiante", "intermedio", "avanzado", "todos los niveles"];
const modalidades = ["", "presencial", "virtual", "híbrida"];
const horarios = ["", "mañana", "tarde", "noche", "fin de semana"];

function Home() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [nivel, setNivel] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [horario, setHorario] = useState("");
  const [soloGratis, setSoloGratis] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const filtrosActivos = [nivel, modalidad, horario, soloGratis].filter(Boolean).length;

  useEffect(() => {
    const buscarEventos = async () => {
      setCargando(true);
      setError("");
      try {
        const params = {};
        if (categoriaActiva !== "Todas") params.disciplina = categoriaActiva;
        if (nivel) params.nivel = nivel;
        if (modalidad) params.modalidad = modalidad;
        if (horario) params.horario = horario;
        if (soloGratis) params.precioMax = 0;

        const response = await api.get("/actividades", { params });
        setEventos(response.data.actividades);
      } catch (err) {
        setError("No se pudieron cargar las actividades. ¿Está el servidor corriendo?");
      } finally {
        setCargando(false);
      }
    };
    buscarEventos();
  }, [categoriaActiva, nivel, modalidad, horario, soloGratis]);

  const limpiarFiltros = () => {
    setNivel("");
    setModalidad("");
    setHorario("");
    setSoloGratis(false);
  };

  const eventosFiltrados = eventos.filter((evento) =>
    evento.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Header />
      <div style={styles.container}>
        <p style={styles.tagline}>Experiencias culturales y comunitarias cerca de ti</p>

        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Buscar actividades..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button style={styles.filterButton} onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
          </button>
        </div>

        {mostrarFiltros && (
          <div style={styles.filterPanel}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Nivel</label>
              <select style={styles.select} value={nivel} onChange={(e) => setNivel(e.target.value)}>
                {niveles.map((n) => (
                  <option key={n} value={n}>{n === "" ? "Todos" : n}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Modalidad</label>
              <select style={styles.select} value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
                {modalidades.map((m) => (
                  <option key={m} value={m}>{m === "" ? "Todas" : m}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Horario</label>
              <select style={styles.select} value={horario} onChange={(e) => setHorario(e.target.value)}>
                {horarios.map((h) => (
                  <option key={h} value={h}>{h === "" ? "Todos" : h}</option>
                ))}
              </select>
            </div>
            <label style={styles.checkRow}>
              <input type="checkbox" checked={soloGratis} onChange={(e) => setSoloGratis(e.target.checked)} />
              Solo actividades gratuitas
            </label>
            <button style={styles.clearButton} onClick={limpiarFiltros}>Limpiar filtros</button>
          </div>
        )}

        <div style={styles.chips}>
          {categorias.map((cat) => (
            <button
              key={cat}
              style={categoriaActiva === cat ? styles.chipActive : styles.chip}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {cargando && <p style={styles.noResults}>Cargando actividades...</p>}
        {error && <p style={styles.noResults}>{error}</p>}

        {!cargando && !error && eventosFiltrados.length === 0 && (
          <p style={styles.noResults}>Sin actividades disponibles con estos filtros.</p>
        )}

        <div style={styles.grid}>
          {eventosFiltrados.map((evento) => (
            <div
              key={evento._id}
              style={styles.card}
              onClick={() => navigate(`/evento/${evento._id}`)}
            >
              <div style={styles.cardBody}>
                <span style={styles.badge}>{evento.disciplina}</span>
                <h3 style={styles.cardTitle}>{evento.titulo}</h3>
                <p style={styles.cardInfo}>
                  📅 {new Date(evento.fechaInicio).toLocaleDateString("es-CL")} · {evento.horario}
                </p>
                <p style={styles.cardInfo}>📍 {evento.direccionTexto}</p>
                <p style={styles.cardInfo}>
                  💰 {evento.precio === 0 ? "Gratis" : `$${evento.precio} CLP`} · {evento.nivel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Poppins', Arial, sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f0eefc 0%, #f5f5f7 300px)",
  },
  tagline: { textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "20px" },
  searchRow: { display: "flex", gap: "10px", marginBottom: "14px" },
  searchInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  filterButton: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#F19195",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  filterPanel: {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  filterGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  filterLabel: { fontSize: "12px", color: "#666", fontWeight: "bold" },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  checkRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#444" },
  clearButton: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #D3A47D",
    background: "white",
    color: "#D3A47D",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  chips: { display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" },
  chip: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    background: "white",
    color: "#666",
    cursor: "pointer",
    fontSize: "13px",
  },
  chipActive: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #D3A47D",
    background: "#D3A47D",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
  },
  noResults: { textAlign: "center", color: "#888", marginTop: "40px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" },
  card: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    background: "white",
  },
  cardBody: { padding: "14px" },
  badge: {
    display: "inline-block",
    background: "#D3A47D",
    color: "white",
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "12px",
    marginBottom: "8px",
  },
  cardTitle: { fontSize: "16px", margin: "0 0 8px 0", color: "#222" },
  cardInfo: { fontSize: "13px", color: "#666", margin: "4px 0" },
};

export default Home;