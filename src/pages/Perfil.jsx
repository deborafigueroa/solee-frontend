import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../api/axiosConfig";

const DISCIPLINAS = ["música", "danza", "teatro", "artes visuales", "escritura", "fotografía", "cerámica", "tejido", "otros"];

const fechaSantiago = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CL", {
        day: "numeric", month: "long", year: "numeric", timeZone: "America/Santiago",
      })
    : "";

// La fecha de nacimiento se guarda a medianoche UTC: se muestra en UTC para que no se corra un día
const fechaUTC = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CL", {
        day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
      })
    : "";

const etiquetaRol = (perfil) =>
  perfil.rol === "organizador"
    ? perfil.tipoCuenta === "organizacion" ? "Organización" : "Organizador"
    : "Participante";

function Perfil() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [datos, setDatos] = useState({ nombre: "", telefono: "", comuna: "" });
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [mensajeDatos, setMensajeDatos] = useState(null);

  const [intereses, setIntereses] = useState([]);
  const [interesesGuardados, setInteresesGuardados] = useState([]);
  const [guardandoIntereses, setGuardandoIntereses] = useState(false);
  const [mensajeIntereses, setMensajeIntereses] = useState(null);

  const [clave, setClave] = useState({ actual: "", nueva: "", confirmar: "" });
  const [cambiandoClave, setCambiandoClave] = useState(false);
  const [mensajeClave, setMensajeClave] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get("/perfil");
        setPerfil(data);
        setDatos({ nombre: data.nombre, telefono: data.telefono, comuna: data.comuna });
        setIntereses(data.intereses);
        setInteresesGuardados(data.intereses);
      } catch (err) {
        setError("No se pudo cargar tu perfil.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const guardarDatos = async (e) => {
    e.preventDefault();
    setGuardandoDatos(true);
    setMensajeDatos(null);
    try {
      const { data } = await api.put("/perfil", datos);
      setPerfil(data);
      setDatos({ nombre: data.nombre, telefono: data.telefono, comuna: data.comuna });
      const actual = JSON.parse(localStorage.getItem("usuario") || "{}");
      localStorage.setItem("usuario", JSON.stringify({ ...actual, nombre: data.nombre }));
      setMensajeDatos({ tipo: "ok", texto: "Datos guardados." });
    } catch (err) {
      setMensajeDatos({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudieron guardar los datos." });
    } finally {
      setGuardandoDatos(false);
    }
  };

  const alternarInteres = (d) =>
    setIntereses(intereses.includes(d) ? intereses.filter((i) => i !== d) : [...intereses, d]);

  const guardarIntereses = async () => {
    setGuardandoIntereses(true);
    setMensajeIntereses(null);
    try {
      const { data } = await api.put("/notificaciones/intereses", { intereses });
      setIntereses(data.intereses);
      setInteresesGuardados(data.intereses);
      setMensajeIntereses({ tipo: "ok", texto: "Disciplinas guardadas." });
    } catch (err) {
      setMensajeIntereses({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudieron guardar las disciplinas." });
    } finally {
      setGuardandoIntereses(false);
    }
  };

  const cambiarClave = async (e) => {
    e.preventDefault();
    setCambiandoClave(true);
    setMensajeClave(null);
    try {
      await api.put("/perfil/contrasena", clave);
      setClave({ actual: "", nueva: "", confirmar: "" });
      setMensajeClave({ tipo: "ok", texto: "Contraseña actualizada." });
    } catch (err) {
      setMensajeClave({ tipo: "error", texto: err.response?.data?.mensaje || "No se pudo cambiar la contraseña." });
    } finally {
      setCambiandoClave(false);
    }
  };

  if (cargando) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "40px" }}>Cargando...</p>
      </>
    );
  }

  if (error || !perfil) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "40px" }}>{error || "No se pudo cargar tu perfil."}</p>
      </>
    );
  }

  const esParticipante = perfil.rol === "participante";
  const interesesCambiaron =
    JSON.stringify([...intereses].sort()) !== JSON.stringify([...interesesGuardados].sort());
  const mensaje = (m) => m && <p style={m.tipo === "ok" ? styles.ok : styles.error}>{m.texto}</p>;

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.cabecera}>
          <span style={styles.avatar}>{perfil.nombre.trim().charAt(0).toUpperCase()}</span>
          <div>
            <h1 style={styles.nombre}>{perfil.nombre}</h1>
            <span style={styles.rol}>{etiquetaRol(perfil)}</span>
            <p style={styles.desde}>Miembro desde el {fechaSantiago(perfil.miembroDesde)}</p>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>Datos de la cuenta</h2>
          <dl style={styles.lista}>
            <dt style={styles.dt}>Correo</dt>
            <dd style={styles.dd}>{perfil.email}</dd>
            <dt style={styles.dt}>{perfil.tipoCuenta === "organizacion" ? "RUT de la organización" : "RUT"}</dt>
            <dd style={styles.dd}>{perfil.rut || "No registrado"}</dd>
            {perfil.fechaNacimiento && (
              <>
                <dt style={styles.dt}>Fecha de nacimiento</dt>
                <dd style={styles.dd}>{fechaUTC(perfil.fechaNacimiento)}</dd>
              </>
            )}
            {perfil.consentimiento && (
              <>
                <dt style={styles.dt}>Tratamiento de datos aceptado el</dt>
                <dd style={styles.dd}>{fechaSantiago(perfil.consentimiento)}</dd>
              </>
            )}
          </dl>
          <p style={styles.nota}>Estos datos no se pueden editar desde aquí.</p>
        </div>

        <form style={styles.card} onSubmit={guardarDatos}>
          <h2 style={styles.h2}>Mis datos</h2>
          <label style={styles.label}>
            {perfil.tipoCuenta === "organizacion" ? "Nombre de la organización" : "Nombre completo"}
            <input
              style={styles.input}
              value={datos.nombre}
              maxLength={100}
              required
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
            />
          </label>
          <label style={styles.label}>
            Teléfono (opcional)
            <input
              style={styles.input}
              value={datos.telefono}
              placeholder="+56 9 1234 5678"
              onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
            />
          </label>
          <label style={styles.label}>
            Comuna (opcional)
            <input
              style={styles.input}
              value={datos.comuna}
              maxLength={60}
              onChange={(e) => setDatos({ ...datos, comuna: e.target.value })}
            />
          </label>
          {mensaje(mensajeDatos)}
          <button type="submit" style={styles.primary} disabled={guardandoDatos}>
            {guardandoDatos ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {esParticipante && (
          <div style={styles.card}>
            <h2 style={styles.h2}>Disciplinas de interés</h2>
            <p style={styles.texto}>
              Te avisaremos cuando se publique una actividad de las disciplinas que marques, si tienes las
              notificaciones activadas.
            </p>
            <div style={styles.chips}>
              {DISCIPLINAS.map((d) => (
                <button
                  key={d}
                  type="button"
                  style={intereses.includes(d) ? styles.chipActive : styles.chip}
                  onClick={() => alternarInteres(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            {mensaje(mensajeIntereses)}
            <button
              type="button"
              style={interesesCambiaron ? styles.primary : styles.primaryOff}
              onClick={guardarIntereses}
              disabled={!interesesCambiaron || guardandoIntereses}
            >
              {guardandoIntereses ? "Guardando..." : "Guardar disciplinas"}
            </button>
          </div>
        )}

        <form style={styles.card} onSubmit={cambiarClave}>
          <h2 style={styles.h2}>Cambiar contraseña</h2>
          <label style={styles.label}>
            Contraseña actual
            <input
              style={styles.input}
              type="password"
              required
              value={clave.actual}
              onChange={(e) => setClave({ ...clave, actual: e.target.value })}
            />
          </label>
          <label style={styles.label}>
            Contraseña nueva (mínimo 8 caracteres, 1 mayúscula y 1 número)
            <input
              style={styles.input}
              type="password"
              required
              value={clave.nueva}
              onChange={(e) => setClave({ ...clave, nueva: e.target.value })}
            />
          </label>
          <label style={styles.label}>
            Repite la contraseña nueva
            <input
              style={styles.input}
              type="password"
              required
              value={clave.confirmar}
              onChange={(e) => setClave({ ...clave, confirmar: e.target.value })}
            />
          </label>
          {mensaje(mensajeClave)}
          <button type="submit" style={styles.primary} disabled={cambiandoClave}>
            {cambiandoClave ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>

        <div style={styles.enlaces}>
          <button style={styles.link} onClick={() => navigate("/notificaciones")}>Notificaciones</button>
          <button style={styles.link} onClick={() => navigate("/privacidad")}>Política de privacidad</button>
        </div>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  container: { maxWidth: "640px", margin: "0 auto", padding: "20px", fontFamily: font },
  cabecera: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" },
  avatar: { width: "64px", height: "64px", borderRadius: "50%", background: "#D3A47D", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", flexShrink: 0 },
  nombre: { fontSize: "20px", color: "#222", margin: "0 0 4px" },
  rol: { background: "#e8eaf6", color: "#3f51b5", padding: "3px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
  desde: { fontSize: "12px", color: "#888", margin: "6px 0 0" },
  card: { background: "white", borderRadius: "12px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px" },
  h2: { fontSize: "16px", color: "#333", margin: 0 },
  lista: { display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", margin: 0 },
  dt: { fontSize: "12px", color: "#888" },
  dd: { fontSize: "13px", color: "#333", margin: 0, wordBreak: "break-word" },
  nota: { fontSize: "11px", color: "#999", margin: 0 },
  label: { display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#666", fontWeight: "bold" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", fontFamily: font, boxSizing: "border-box", width: "100%", fontWeight: "normal" },
  texto: { fontSize: "13px", color: "#555", lineHeight: "1.6", margin: 0 },
  chips: { display: "flex", gap: "8px", flexWrap: "wrap" },
  chip: { padding: "7px 14px", borderRadius: "20px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontSize: "13px", fontFamily: font },
  chipActive: { padding: "7px 14px", borderRadius: "20px", border: "1px solid #D3A47D", background: "#D3A47D", color: "white", fontWeight: "bold", cursor: "pointer", fontSize: "13px", fontFamily: font },
  primary: { padding: "12px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  primaryOff: { padding: "12px", borderRadius: "8px", border: "none", background: "#ddd", color: "#888", fontWeight: "bold", cursor: "not-allowed", fontFamily: font },
  ok: { color: "#1e7e34", fontSize: "13px", margin: 0 },
  error: { color: "#c0392b", fontSize: "13px", margin: 0 },
  enlaces: { display: "flex", justifyContent: "center", gap: "20px", marginTop: "8px" },
  link: { background: "none", border: "none", color: "#D3A47D", fontWeight: "bold", cursor: "pointer", textDecoration: "underline", fontSize: "13px", fontFamily: font },
};

export default Perfil;