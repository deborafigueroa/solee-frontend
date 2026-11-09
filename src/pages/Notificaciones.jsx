import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api/axiosConfig";
import { consultarEstado, activarNotificaciones, desactivarNotificaciones } from "../utils/notificaciones";

const DISCIPLINAS = ["música", "danza", "teatro", "artes visuales", "escritura", "fotografía", "cerámica", "tejido", "otros"];

function Notificaciones() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esParticipante = usuario?.rol === "participante";

  const [estado, setEstado] = useState(null);
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [intereses, setIntereses] = useState([]);
  const [guardados, setGuardados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    consultarEstado().then(setEstado);
    if (esParticipante) {
      api
        .get("/notificaciones/preferencias")
        .then(({ data }) => {
          setIntereses(data.intereses);
          setGuardados(data.intereses);
        })
        .catch(() => setMensaje({ tipo: "error", texto: "No se pudieron cargar tus preferencias." }));
    }
  }, []);

  const activar = async () => {
    setTrabajando(true);
    setMensaje(null);
    try {
      await activarNotificaciones(usuario.id);
      setEstado(await consultarEstado());
      setMensaje({ tipo: "ok", texto: "Notificaciones activadas en este dispositivo." });
    } catch (err) {
      setEstado(await consultarEstado());
      setMensaje({ tipo: "error", texto: err.message || "No se pudieron activar las notificaciones." });
    } finally {
      setTrabajando(false);
    }
  };

  const desactivar = async () => {
    setTrabajando(true);
    setMensaje(null);
    try {
      await desactivarNotificaciones();
      setEstado(await consultarEstado());
      setMensaje({ tipo: "ok", texto: "Notificaciones desactivadas en este dispositivo." });
    } catch (err) {
      setMensaje({ tipo: "error", texto: "No se pudieron desactivar. Intenta de nuevo." });
    } finally {
      setTrabajando(false);
    }
  };

  const probar = async () => {
    setMensaje(null);
    try {
      await api.post("/notificaciones/prueba");
      setMensaje({ tipo: "ok", texto: "Enviamos una notificación de prueba. Debería llegar en unos segundos." });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudo enviar la prueba." });
    }
  };

  const alternar = (disciplina) =>
    setIntereses(intereses.includes(disciplina) ? intereses.filter((i) => i !== disciplina) : [...intereses, disciplina]);

  const guardarIntereses = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const { data } = await api.put("/notificaciones/intereses", { intereses });
      setIntereses(data.intereses);
      setGuardados(data.intereses);
      setMensaje({ tipo: "ok", texto: "Disciplinas guardadas." });
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudieron guardar las disciplinas." });
    } finally {
      setGuardando(false);
    }
  };

  const cambiaron = JSON.stringify([...intereses].sort()) !== JSON.stringify([...guardados].sort());

  return (
    <>
      <Header />
      <div style={styles.container}>
        <button style={styles.back} onClick={() => navigate(-1)}>← Volver</button>
        <h1 style={styles.title}>Notificaciones</h1>

        {mensaje && <p style={mensaje.tipo === "ok" ? styles.ok : styles.error}>{mensaje.texto}</p>}

        <div style={styles.card}>
          <h2 style={styles.h2}>En este dispositivo</h2>

          {!estado && <p style={styles.text}>Revisando...</p>}

          {estado && !estado.soportado && (
            <p style={styles.text}>
              Este navegador o dispositivo no permite notificaciones push. En iPhone y iPad solo funcionan si
              instalas Solee en la pantalla de inicio.
            </p>
          )}

          {estado && estado.soportado && estado.permiso === "denied" && (
            <p style={styles.error}>
              Las notificaciones están bloqueadas en este navegador. Para habilitarlas, toca el candado junto a la
              dirección del sitio, entra a la configuración del sitio y permite "Notificaciones". Luego recarga la
              página.
            </p>
          )}

          {estado && estado.soportado && estado.permiso !== "denied" && !estado.activo && (
            <>
              <p style={styles.text}>
                {esParticipante
                  ? "Recibe avisos de actividades nuevas en tus disciplinas, de tus reservas y de cambios en las actividades en que estás inscrito."
                  : "Recibe avisos cuando alguien reserve una de tus actividades."}
              </p>
              <button style={styles.primary} onClick={activar} disabled={trabajando}>
                {trabajando ? "Activando..." : "Activar notificaciones"}
              </button>
            </>
          )}

          {estado && estado.activo && (
            <>
              <p style={styles.okText}>✅ Las notificaciones están activas en este dispositivo.</p>
              <div style={styles.row}>
                <button style={styles.secondary} onClick={probar}>Enviar notificación de prueba</button>
                <button style={styles.danger} onClick={desactivar} disabled={trabajando}>
                  {trabajando ? "Desactivando..." : "Desactivar"}
                </button>
              </div>
            </>
          )}
        </div>

        {esParticipante && (
          <div style={styles.card}>
            <h2 style={styles.h2}>Mis disciplinas de interés</h2>
            <p style={styles.text}>
              Te avisaremos cuando se publique una actividad de las disciplinas que marques. Sin disciplinas no
              recibirás avisos de actividades nuevas, pero sí los de tus reservas.
            </p>
            <div style={styles.chips}>
              {DISCIPLINAS.map((d) => (
                <button key={d} style={intereses.includes(d) ? styles.chipActive : styles.chip} onClick={() => alternar(d)}>
                  {d}
                </button>
              ))}
            </div>
            <button style={cambiaron ? styles.primary : styles.primaryOff} onClick={guardarIntereses} disabled={!cambiaron || guardando}>
              {guardando ? "Guardando..." : "Guardar disciplinas"}
            </button>
          </div>
        )}

        <p style={styles.privacy}>
          Para enviarte avisos guardamos un identificador de este dispositivo. Puedes desactivarlos cuando quieras.
        </p>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  container: { maxWidth: "640px", margin: "0 auto", padding: "20px", fontFamily: font },
  back: { padding: "8px 14px", background: "none", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", color: "#D3A47D", fontFamily: font },
  title: { fontSize: "22px", color: "#222", margin: "16px 0" },
  card: { background: "white", borderRadius: "12px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" },
  h2: { fontSize: "16px", color: "#333", margin: 0 },
  text: { fontSize: "13px", color: "#555", lineHeight: "1.6", margin: 0 },
  ok: { color: "#1e7e34", fontSize: "13px", margin: "0 0 12px" },
  okText: { color: "#1e7e34", fontSize: "14px", margin: 0 },
  error: { color: "#c0392b", fontSize: "13px", lineHeight: "1.6", margin: "0 0 12px" },
  row: { display: "flex", gap: "8px", flexWrap: "wrap" },
  chips: { display: "flex", gap: "8px", flexWrap: "wrap" },
  chip: { padding: "7px 14px", borderRadius: "20px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontSize: "13px", fontFamily: font },
  chipActive: { padding: "7px 14px", borderRadius: "20px", border: "1px solid #D3A47D", background: "#D3A47D", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px", fontFamily: font },
  primary: { padding: "12px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  primaryOff: { padding: "12px", borderRadius: "8px", border: "none", background: "#ddd", color: "#888", fontWeight: "bold", cursor: "not-allowed", fontFamily: font },
  secondary: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", cursor: "pointer", fontSize: "13px", fontFamily: font },
  danger: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #c0392b", background: "white", color: "#c0392b", cursor: "pointer", fontSize: "13px", fontFamily: font },
  privacy: { fontSize: "11px", color: "#999", textAlign: "center" },
};

export default Notificaciones;