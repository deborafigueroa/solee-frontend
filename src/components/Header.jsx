import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const irAlInicio = () => {
    navigate(usuario?.rol === "organizador" ? "/panel-organizador" : "/home");
  };

  return (
    <div style={styles.header}>
      <span style={styles.logo} onClick={irAlInicio}>Solee</span>
      {usuario && (
        <div style={styles.user}>
          <span style={styles.userName}>{usuario.nombre.split(" ")[0]}</span>
          <button style={styles.logout} onClick={cerrarSesion}>Salir</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    position: "relative",
    padding: "18px 20px",
    background: "linear-gradient(135deg, #D3A47D, #F19195)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    color: "white",
    fontSize: "22px",
    fontWeight: "700",
    fontFamily: "'Poppins', Arial, sans-serif",
    letterSpacing: "1px",
    cursor: "pointer",
  },
  user: {
    position: "absolute",
    right: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userName: {
    color: "white",
    fontSize: "13px",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  logout: {
    background: "rgba(255,255,255,0.25)",
    border: "none",
    color: "white",
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "'Poppins', Arial, sans-serif",
    fontSize: "12px",
  },
};

export default Header;