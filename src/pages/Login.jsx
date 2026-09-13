import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [modo, setModo] = useState("login"); // "login" o "registro"
  const [tipoUsuario, setTipoUsuario] = useState("participante");
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prototipo: sin backend aún, solo navegamos a Home
    navigate("/home");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.logo}>Solee</h1>
      <p style={styles.subtitle}>Descubre experiencias culturales y comunitarias en Santiago</p>

      <div style={styles.tabs}>
        <button
          style={modo === "login" ? styles.tabActive : styles.tab}
          onClick={() => setModo("login")}
        >
          Iniciar sesión
        </button>
        <button
          style={modo === "registro" ? styles.tabActive : styles.tab}
          onClick={() => setModo("registro")}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {modo === "registro" && (
          <input
            style={styles.input}
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChange={handleChange}
          />
        )}
        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
        />

        {modo === "registro" && (
          <div style={styles.roleSelector}>
            <p style={styles.roleLabel}>Quiero registrarme como:</p>
            <div style={styles.roleOptions}>
              <button
                type="button"
                style={tipoUsuario === "participante" ? styles.roleActive : styles.role}
                onClick={() => setTipoUsuario("participante")}
              >
                Participante
              </button>
              <button
                type="button"
                style={tipoUsuario === "organizador" ? styles.roleActive : styles.role}
                onClick={() => setTipoUsuario("organizador")}
              >
                Organizador
              </button>
            </div>
          </div>
        )}

        <button type="submit" style={styles.submitButton}>
          {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },
  logo: {
    color: "#534AB7",
    textAlign: "center",
    fontSize: "36px",
    marginBottom: "4px",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
    marginBottom: "30px",
  },
  tabs: {
    display: "flex",
    marginBottom: "24px",
    borderBottom: "1px solid #ddd",
  },
  tab: {
    flex: 1,
    padding: "12px",
    background: "none",
    border: "none",
    borderBottom: "3px solid transparent",
    color: "#999",
    cursor: "pointer",
    fontSize: "15px",
  },
  tabActive: {
    flex: 1,
    padding: "12px",
    background: "none",
    border: "none",
    borderBottom: "3px solid #534AB7",
    color: "#534AB7",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
  },
  roleSelector: {
    marginTop: "4px",
  },
  roleLabel: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "8px",
  },
  roleOptions: {
    display: "flex",
    gap: "10px",
  },
  role: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "white",
    color: "#666",
    cursor: "pointer",
  },
  roleActive: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #534AB7",
    background: "#534AB7",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "#6B1C2E",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Login;