import { useNavigate } from "react-router-dom";
import { mockEvents } from "../data/mockEvents";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Solee</h1>
        <p style={styles.tagline}>Experiencias culturales y comunitarias cerca de ti</p>
      </header>

      <div style={styles.grid}>
        {mockEvents.map((evento) => (
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
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    color: "#534AB7",
    fontSize: "32px",
    marginBottom: "4px",
  },
  tagline: {
    color: "#666",
    fontSize: "14px",
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
    transition: "transform 0.15s",
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
    background: "#534AB7",
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