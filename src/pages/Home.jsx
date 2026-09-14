import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { mockEvents } from "../data/mockEvents";

const categorias = ["Todas", "Arte", "Música", "Talleres", "Cine"];

function Home() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");

  const eventosFiltrados = mockEvents.filter((evento) => {
    const coincideTexto = evento.titulo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todas" || evento.categoria === categoriaActiva;
    return coincideTexto && coincideCategoria;
  });

  return (
    <>
    <Header />
    <div style={styles.container}>
        <p style={styles.tagline}>Experiencias culturales y comunitarias cerca de ti</p>

      <input
        style={styles.searchInput}
        type="text"
        placeholder="Buscar actividades..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

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

      {eventosFiltrados.length === 0 ? (
        <p style={styles.noResults}>Sin actividades disponibles con estos filtros.</p>
      ) : (
        <div style={styles.grid}>
          {eventosFiltrados.map((evento) => (
            <div
              key={evento.id}
              style={styles.card}
              onClick={() => navigate(`/evento/${evento.id}`)}
            >
              <img src={evento.imagen} alt={evento.titulo} style={styles.image} />
              <div style={styles.cardBody}>
                <span style={styles.badge}>{evento.categoria}</span>
                <h3 style={styles.cardTitle}>{evento.titulo}</h3>
                <p style={styles.cardInfo}>📅 {evento.fecha} · {evento.hora}</p>
                <p style={styles.cardInfo}>📍 {evento.ubicacion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
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
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  logo: {
    color: "#D3A47D",
    fontSize: "32px",
    marginBottom: "4px",
  },
  tagline: {
    color: "#666",
    fontSize: "14px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "15px",
    marginBottom: "14px",
    boxSizing: "border-box",
  },
  chips: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
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
  noResults: {
    textAlign: "center",
    color: "#888",
    marginTop: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  card: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    background: "white",
  },
  image: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
  },
  cardBody: {
    padding: "14px",
  },
  badge: {
    display: "inline-block",
    background: "#D3A47D",
    color: "white",
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "12px",
    marginBottom: "8px",
  },
  cardTitle: {
    fontSize: "16px",
    margin: "0 0 8px 0",
    color: "#222",
  },
  cardInfo: {
    fontSize: "13px",
    color: "#666",
    margin: "4px 0",
  },
};

export default Home;