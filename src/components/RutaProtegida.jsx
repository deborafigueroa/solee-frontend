import { Navigate } from "react-router-dom";

function RutaProtegida({ children, rol }) {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  if (!token || !usuario) return <Navigate to="/" replace />;
  if (rol && usuario.rol !== rol) return <Navigate to="/home" replace />;

  return children;
}

export default RutaProtegida;