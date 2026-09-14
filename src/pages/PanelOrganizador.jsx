import Header from "../components/Header";
import { misActividadesOrganizador } from "../data/mockEvents";

function PanelOrganizador() {
  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>Mis Actividades</h1>
          <button style={styles.newButton}>+ Nueva Actividad</button>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>323</p>
            <p style={styles.statLabel}>Visualizaciones totales</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>50</p>
            <p style={styles.statLabel}>Reservas activas</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>66%</p>
            <p style={styles.statLabel}>Tasa de ocupación</p>
          </div>
        </div>

        <div style={styles.list}>
          {misActividadesOrganizador.map((act) => (
            <div key={act.id} style={styles.card}>
              <div>
                <h3 style={styles.cardTitle}>{act.titulo}</h3>
                <p style={styles.cardInfo}>
                  {act.reservas} / {act.cupoMaximo} cupos reservados · {act.vistas} vistas
                </p>
              </div>
              <span style={act.estado === "activa" ? styles.badgeActive : styles.badgePaused}>
                {act.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Poppins', Arial, sans-serif",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "22px",
    color: "#222",
    margin: 0,
  },
  newButton: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#F19195",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  statsRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    flex: 1,
    background: "white",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#D3A47D",
    margin: "0 0 4px 0",
  },
  statLabel: {
    fontSize: "12px",
    color: "#666",
    margin: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    background: "white",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: "15px",
    margin: "0 0 6px 0",
    color: "#222",
  },
  cardInfo: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },
  badgeActive: {
    background: "#e6f4ea",
    color: "#1e7e34",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgePaused: {
    background: "#fff3cd",
    color: "#997404",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};

export default PanelOrganizador;