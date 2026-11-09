import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Header from "../components/Header";
import api from "../api/axiosConfig";

const TZ = "America/Santiago";

const formatoFecha = (iso) =>
  new Date(iso).toLocaleString("es-CL", {
    weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ,
  });

function MisReservas() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [pestana, setPestana] = useState("proximas");
  const [qrAbierto, setQrAbierto] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get("/reservas/mis-reservas");
        setReservas(data.reservas);
      } catch (err) {
        setError("No se pudieron cargar tus reservas.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const ahora = new Date();
  const esProxima = (r) =>
    r.estado === "confirmada" && r.actividad && new Date(r.actividad.fechaInicio) > ahora;

  const proximas = reservas
    .filter(esProxima)
    .sort((a, b) => new Date(a.actividad.fechaInicio) - new Date(b.actividad.fechaInicio));
  const historial = reservas
    .filter((r) => !esProxima(r))
    .sort(
      (a, b) =>
        new Date(b.actividad?.fechaInicio || b.creadoEn) - new Date(a.actividad?.fechaInicio || a.creadoEn)
    );
  const visibles = pestana === "proximas" ? proximas : historial;

  const cancelar = async (reserva) => {
    setAviso("");
    if (!window.confirm(`¿Cancelar tu reserva en "${reserva.actividad?.titulo}"?`)) return;
    try {
      await api.put(`/reservas/${reserva._id}/cancelar`);
      setReservas(reservas.map((r) => (r._id === reserva._id ? { ...r, estado: "cancelada" } : r)));
      setQrAbierto(null);
    } catch (err) {
      setAviso(err.response?.data?.mensaje || "No se pudo cancelar la reserva.");
    }
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <h1 style={styles.title}>Mis reservas</h1>

        <div style={styles.tabs}>
          <button style={pestana === "proximas" ? styles.tabActive : styles.tab} onClick={() => setPestana("proximas")}>
            Próximas ({proximas.length})
          </button>
          <button style={pestana === "historial" ? styles.tabActive : styles.tab} onClick={() => setPestana("historial")}>
            Historial ({historial.length})
          </button>
        </div>

        {cargando && <p style={styles.msg}>Cargando tus reservas...</p>}
        {error && <p style={styles.msg}>{error}</p>}
        {aviso && <p style={styles.aviso}>{aviso}</p>}

        {!cargando && !error && visibles.length === 0 && (
          <div style={{ textAlign: "center" }}>
            <p style={styles.msg}>
              {pestana === "proximas" ? "No tienes reservas próximas." : "Aún no tienes reservas en el historial."}
            </p>
            {pestana === "proximas" && (
              <button style={styles.primary} onClick={() => navigate("/home")}>Buscar actividades</button>
            )}
          </div>
        )}

        <div style={styles.list}>
          {visibles.map((r) => (
            <div key={r._id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.cardTitle}>{r.actividad?.titulo || "Actividad no disponible"}{r.actividad?.estado === "eliminada" ? " (actividad eliminada)" : ""}</h3>
                  {r.actividad && (
                    <>
                      <p style={styles.cardInfo}>📅 {formatoFecha(r.actividad.fechaInicio)} h</p>
                      <p style={styles.cardInfo}>📍 {r.actividad.direccionTexto}</p>
                    </>
                  )}
                </div>
                <span style={r.estado === "confirmada" ? styles.badgeOk : styles.badgeOff}>{r.estado}</span>
              </div>

              {qrAbierto === r._id && (
                <div style={styles.qrBox}>
                  <QRCodeSVG value={r.codigoQR} size={140} />
                  <p style={styles.qrText}>Presenta este código al llegar</p>
                </div>
              )}

              <div style={styles.actions}>
                {r.actividad && r.actividad.estado !== "eliminada" && (
                  <button style={styles.btn} onClick={() => navigate(`/evento/${r.actividad._id}`)}>Ver actividad</button>
                )}
                {esProxima(r) && (
                  <>
                    <button style={styles.btn} onClick={() => setQrAbierto(qrAbierto === r._id ? null : r._id)}>
                      {qrAbierto === r._id ? "Ocultar código" : "Ver código QR"}
                    </button>
                    <button style={styles.btnDanger} onClick={() => cancelar(r)}>Cancelar reserva</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  container: { maxWidth: "700px", margin: "0 auto", padding: "20px", fontFamily: font },
  title: { fontSize: "22px", color: "#222", margin: "0 0 16px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "18px" },
  tab: { padding: "8px 18px", borderRadius: "20px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontFamily: font },
  tabActive: { padding: "8px 18px", borderRadius: "20px", border: "1px solid #F19195", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  msg: { textAlign: "center", color: "#888", marginTop: "30px" },
  aviso: { textAlign: "center", color: "#c0392b", fontSize: "13px" },
  primary: { padding: "12px 20px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font, marginTop: "10px" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "white", borderRadius: "10px", padding: "16px", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" },
  cardTitle: { fontSize: "15px", margin: "0 0 6px", color: "#222" },
  cardInfo: { fontSize: "13px", color: "#666", margin: "2px 0" },
  badgeOk: { background: "#e6f4ea", color: "#1e7e34", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
  badgeOff: { background: "#eee", color: "#777", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" },
  qrBox: { textAlign: "center", margin: "14px 0 4px" },
  qrText: { fontSize: "12px", color: "#888", margin: "6px 0 0" },
  actions: { display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" },
  btn: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", cursor: "pointer", fontSize: "12px", fontFamily: font },
  btnDanger: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #c0392b", background: "white", color: "#c0392b", cursor: "pointer", fontSize: "12px", fontFamily: font },
};

export default MisReservas;