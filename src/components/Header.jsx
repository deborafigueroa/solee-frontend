import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  return (
    <div style={styles.header} onClick={() => navigate("/home")}>
      <span style={styles.logo}>Solee</span>
    </div>
  );
}

const styles = {
  header: {
    padding: "10px 18px",
    background: "linear-gradient(70deg, #D3A47D, #F19195)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    color: "white",
    fontSize: "30px",
    fontWeight: "700",
    fontFamily: "'Poppins', Arial, sans-serif",
    letterSpacing: "3px",
  },
};

export default Header;