import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api/axiosConfig";

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
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Cargando...</p>;
  }

  if (error || !evento) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>{error || "Evento no encontrado."}</p>;
  }

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

          <div style={styles.infoRow}>
            <p style={styles.info}>
              📅 {new Date(evento.fechaInicio).toLocaleDateString("es-CL")} · {evento.horario}
            </p>
            <p style={styles.info}>📍 {evento.direccionTexto}</p>
            <p style={styles.info}>👥 {evento.cuposDisponibles} cupos disponibles</p>
            <p style={styles.info}>💰 {evento.precio === 0 ? "Gratis" : `$${evento.precio} CLP`}</p>
            <p style={styles.info}>🎯 Nivel: {evento.nivel}</p>
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