import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { mockEvents } from "../data/mockEvents";

function DetalleEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = mockEvents.find((e) => e.id === parseInt(id));

  if (!evento) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Evento no encontrado.</p>;
  }

  return (
    <>
    <Header />
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/home")}>
        ← Volver
      </button>

      <img src={evento.imagen} alt={evento.titulo} style={styles.image} />

      <div style={styles.content}>
        <span style={styles.badge}>{evento.categoria}</span>
        <h1 style={styles.title}>{evento.titulo}</h1>

        <div style={styles.infoRow}>
          <p style={styles.info}>📅 {evento.fecha} · {evento.hora}</p>
          <p style={styles.info}>📍 {evento.ubicacion}</p>
          <p style={styles.info}>👥 {evento.cupos} cupos disponibles</p>
          <p style={styles.info}>🏢 Organiza: {evento.organizador}</p>
        </div>

        <h3 style={styles.sectionTitle}>Descripción</h3>
        <p style={styles.description}>{evento.descripcion}</p>

        <button style={styles.joinButton}>Quiero participar</button>
      </div>
    </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  backButton: {
    margin: "16px 0 0 16px",
    padding: "8px 14px",
    background: "none",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#D3A47D",
  },
  image: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
  },
  content: {
    padding: "20px",
  },
  badge: {
    display: "inline-block",
    background: "#D3A47D",
    color: "white",
    fontSize: "12px",
    padding: "4px 12px",
    borderRadius: "12px",
    marginBottom: "10px",
  },
  title: {
    fontSize: "24px",
    color: "#222",
    margin: "0 0 16px 0",
  },
  infoRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "20px",
  },
  info: {
    fontSize: "14px",
    color: "#555",
    margin: 0,
  },
  sectionTitle: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "8px",
  },
  description: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  joinButton: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#F19195",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default DetalleEvento;