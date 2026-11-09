import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosConfig";
import Estrellas from "./Estrellas";
import ModalResena from "./ModalResena";

const fecha = (iso) =>
  new Date(iso).toLocaleDateString("es-CL", {
    day: "numeric", month: "long", year: "numeric", timeZone: "America/Santiago",
  });

function ResenasActividad({ actividadId, titulo }) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [abierto, setAbierto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get(`/resenas/actividad/${actividadId}`);
      setDatos(data);
      setError("");
    } catch (e) {
      setError("No se pudieron cargar las reseñas.");
    }
  }, [actividadId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) return <p style={styles.vacio}>{error}</p>;
  if (!datos) return null;

  return (
    <div>
      <h3 style={styles.title}>Reseñas</h3>

      {datos.total > 0 ? (
        <p style={styles.resumen}>
          <Estrellas valor={datos.promedio} tamano={18} /> <strong>{datos.promedio}</strong> de 5 ·{" "}
          {datos.total} {datos.total === 1 ? "reseña" : "reseñas"}
        </p>
      ) : (
        <p style={styles.vacio}>Aún no hay reseñas.</p>
      )}

      {datos.puedeResenar && (
        <button style={styles.boton} onClick={() => setAbierto(true)}>
          {datos.miResena ? "Editar mi reseña" : "Dejar una reseña"}
        </button>
      )}

      <div style={styles.lista}>
        {datos.resenas.map((r) => (
          <div key={r._id} style={styles.tarjeta}>
            <div style={styles.cabecera}>
              <strong style={styles.autor}>{r.autor}</strong>
              <Estrellas valor={r.calificacion} tamano={14} />
            </div>
            {r.comentario && <p style={styles.comentario}>{r.comentario}</p>}
            <p style={styles.fecha}>{fecha(r.creadoEn)}</p>
          </div>
        ))}
      </div>

      {abierto && (
        <ModalResena
          actividadId={actividadId}
          titulo={titulo}
          inicial={datos.miResena}
          alGuardar={() => {
            setAbierto(false);
            cargar();
          }}
          alCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  title: { fontSize: "16px", color: "#333", margin: "0 0 8px", fontFamily: font },
  resumen: { fontSize: "14px", color: "#555", margin: "0 0 12px", fontFamily: font },
  vacio: { fontSize: "13px", color: "#888", margin: "0 0 12px", fontFamily: font },
  boton: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", fontWeight: "bold", cursor: "pointer", fontFamily: font, marginBottom: "14px" },
  lista: { display: "flex", flexDirection: "column", gap: "10px" },
  tarjeta: { background: "white", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", fontFamily: font },
  cabecera: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  autor: { fontSize: "13px", color: "#222" },
  comentario: { fontSize: "13px", color: "#555", lineHeight: "1.5", margin: "8px 0 0", whiteSpace: "pre-line" },
  fecha: { fontSize: "11px", color: "#999", margin: "8px 0 0" },
};

export default ResenasActividad;