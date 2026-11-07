import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import loginBg from "../assets/bg3.jpg";

const disciplinas = ["música", "danza", "teatro", "artes visuales", "escritura", "fotografía", "cerámica", "tejido", "otros"];

function Registro() {
  const navigate = useNavigate();
  const [rol, setRol] = useState("participante");
  const [tipoCuenta, setTipoCuenta] = useState("persona");
  const [form, setForm] = useState({
    nombre: "", rut: "", fechaNacimiento: "", telefono: "", comuna: "",
    email: "", password: "", confirmPassword: "",
  });
  const [intereses, setIntereses] = useState([]);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const esOrganizacion = rol === "organizador" && tipoCuenta === "organizacion";

  const hoy = new Date();
  const maxNacimiento = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate())
    .toISOString()
    .split("T")[0];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cambiarRol = (nuevoRol) => {
    setRol(nuevoRol);
    if (nuevoRol === "participante") setTipoCuenta("persona");
  };

  const toggleInteres = (d) =>
    setIntereses(intereses.includes(d) ? intereses.filter((i) => i !== d) : [...intereses, d]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar la política de privacidad para crear tu cuenta.");
      return;
    }

    const payload = {
      nombre: form.nombre,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      rol,
      tipoCuenta,
      rut: form.rut,
      telefono: form.telefono || undefined,
      comuna: form.comuna || undefined,
      intereses,
      aceptaTerminos,
    };
    if (!esOrganizacion) payload.fechaNacimiento = form.fechaNacimiento;

    setEnviando(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      navigate(data.usuario.rol === "organizador" ? "/panel-organizador" : "/home");
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error de conexión con el servidor");
    } finally {
      setEnviando(false);
    }
  };

  const campo = (label, input) => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {input}
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <h1 style={styles.logo}>Solee</h1>
        <p style={styles.subtitle}>Crea tu cuenta</p>

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <p style={styles.label}>Quiero registrarme como</p>
              <div style={styles.options}>
                <button type="button" style={rol === "participante" ? styles.optActive : styles.opt} onClick={() => cambiarRol("participante")}>
                  Participante
                </button>
                <button type="button" style={rol === "organizador" ? styles.optActive : styles.opt} onClick={() => cambiarRol("organizador")}>
                  Organizador
                </button>
              </div>
            </div>

            {rol === "organizador" && (
              <div>
                <p style={styles.label}>Tipo de cuenta</p>
                <div style={styles.options}>
                  <button type="button" style={tipoCuenta === "persona" ? styles.optActive : styles.opt} onClick={() => setTipoCuenta("persona")}>
                    Persona natural
                  </button>
                  <button type="button" style={tipoCuenta === "organizacion" ? styles.optActive : styles.opt} onClick={() => setTipoCuenta("organizacion")}>
                    Organización
                  </button>
                </div>
              </div>
            )}

            {campo(
              esOrganizacion ? "Nombre de la organización" : "Nombre completo",
              <input style={styles.input} name="nombre" required value={form.nombre} onChange={handleChange} />
            )}
            {campo(
              esOrganizacion ? "RUT de la organización" : "RUT",
              <input style={styles.input} name="rut" placeholder="12.345.678-5" required value={form.rut} onChange={handleChange} />
            )}
            {!esOrganizacion &&
              campo(
                "Fecha de nacimiento (mayores de 18 años)",
                <input style={styles.input} type="date" name="fechaNacimiento" max={maxNacimiento} required value={form.fechaNacimiento} onChange={handleChange} />
              )}

            <div style={styles.row}>
              {campo("Teléfono (opcional)", <input style={styles.input} name="telefono" placeholder="+56 9 1234 5678" value={form.telefono} onChange={handleChange} />)}
              {campo("Comuna (opcional)", <input style={styles.input} name="comuna" value={form.comuna} onChange={handleChange} />)}
            </div>

            <div>
              <p style={styles.label}>Intereses (opcional)</p>
              <div style={styles.chips}>
                {disciplinas.map((d) => (
                  <button key={d} type="button" style={intereses.includes(d) ? styles.chipActive : styles.chip} onClick={() => toggleInteres(d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {campo("Correo electrónico", <input style={styles.input} type="email" name="email" required value={form.email} onChange={handleChange} />)}
            {campo("Contraseña (mín. 8 caracteres, 1 mayúscula y 1 número)", <input style={styles.input} type="password" name="password" required value={form.password} onChange={handleChange} />)}
            {campo("Confirmar contraseña", <input style={styles.input} type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} />)}

            <label style={styles.check}>
              <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
              <span>
                He leído y acepto la{" "}
                <Link to="/privacidad" target="_blank" style={styles.link}>
                  política de privacidad y términos de uso
                </Link>
                , y autorizo el tratamiento de mis datos personales (Ley 19.628).
              </span>
            </label>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.submit} disabled={enviando}>
              {enviando ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <p style={styles.footer}>
              ¿Ya tienes cuenta? <Link to="/" style={styles.link}>Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    backgroundImage: `linear-gradient(rgba(211,164,125,0.5), rgba(241,145,149,0.5)), url(${loginBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex",
    justifyContent: "center",
    padding: "30px 16px",
    fontFamily: font,
  },
  content: { maxWidth: "460px", width: "100%" },
  logo: { color: "white", textAlign: "center", fontSize: "36px", margin: "0 0 4px 0", textShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  subtitle: { color: "white", textAlign: "center", fontSize: "14px", marginBottom: "20px", textShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  card: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  row: { display: "flex", gap: "12px" },
  label: { fontSize: "12px", color: "#666", fontWeight: "bold", margin: "0 0 4px 0" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", fontFamily: font, boxSizing: "border-box", width: "100%" },
  options: { display: "flex", gap: "10px" },
  opt: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontFamily: font },
  optActive: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #D3A47D", background: "#D3A47D", color: "white", cursor: "pointer", fontWeight: "bold", fontFamily: font },
  chips: { display: "flex", flexWrap: "wrap", gap: "6px" },
  chip: { padding: "6px 12px", borderRadius: "16px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontSize: "12px", fontFamily: font },
  chipActive: { padding: "6px 12px", borderRadius: "16px", border: "1px solid #D3A47D", background: "#D3A47D", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "bold", fontFamily: font },
  check: { display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#444", lineHeight: "1.5" },
  link: { color: "#D3A47D", fontWeight: "bold" },
  error: { color: "#c0392b", fontSize: "13px", margin: 0, textAlign: "center" },
  submit: { padding: "14px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontSize: "16px", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  footer: { textAlign: "center", fontSize: "13px", color: "#666", margin: 0 },
};

export default Registro;