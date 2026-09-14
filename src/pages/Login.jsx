import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg1 from "../assets/bg1.jpg"
import bg2 from "../assets/bg2.jpg"
import bg3 from "../assets/bg3.jpg"


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
        if (tipoUsuario === "organizador") {
            navigate("/panel-organizador");
        } else {
            navigate("/home");
        }
    };

  return (
    <div style={styles.container}>
    <div style={styles.content}>
      <h1 style={styles.logo}>Solee</h1>
      <p style={styles.subtitle}>Descubre experiencias culturales y comunitarias en Santiago</p>

    <div style={styles.card}>
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

        
          <div style={styles.roleSelector}>
             <p style={styles.roleLabel}>
                {modo === "login" ? "Ingresar como:" : "Quiero registrarme como:"}
            </p>
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
        

        <button type="submit" style={styles.submitButton}>
          {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>
      </div>
    </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    backgroundImage: `linear-gradient(rgba(211,164,125,0.5), rgba(241,145,149,0.5)), url(${bg3})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Poppins', Arial, sans-serif",
    padding: "20px",
    },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  logo: {
    color: "white",
    textAlign: "center",
    fontSize: "36px",
    marginBottom: "4px",
  },
  subtitle: {
    textAlign: "center",
    color: "white",
    fontSize: "14px",
    marginBottom: "30px",
  },
  content: {
    maxWidth: "400px",
    width: "100%",
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
    borderBottom: "3px solid #D3A47D",
    color: "#D3A47D",
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
    border: "1px solid #D3A47D",
    background: "#D3A47D",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: "10px",
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

export default Login;