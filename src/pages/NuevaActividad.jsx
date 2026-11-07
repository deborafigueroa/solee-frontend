import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import SelectorUbicacion from "../components/SelectorUbicacion";
import api from "../api/axiosConfig";

const disciplinas = ["música", "danza", "teatro", "artes visuales", "escritura", "fotografía", "cerámica", "tejido", "otros"];
const niveles = ["principiante", "intermedio", "avanzado", "todos los niveles"];
const modalidades = ["presencial", "virtual", "híbrida"];
const horarios = ["mañana", "tarde", "noche", "fin de semana"];

const aInputFecha = (iso) => {
  const d = new Date(iso);
  const dos = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
};

function NuevaActividad() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(editando);
  const [titularidad, setTitularidad] = useState(false);
  const [punto, setPunto] = useState(null);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    disciplina: "música",
    nivel: "todos los niveles",
    modalidad: "presencial",
    precio: 0,
    cupoMaximo: 20,
    direccionTexto: "",
    fechaInicio: "",
    fechaFin: "",
    horario: "tarde",
  });

  useEffect(() => {
    if (!editando) return;
    const cargar = async () => {
      try {
        const { data: a } = await api.get(`/actividades/${id}`);
        const coords = a.ubicacion?.coordinates;
        setPunto(Array.isArray(coords) && coords.length === 2 ? { lat: coords[1], lng: coords[0] } : null);
        setForm({
          titulo: a.titulo,
          descripcion: a.descripcion,
          disciplina: a.disciplina,
          nivel: a.nivel,
          modalidad: a.modalidad,
          precio: a.precio,
          cupoMaximo: a.cupoMaximo,
          direccionTexto: a.direccionTexto || "",
          fechaInicio: aInputFecha(a.fechaInicio),
          fechaFin: aInputFecha(a.fechaFin),
          horario: a.horario,
        });
      } catch (err) {
        setError("No se pudo cargar la actividad.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, editando]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const usaMapa = form.modalidad !== "virtual";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!editando && !titularidad) {
      setError("Debes confirmar la declaración de titularidad del contenido.");
      return;
    }
    if (new Date(form.fechaFin) < new Date(form.fechaInicio)) {
      setError("La fecha de término no puede ser anterior al inicio.");
      return;
    }
    if (form.modalidad === "presencial" && !punto) {
      setError("Marca la ubicación de la actividad en el mapa.");
      return;
    }

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      disciplina: form.disciplina,
      nivel: form.nivel,
      modalidad: form.modalidad,
      precio: Number(form.precio),
      cupoMaximo: Number(form.cupoMaximo),
      direccionTexto: form.direccionTexto,
      // GeoJSON usa el orden [longitud, latitud]
      ubicacion: usaMapa && punto ? { type: "Point", coordinates: [punto.lng, punto.lat] } : null,
      fechaInicio: new Date(form.fechaInicio).toISOString(),
      fechaFin: new Date(form.fechaFin).toISOString(),
      horario: form.horario,
    };

    setEnviando(true);
    try {
      if (editando) {
        await api.put(`/actividades/${id}`, payload);
      } else {
        await api.post("/actividades", payload);
      }
      navigate("/panel-organizador");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar la actividad.");
    } finally {
      setEnviando(false);
    }
  };

  const campo = (label, input) => (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {input}
    </div>
  );

  const select = (name, opciones) => (
    <select style={styles.input} name={name} value={form[name]} onChange={handleChange}>
      {opciones.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );

  if (cargando) {
    return (
      <>
        <Header />
        <p style={{ textAlign: "center", marginTop: "40px" }}>Cargando actividad...</p>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/panel-organizador")}>
          ← Volver al panel
        </button>
        <h1 style={styles.title}>{editando ? "Editar actividad" : "Nueva actividad"}</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          {campo("Título", <input style={styles.input} name="titulo" maxLength={120} required value={form.titulo} onChange={handleChange} />)}
          {campo("Descripción", <textarea style={{ ...styles.input, minHeight: "90px" }} name="descripcion" maxLength={1000} required value={form.descripcion} onChange={handleChange} />)}
          {campo("Disciplina", select("disciplina", disciplinas))}
          {campo("Nivel", select("nivel", niveles))}
          {campo("Modalidad", select("modalidad", modalidades))}
          {campo("Horario", select("horario", horarios))}
          {campo("Precio (CLP, 0 = gratis)", <input style={styles.input} type="number" min="0" name="precio" required value={form.precio} onChange={handleChange} />)}
          {campo("Cupo máximo", <input style={styles.input} type="number" min="1" name="cupoMaximo" required value={form.cupoMaximo} onChange={handleChange} />)}
          {campo(
            form.modalidad === "virtual" ? "Plataforma o enlace de referencia" : "Dirección",
            <input style={styles.input} name="direccionTexto" required value={form.direccionTexto} onChange={handleChange} />
          )}

          {usaMapa &&
            campo(
              `Ubicación en el mapa ${form.modalidad === "presencial" ? "(obligatoria)" : "(opcional)"}`,
              <SelectorUbicacion
                punto={punto}
                onChange={setPunto}
                onDireccion={(texto) => setForm((f) => (f.direccionTexto ? f : { ...f, direccionTexto: texto }))}
              />
            )}

          {campo("Inicio", <input style={styles.input} type="datetime-local" name="fechaInicio" required value={form.fechaInicio} onChange={handleChange} />)}
          {campo("Término", <input style={styles.input} type="datetime-local" name="fechaFin" required value={form.fechaFin} onChange={handleChange} />)}

          {!editando && (
            <label style={styles.check}>
              <input type="checkbox" checked={titularidad} onChange={(e) => setTitularidad(e.target.checked)} />
              Declaro ser titular del contenido publicado (Ley 17.336)
            </label>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submit} disabled={enviando}>
            {enviando ? "Guardando..." : editando ? "Guardar cambios" : "Publicar actividad"}
          </button>
        </form>
      </div>
    </>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  container: { maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: font },
  backButton: { padding: "8px 14px", background: "none", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", color: "#D3A47D", fontFamily: font },
  title: { fontSize: "22px", color: "#222", margin: "16px 0" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  label: { fontSize: "12px", color: "#666", fontWeight: "bold" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", fontFamily: font, boxSizing: "border-box", width: "100%" },
  check: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#444" },
  error: { color: "#c0392b", fontSize: "13px", margin: 0 },
  submit: { padding: "14px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontSize: "16px", fontWeight: "bold", cursor: "pointer", fontFamily: font },
};

export default NuevaActividad;