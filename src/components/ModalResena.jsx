import { useState } from "react";
import api from "../api/axiosConfig";

function ModalResena({ actividadId, titulo, inicial, alGuardar, alCerrar }) {
  const [calificacion, setCalificacion] = useState(inicial?.calificacion || 0);
  const [comentario, setComentario] = useState(inicial?.comentario || "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    if (calificacion < 1) {
      setError("Elige una calificación de 1 a 5 estrellas.");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      if (inicial?._id) {
        await api.put(`/resenas/${inicial._id}`, { calificacion, comentario });
      } else {
        await api.post("/resenas", { actividadId, calificacion, comentario });
      }
      alGuardar();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar la reseña.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>¿Cómo estuvo "{titulo}"?</h3>

        <div style={styles.estrellas}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              style={{ ...styles.estrella, color: n <= calificacion ? "#F5A623" : "#ccc" }}
              onClick={() => setCalificacion(n)}
              aria-label={`${n} estrellas`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          style={styles.textarea}
          maxLength={500}
          placeholder="Cuéntanos tu experiencia (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <p style={styles.contador}>{comentario.length}/500</p>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.primary} onClick={guardar} disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar reseña"}
        </button>
        <button style={styles.secondary} onClick={alCerrar}>Cancelar</button>
      </div>
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: "20px" },
  modal: { background: "white", borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "100%", display: "flex", flexDirection: "column", gap: "8px", fontFamily: font, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
  title: { fontSize: "16px", color: "#222", margin: 0 },
  estrellas: { display: "flex", gap: "4px", justifyContent: "center" },
  estrella: { background: "none", border: "none", fontSize: "34px", cursor: "pointer", padding: "0 2px" },
  textarea: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", fontFamily: font, minHeight: "90px", boxSizing: "border-box", width: "100%" },
  contador: { margin: 0, fontSize: "11px", color: "#888", textAlign: "right" },
  error: { color: "#c0392b", fontSize: "13px", margin: 0 },
  primary: { padding: "12px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  secondary: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontFamily: font },
};

export default ModalResena;