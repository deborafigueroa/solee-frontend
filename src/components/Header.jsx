import { useNavigate } from "react-router-dom";
import { quitarDispositivoActual } from "../utils/notificaciones";

function Header() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const cerrarSesion = async () => {
    try {
      await quitarDispositivoActual();
    } catch (e) {
      // Si falla, la sesión se cierra igual
    }
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const irAlInicio = () => {
    navigate(usuario?.rol === "organizador" ? "/panel-organizador" : "/home");
  };

  return (
    <div style={styles.header}>
      {usuario?.rol === "participante" && (
        <button style={styles.reservas} onClick={() => navigate("/mis-reservas")}>Mis reservas</button>
      )}
      <span style={styles.logo} onClick={irAlInicio}>Solee</span>
      {usuario && (
        <div style={styles.user}>
          <button style={styles.bell} onClick={() => navigate("/notificaciones")} title="Notificaciones">🔔</button>
          <span style={styles.userName}>{usuario.nombre.split(" ")[0]}</span>
          <button style={styles.logout} onClick={cerrarSesion}>Salir</button>
        </div>
      )}
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  header: {
    position: "relative",
    padding: "18px 20px",
    background: "linear-gradient(135deg, #D3A47D, #F19195)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { color: "white", fontSize: "22px", fontWeight: "700", fontFamily: font, letterSpacing: "1px", cursor: "pointer" },
  reservas: { position: "absolute", left: "16px", background: "rgba(255,255,255,0.25)", border: "none", color: "white", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontFamily: font, fontSize: "12px" },
  user: { position: "absolute", right: "16px", display: "flex", alignItems: "center", gap: "8px" },
  bell: { background: "rgba(255,255,255,0.25)", border: "none", borderRadius: "8px", padding: "4px 8px", cursor: "pointer", fontSize: "14px" },
  userName: { color: "white", fontSize: "13px", fontFamily: font },
  logout: { background: "rgba(255,255,255,0.25)", border: "none", color: "white", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontFamily: font, fontSize: "12px" },
};

export default Header;