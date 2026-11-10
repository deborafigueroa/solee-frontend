import { useNavigate } from "react-router-dom";

const secciones = [
  {
    titulo: "1. Quién es el responsable",
    texto: "Solee es una plataforma desarrollada como proyecto de título en la Universidad Andrés Bello (UNAB). Responsable del tratamiento de los datos: Debora Figueroa Quevedo. . Contacto para consultas y derechos: contactosolee@gmail.com.",
  },
  {
    titulo: "2. Qué datos recopilamos",
    texto: "Nombre, correo electrónico, RUT, fecha de nacimiento (solo personas naturales), teléfono y comuna (opcionales), intereses, rol y tipo de cuenta. Al registrarte también guardamos la fecha de tu aceptación y la dirección IP desde la que la diste. Tu contraseña se almacena cifrada y no podemos verla.",
  },
  {
    titulo: "3. Para qué los usamos",
    texto: "Para crear y gestionar tu cuenta, evitar cuentas duplicadas mediante el RUT, mostrarte actividades acordes a tu perfil, enviarte notificaciones sobre tus intereses cuando esa función esté disponible y mantener la seguridad de la plataforma. No vendemos ni cedemos tus datos a terceros. Cuando reservas una actividad, el organizador recibe tu nombre y tu correo para coordinarla.",
  },
  {
    titulo: "4. Tu consentimiento",
    texto: "Al marcar la casilla de aceptación en el registro autorizas el tratamiento de tus datos en los términos de esta política. Puedes revocar tu consentimiento en cualquier momento escribiendo al correo de contacto.",
  },
  {
    titulo: "5. Tus derechos",
    texto: "Puedes solicitar el acceso a tus datos, su rectificación, su eliminación y oponerte a su tratamiento. Escríbenos al correo de contacto y responderemos tu solicitud. Desde 'Mi perfil' puedes ver y corregir parte de tus datos y cambiar tu contraseña.",
  },
  {
    titulo: "6. Conservación y seguridad",
    texto: "Conservamos tus datos mientras tu cuenta esté activa. Las contraseñas se protegen con cifrado, el acceso a la API requiere autenticación y los datos se almacenan en una base de datos en la nube con acceso restringido.",
  },
  {
    titulo: "7. Mayores de edad",
    texto: "Las personas naturales deben tener al menos 18 años para registrarse en Solee.",
  },
  {
    titulo: "8. Normativa aplicable",
    texto: "El tratamiento de datos se rige por la Ley N° 19.628 sobre protección de la vida privada y, desde su entrada en vigencia, por la Ley N° 21.719 sobre protección y tratamiento de los datos personales.",
  },
  {
    titulo: "9. Términos de uso para organizadores",
    texto: "Al publicar una actividad declaras ser titular de su contenido o contar con autorización para usarlo, conforme a la Ley N° 17.336 sobre propiedad intelectual, y eres responsable de que la información publicada sea veraz. Solee puede pausar o retirar actividades que incumplan estas condiciones.",
  },
  {
    titulo: "10. Alcance de la plataforma",
    texto: "Solee conecta a participantes con organizadores. La realización, calidad y condiciones de cada actividad son responsabilidad de quien la organiza.",
  },
  {
    titulo: "11. Cambios",
    texto: "Podemos actualizar esta política. Cuando haya cambios relevantes lo informaremos en la plataforma.",
  },
  {
    titulo: "12. Ubicación y mapas",
    texto: "Si autorizas el acceso a la ubicación de tu dispositivo, la usamos solo mientras navegas para mostrarte las actividades cercanas y su distancia, y no la guardamos en tu cuenta. Puedes retirar el permiso en la configuración de tu navegador. Cuando un organizador publica una actividad presencial, la ubicación que marca en el mapa se muestra públicamente, junto con un enlace para llegar. Para mostrar mapas y ubicar direcciones usamos servicios de OpenStreetMap, a los que se envían las direcciones y los puntos que se buscan.",
  },
  {
    titulo: "13. Notificaciones",
    texto: "Si activas las notificaciones, guardamos un identificador de tu dispositivo y las disciplinas que elijas, para avisarte de actividades nuevas, de tus reservas y de cambios en las actividades en que estás inscrito. Los organizadores reciben avisos de las reservas de sus actividades, sin datos personales de quien reserva. Para entregarlas usamos Firebase Cloud Messaging, un servicio de Google. Puedes desactivarlas cuando quieras desde la pantalla de notificaciones o desde la configuración de tu navegador.",
  },
  {
    titulo: "14. Estadísticas de visitas",
    texto: "Cuando un participante abre una actividad, registramos la visita con un código derivado de su cuenta que no permite identificarlo, y el tipo de dispositivo. Los organizadores solo ven totales de visualizaciones de sus propias actividades, nunca quién las vio.",
  },
];

function Privacidad() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button style={styles.back} onClick={() => navigate(-1)}>← Volver</button>
      <h1 style={styles.title}>Política de privacidad y términos de uso</h1>
      <p style={styles.updated}>Última actualización: noviembre de 2026</p>
      {secciones.map((s) => (
        <div key={s.titulo} style={styles.section}>
          <h2 style={styles.h2}>{s.titulo}</h2>
          <p style={styles.text}>{s.texto}</p>
        </div>
      ))}
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  container: { maxWidth: "700px", margin: "0 auto", padding: "24px 20px 60px", fontFamily: font },
  back: { padding: "8px 14px", background: "none", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", color: "#D3A47D", fontFamily: font },
  title: { fontSize: "24px", color: "#222", margin: "20px 0 4px" },
  updated: { fontSize: "12px", color: "#888", marginBottom: "24px" },
  section: { marginBottom: "18px" },
  h2: { fontSize: "16px", color: "#333", margin: "0 0 6px" },
  text: { fontSize: "14px", color: "#555", lineHeight: "1.7", margin: 0 },
};

export default Privacidad;