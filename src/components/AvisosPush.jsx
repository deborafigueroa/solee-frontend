import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onMessage } from "firebase/messaging";
import { obtenerMessaging, pushSoportado } from "../firebase";
import { registrarDispositivoSilencioso } from "../utils/notificaciones";

function AvisosPush() {
  const navigate = useNavigate();
  const location = useLocation();
  const registradoPara = useRef(null);
  const [aviso, setAviso] = useState(null);

  // Mantiene registrado el dispositivo de quien lo activó
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!token || !usuario) {
      registradoPara.current = null;
      return;
    }
    if (registradoPara.current === usuario.id) return;
    registradoPara.current = usuario.id;
    registrarDispositivoSilencioso(usuario.id).catch(() => {});
  }, [location.pathname]);

  // Avisos mientras la página está abierta
  useEffect(() => {
    let cancelado = false;
    let cancelarSuscripcion = null;

    (async () => {
      if (!(await pushSoportado()) || cancelado) return;
      cancelarSuscripcion = onMessage(obtenerMessaging(), (payload) => {
        if (!localStorage.getItem("token")) return;
        const d = payload.data || {};
        setAviso({ titulo: d.titulo || "Solee", cuerpo: d.cuerpo || "", url: d.url || "/home" });
      });
    })();

    return () => {
      cancelado = true;
      if (cancelarSuscripcion) cancelarSuscripcion();
    };
  }, []);

  // El aviso se cierra solo
  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(null), 9000);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  if (!aviso) return null;

  return (
    <div style={styles.toast}>
      <p style={styles.titulo}>🔔 {aviso.titulo}</p>
      <p style={styles.cuerpo}>{aviso.cuerpo}</p>
      <div style={styles.botones}>
        <button
          style={styles.ver}
          onClick={() => {
            navigate(aviso.url);
            setAviso(null);
          }}
        >
          Ver
        </button>
        <button style={styles.cerrar} onClick={() => setAviso(null)}>Cerrar</button>
      </div>
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  toast: { position: "fixed", top: "16px", right: "16px", zIndex: 4000, background: "white", borderRadius: "12px", padding: "14px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", maxWidth: "320px", fontFamily: font, borderLeft: "4px solid #F19195" },
  titulo: { margin: "0 0 4px", fontSize: "14px", fontWeight: "bold", color: "#222" },
  cuerpo: { margin: "0 0 10px", fontSize: "13px", color: "#555", lineHeight: "1.4" },
  botones: { display: "flex", gap: "8px" },
  ver: { padding: "6px 14px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font, fontSize: "12px" },
  cerrar: { padding: "6px 14px", borderRadius: "8px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontFamily: font, fontSize: "12px" },
};

export default AvisosPush;