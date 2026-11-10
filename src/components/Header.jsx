import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { quitarDispositivoActual } from "../utils/notificaciones";

// Devuelve true cuando la pantalla es angosta (celular o tablet chica)
const useCompacto = (ancho = 820) => {
  const consulta = `(max-width: ${ancho}px)`;
  const [compacto, setCompacto] = useState(() => window.matchMedia(consulta).matches);

  useEffect(() => {
    const lista = window.matchMedia(consulta);
    const alCambiar = (e) => setCompacto(e.matches);
    setCompacto(lista.matches);
    lista.addEventListener("change", alCambiar);
    return () => lista.removeEventListener("change", alCambiar);
  }, [consulta]);

  return compacto;
};

function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const compacto = useCompacto();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const esOrganizador = usuario?.rol === "organizador";
  const etiquetaRol = esOrganizador
    ? usuario.tipoCuenta === "organizacion"
      ? "Organización"
      : "Organizador"
    : "Participante";
  const inicial = (usuario?.nombre || "?").trim().charAt(0).toUpperCase();
  const inicio = esOrganizador ? "/panel-organizador" : "/home";

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

  const enlaces = esOrganizador
    ? [
        {
          icono: "📋",
          etiqueta: "Mis actividades",
          ruta: "/panel-organizador",
          prefijos: ["/panel-organizador", "/actividad/", "/editar-actividad", "/duplicar-actividad"],
        },
        { icono: "➕", etiqueta: "Nueva actividad", ruta: "/nueva-actividad", prefijos: ["/nueva-actividad"] },
        { icono: "🔔", etiqueta: "Notificaciones", ruta: "/notificaciones", prefijos: ["/notificaciones"] },
      ]
    : usuario
    ? [
        { icono: "🔍", etiqueta: "Explorar", ruta: "/home", prefijos: ["/home", "/evento/"] },
        { icono: "🎟️", etiqueta: "Mis reservas", ruta: "/mis-reservas", prefijos: ["/mis-reservas"] },
        { icono: "🔔", etiqueta: "Notificaciones", ruta: "/notificaciones", prefijos: ["/notificaciones"] },
      ]
    : [];

  const estaActivo = (enlace) => enlace.prefijos.some((p) => pathname.startsWith(p));
  const enPerfil = pathname.startsWith("/perfil");

  return (
    <header style={styles.header}>
      <div style={{ ...styles.barra, padding: compacto ? "10px" : "12px 20px" }}>
        <nav style={styles.izquierda}>
          {enlaces.map((enlace) => {
            const activo = estaActivo(enlace);
            const estilo = compacto
              ? activo ? styles.iconoActivo : styles.icono
              : activo ? styles.enlaceActivo : styles.enlace;
            return (
              <button
                key={enlace.ruta}
                style={estilo}
                onClick={() => navigate(enlace.ruta)}
                title={enlace.etiqueta}
                aria-label={enlace.etiqueta}
                aria-current={activo ? "page" : undefined}
              >
                <span aria-hidden="true">{enlace.icono}</span>
                {!compacto && <span style={styles.texto}>{enlace.etiqueta}</span>}
              </button>
            );
          })}
        </nav>

        <span style={{ ...styles.logo, fontSize: compacto ? "20px" : "22px" }} onClick={() => navigate(inicio)}>
          Solee
        </span>

        <div style={styles.derecha}>
          {usuario && (
            <>
              <button
                style={enPerfil ? styles.perfilActivo : styles.perfil}
                onClick={() => navigate("/perfil")}
                title={`Mi perfil (${usuario.nombre}, ${etiquetaRol})`}
                aria-label="Mi perfil"
              >
                <span style={styles.avatar}>{inicial}</span>
                {!compacto && (
                  <span style={styles.datos}>
                    <span style={styles.nombre}>{usuario.nombre.split(" ")[0]}</span>
                    <span style={styles.rol}>{etiquetaRol}</span>
                  </span>
                )}
              </button>

              <button
                style={compacto ? styles.icono : styles.salir}
                onClick={cerrarSesion}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <span aria-hidden="true">🚪</span>
                {!compacto && <span style={styles.texto}>Salir</span>}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const font = "'Poppins', Arial, sans-serif";
const base = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  border: "none",
  cursor: "pointer",
  fontFamily: font,
  whiteSpace: "nowrap",
};
const styles = {
  header: { background: "linear-gradient(135deg, #D3A47D, #F19195)", fontFamily: font },
  barra: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" },
  izquierda: { display: "flex", alignItems: "center", gap: "6px", minWidth: 0 },
  derecha: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", minWidth: 0 },
  logo: { color: "white", fontWeight: "700", letterSpacing: "1px", cursor: "pointer", fontFamily: font },
  texto: { fontSize: "13px" },
  enlace: { ...base, padding: "7px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", color: "white" },
  enlaceActivo: { ...base, padding: "7px 14px", borderRadius: "20px", background: "white", color: "#A8744F", fontWeight: "bold" },
  icono: { ...base, width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "white", fontSize: "16px", padding: 0 },
  iconoActivo: { ...base, width: "36px", height: "36px", borderRadius: "50%", background: "white", color: "#A8744F", fontSize: "16px", padding: 0 },
  salir: { ...base, padding: "7px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", color: "white" },
  perfil: { ...base, padding: "3px 12px 3px 3px", borderRadius: "24px", background: "rgba(255,255,255,0.2)", color: "white", minWidth: "36px" },
  perfilActivo: { ...base, padding: "3px 12px 3px 3px", borderRadius: "24px", background: "white", color: "#A8744F", minWidth: "36px" },
  avatar: { width: "30px", height: "30px", borderRadius: "50%", background: "#A8744F", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" },
  datos: { display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.2", maxWidth: "110px" },
  nombre: { fontSize: "13px", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px" },
  rol: { fontSize: "11px", opacity: 0.85 },
};

export default Header;