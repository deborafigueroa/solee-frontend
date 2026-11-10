import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import SelectorUbicacion from "../components/SelectorUbicacion";
import api from "../api/axiosConfig";

const disciplinas = ["música", "danza", "teatro", "artes visuales", "escritura", "fotografía", "cerámica", "tejido", "otros"];
const niveles = ["principiante", "intermedio", "avanzado", "todos los niveles"];
const modalidades = ["presencial", "virtual", "híbrida"];
const horarios = ["mañana", "tarde", "noche", "fin de semana"];
const MAX_FECHAS = 12;

const aInputFecha = (iso) => {
  const d = new Date(iso);
  const dos = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
};

const sumarDias = (valor, dias) => {
  const d = new Date(valor);
  d.setDate(d.getDate() + dias);
  return aInputFecha(d.toISOString());
};

const aISO = (valor) => new Date(valor).toISOString();

function NuevaActividad({ modo = "nueva" }) {
  const { id } = useParams();
  const duplicando = modo === "duplicar";
  const editando = Boolean(id) && !duplicando;
  const navigate = useNavigate();
  const accionRef = useRef("publicar");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(Boolean(id));
  const [titularidad, setTitularidad] = useState(false);
  const [estadoActual, setEstadoActual] = useState(null);
  const [origenTitulo, setOrigenTitulo] = useState("");
  const [mismaSerie, setMismaSerie] = useState(true);
  const [ubi, setUbi] = useState({ direccion: "", punto: null, sincronizada: false });
  const [instrucciones, setInstrucciones] = useState("");
  const [fechas, setFechas] = useState([{ inicio: "", fin: "" }]);
  const [repeticiones, setRepeticiones] = useState(4);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    disciplina: "música",
    nivel: "todos los niveles",
    modalidad: "presencial",
    precio: 0,
    cupoMaximo: 20,
    horario: "tarde",
  });

  useEffect(() => {
    if (!id) return;
    const cargar = async () => {
      try {
        const { data: a } = await api.get(`/actividades/${id}`);
        const coords = a.ubicacion?.coordinates;
        const punto = Array.isArray(coords) && coords.length === 2 ? { lat: coords[1], lng: coords[0] } : null;
        setUbi({ direccion: a.direccionTexto || "", punto, sincronizada: Boolean(punto) });
        setInstrucciones(a.instrucciones || "");
        setForm({
          titulo: a.titulo,
          descripcion: a.descripcion,
          disciplina: a.disciplina,
          nivel: a.nivel,
          modalidad: a.modalidad,
          precio: a.precio,
          cupoMaximo: a.cupoMaximo,
          horario: a.horario,
        });
        if (duplicando) {
          setOrigenTitulo(a.titulo);
          setFechas([{ inicio: "", fin: "" }]);
        } else {
          setEstadoActual(a.estado);
          setFechas([{ inicio: aInputFecha(a.fechaInicio), fin: aInputFecha(a.fechaFin) }]);
        }
      } catch (err) {
        setError("No se pudo cargar la actividad.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, duplicando]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const usaMapa = form.modalidad !== "virtual";
  const puedeBorrador = !editando || estadoActual === "borrador";
  const permiteVarias = !editando;

  const cambiarFecha = (indice, campo, valor) => {
    setFechas((fs) =>
      fs.map((f, i) => {
        if (i !== indice) return f;
        const nueva = { ...f, [campo]: valor };
        // Al elegir el inicio, el término parte igual y se ajusta después
        if (campo === "inicio" && (!f.fin || f.fin < valor)) nueva.fin = valor;
        return nueva;
      })
    );
  };

  const agregarFecha = () => {
    setFechas((fs) => {
      if (fs.length >= MAX_FECHAS) return fs;
      const ultima = fs[fs.length - 1];
      return [
        ...fs,
        ultima.inicio && ultima.fin
          ? { inicio: sumarDias(ultima.inicio, 7), fin: sumarDias(ultima.fin, 7) }
          : { inicio: "", fin: "" },
      ];
    });
  };

  const quitarFecha = (indice) => setFechas((fs) => fs.filter((_, i) => i !== indice));

  const generarSemanal = () => {
    const primera = fechas[0];
    if (!primera.inicio || !primera.fin) {
      setError("Completa primero la primera fecha para generar la serie semanal.");
      return;
    }
    const n = Math.min(Math.max(Number(repeticiones) || 2, 2), MAX_FECHAS);
    setError("");
    setFechas(
      Array.from({ length: n }, (_, k) => ({
        inicio: sumarDias(primera.inicio, 7 * k),
        fin: sumarDias(primera.fin, 7 * k),
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const publicando = accionRef.current === "publicar";

    if (puedeBorrador && publicando && !titularidad) {
      setError("Debes confirmar la declaración de titularidad del contenido para publicar.");
      return;
    }
    for (const f of fechas) {
      if (!f.inicio || !f.fin) {
        setError("Completa el inicio y el término de todas las fechas.");
        return;
      }
      if (new Date(f.fin) < new Date(f.inicio)) {
        setError("En una de las fechas el término es anterior al inicio.");
        return;
      }
    }
    if (new Set(fechas.map((f) => f.inicio)).size !== fechas.length) {
      setError("Hay fechas repetidas.");
      return;
    }
    if (usaMapa) {
      if (form.modalidad === "presencial" && !ubi.punto) {
        setError("Marca la ubicación de la actividad en el mapa.");
        return;
      }
      if (ubi.punto && !ubi.sincronizada) {
        setError(
          "La dirección escrita no coincide con el pin. Elige una sugerencia de la lista, o mueve el pin y confirma la dirección."
        );
        return;
      }
    }

    let estado;
    if (!editando) estado = publicando ? "activa" : "borrador";
    else if (estadoActual === "borrador" && publicando) estado = "activa";

    const campos = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      disciplina: form.disciplina,
      nivel: form.nivel,
      modalidad: form.modalidad,
      precio: Number(form.precio),
      cupoMaximo: Number(form.cupoMaximo),
      direccionTexto: ubi.direccion.trim(),
      instrucciones: usaMapa ? instrucciones.trim() : "",
      // GeoJSON usa el orden [longitud, latitud]
      ubicacion: usaMapa && ubi.punto ? { type: "Point", coordinates: [ubi.punto.lng, ubi.punto.lat] } : null,
      horario: form.horario,
    };

    setEnviando(true);
    try {
      if (editando) {
        await api.put(`/actividades/${id}`, {
          ...campos,
          fechaInicio: aISO(fechas[0].inicio),
          fechaFin: aISO(fechas[0].fin),
          ...(estado ? { estado } : {}),
        });
      } else if (duplicando || fechas.length > 1) {
        await api.post("/actividades/multiples", {
          ...campos,
          estado,
          fechas: fechas.map((f) => ({ fechaInicio: aISO(f.inicio), fechaFin: aISO(f.fin) })),
          origenId: duplicando ? id : undefined,
          mismaSerie: duplicando ? mismaSerie : undefined,
        });
      } else {
        await api.post("/actividades", {
          ...campos,
          fechaInicio: aISO(fechas[0].inicio),
          fechaFin: aISO(fechas[0].fin),
          estado,
        });
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

  const titulo = duplicando
    ? "Duplicar actividad"
    : !editando
    ? "Nueva actividad"
    : estadoActual === "borrador"
    ? "Editar borrador"
    : "Editar actividad";

  const etiquetaPublicar = fechas.length > 1 ? `Publicar ${fechas.length} fechas` : "Publicar actividad";

  return (
    <>
      <Header />
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate("/panel-organizador")}>
          ← Volver al panel
        </button>
        <h1 style={styles.title}>{titulo}</h1>

        {duplicando && (
          <p style={styles.copiaNota}>
            Copia de "{origenTitulo}". Elige las nuevas fechas. El cupo, el precio y la ubicación se copian y puedes
            cambiarlos.
          </p>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {campo("Título", <input style={styles.input} name="titulo" maxLength={120} required value={form.titulo} onChange={handleChange} />)}
          {campo("Descripción", <textarea style={{ ...styles.input, minHeight: "90px" }} name="descripcion" maxLength={1000} required value={form.descripcion} onChange={handleChange} />)}
          {campo("Disciplina", select("disciplina", disciplinas))}
          {campo("Nivel", select("nivel", niveles))}
          {campo("Modalidad", select("modalidad", modalidades))}
          {campo("Horario", select("horario", horarios))}
          {campo("Precio (CLP, 0 = gratis)", <input style={styles.input} type="number" min="0" name="precio" required value={form.precio} onChange={handleChange} />)}
          {campo("Cupo máximo (por fecha)", <input style={styles.input} type="number" min="1" name="cupoMaximo" required value={form.cupoMaximo} onChange={handleChange} />)}

          {usaMapa ? (
            <>
              {campo(
                form.modalidad === "presencial"
                  ? "Dirección o lugar (obligatorio, se muestra en la tarjeta de la actividad)"
                  : "Dirección o lugar (se muestra en la tarjeta de la actividad)",
                <SelectorUbicacion valor={ubi} onChange={setUbi} />
              )}
              {campo(
                "Instrucciones para encontrar el lugar (opcional)",
                <textarea
                  style={{ ...styles.input, minHeight: "80px" }}
                  maxLength={500}
                  placeholder="Ej.: Entrada por el pasaje lateral, segundo piso, timbre 3B. A dos cuadras del metro Los Leones."
                  value={instrucciones}
                  onChange={(e) => setInstrucciones(e.target.value)}
                />
              )}
            </>
          ) : (
            campo(
              "Plataforma o enlace de referencia",
              <input
                style={styles.input}
                required
                value={ubi.direccion}
                onChange={(e) => setUbi({ ...ubi, direccion: e.target.value })}
              />
            )
          )}

          <div style={styles.fechasBox}>
            <p style={styles.label}>{fechas.length > 1 ? "Fechas de la actividad" : "Fecha de la actividad"}</p>

            {fechas.map((f, i) => (
              <div key={i} style={styles.fechaFila}>
                {fechas.length > 1 && <span style={styles.numero}>{i + 1}</span>}
                <div style={styles.fechaCampo}>
                  <label style={styles.labelChico}>Inicio</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    required
                    value={f.inicio}
                    onChange={(e) => cambiarFecha(i, "inicio", e.target.value)}
                  />
                </div>
                <div style={styles.fechaCampo}>
                  <label style={styles.labelChico}>Término</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    required
                    value={f.fin}
                    onChange={(e) => cambiarFecha(i, "fin", e.target.value)}
                  />
                </div>
                {permiteVarias && i > 0 && (
                  <button type="button" style={styles.quitar} onClick={() => quitarFecha(i)}>Quitar</button>
                )}
              </div>
            ))}

            {permiteVarias && (
              <>
                <button
                  type="button"
                  style={styles.btnSec}
                  onClick={agregarFecha}
                  disabled={fechas.length >= MAX_FECHAS}
                >
                  + Agregar otra fecha
                </button>

                <div style={styles.repetir}>
                  <span style={styles.repetirTexto}>Repetir cada semana durante</span>
                  <input
                    style={styles.repetirInput}
                    type="number"
                    min="2"
                    max={MAX_FECHAS}
                    value={repeticiones}
                    onChange={(e) => setRepeticiones(e.target.value)}
                  />
                  <span style={styles.repetirTexto}>semanas</span>
                  <button type="button" style={styles.btnSec} onClick={generarSemanal}>Generar fechas</button>
                </div>

                <p style={styles.nota}>
                  Se crea una actividad por cada fecha, hasta {MAX_FECHAS}. Cada una tiene sus propios cupos, reservas,
                  asistencia y reseñas. "Generar fechas" usa la primera fecha como base y reemplaza las demás.
                </p>
              </>
            )}

            {duplicando && (
              <label style={styles.check}>
                <input type="checkbox" checked={mismaSerie} onChange={(e) => setMismaSerie(e.target.checked)} />
                Es la misma actividad en otras fechas (queda enlazada con la original)
              </label>
            )}
          </div>

          {puedeBorrador && (
            <label style={styles.check}>
              <input type="checkbox" checked={titularidad} onChange={(e) => setTitularidad(e.target.checked)} />
              Declaro ser titular del contenido publicado (Ley 17.336)
            </label>
          )}

          {error && <p style={styles.error}>{error}</p>}

          {puedeBorrador ? (
            <>
              <div style={styles.buttonsRow}>
                <button
                  type="submit"
                  style={styles.draft}
                  disabled={enviando}
                  onClick={() => (accionRef.current = "borrador")}
                >
                  Guardar como borrador
                </button>
                <button
                  type="submit"
                  style={styles.submit}
                  disabled={enviando}
                  onClick={() => (accionRef.current = "publicar")}
                >
                  {enviando ? "Guardando..." : etiquetaPublicar}
                </button>
              </div>
              <p style={styles.nota}>
                Un borrador no es visible para el público. Puedes revisarlo con "Ver como participante" desde tu panel y publicarlo cuando esté lista.
              </p>
            </>
          ) : (
            <button
              type="submit"
              style={styles.submit}
              disabled={enviando}
              onClick={() => (accionRef.current = "publicar")}
            >
              {enviando ? "Guardando..." : "Guardar cambios"}
            </button>
          )}
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
  copiaNota: { background: "#fff8e6", border: "1px solid #f0d9a0", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#6b5a2a", margin: "0 0 16px", lineHeight: "1.5" },
  form: { display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  label: { fontSize: "12px", color: "#666", fontWeight: "bold", margin: 0 },
  labelChico: { fontSize: "11px", color: "#888" },
  input: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", fontFamily: font, boxSizing: "border-box", width: "100%" },
  fechasBox: { display: "flex", flexDirection: "column", gap: "10px", background: "white", border: "1px solid #eee", borderRadius: "10px", padding: "14px" },
  fechaFila: { display: "flex", gap: "8px", alignItems: "flex-end", flexWrap: "wrap" },
  fechaCampo: { display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: "170px" },
  numero: { width: "24px", height: "24px", borderRadius: "50%", background: "#D3A47D", color: "white", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" },
  quitar: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #c0392b", background: "white", color: "#c0392b", cursor: "pointer", fontSize: "12px", fontFamily: font, marginBottom: "2px" },
  btnSec: { padding: "9px 14px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", fontWeight: "bold", cursor: "pointer", fontSize: "12px", fontFamily: font, alignSelf: "flex-start" },
  repetir: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  repetirTexto: { fontSize: "12px", color: "#555" },
  repetirInput: { width: "64px", padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "13px", fontFamily: font },
  check: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#444" },
  error: { color: "#c0392b", fontSize: "13px", margin: 0 },
  buttonsRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  draft: { flex: 1, minWidth: "160px", padding: "14px", borderRadius: "8px", border: "1px solid #D3A47D", background: "white", color: "#D3A47D", fontSize: "15px", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  submit: { flex: 1, minWidth: "160px", padding: "14px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontSize: "15px", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  nota: { fontSize: "12px", color: "#888", margin: 0, lineHeight: "1.5" },
};

export default NuevaActividad;