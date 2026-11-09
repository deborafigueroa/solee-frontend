import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO_SANTIAGO = [-33.4489, -70.6693];
const PHOTON = "https://photon.komoot.io";
// Región Metropolitana, en el formato de Photon: oeste,sur,este,norte
const BBOX_RM = "-71.71,-34.29,-69.77,-32.92";
const LIMITES_RM = L.latLngBounds([-34.29, -71.71], [-32.92, -69.77]);
// Distancia máxima entre el pin y las direcciones que se ofrecen al confirmar
const RADIO_MAXIMO_M = 250;

const dentroRM = (p) => LIMITES_RM.contains([p.lat, p.lng]);

const iconoPin = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;background:#F19195;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 27],
});

const unicos = (lista) => lista.filter((x, i) => x && lista.indexOf(x) === i);

// Arma "Lugar, Calle 123, Comuna" a partir de lo que devuelve Photon
const formatearFeature = (feature) => {
  const p = feature?.properties || {};
  const esCalle = p.osm_key === "highway";
  const calle = p.street
    ? p.housenumber
      ? `${p.street} ${p.housenumber}`
      : p.street
    : esCalle
    ? p.name
    : "";
  const lugar = p.name && !esCalle && p.name !== p.street ? p.name : "";
  return unicos([lugar, calle, p.district || p.locality, p.city]).join(", ");
};

const buscarSugerencias = async (texto) => {
  const url =
    `${PHOTON}/api?q=${encodeURIComponent(texto)}&limit=6&bbox=${BBOX_RM}` +
    `&lat=${CENTRO_SANTIAGO[0]}&lon=${CENTRO_SANTIAGO[1]}`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error("No se pudo consultar el buscador");
  const datos = await respuesta.json();

  const vistos = new Set();
  return (datos.features || [])
    .map((f) => ({
      etiqueta: formatearFeature(f),
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    }))
    .filter((s) => {
      if (!s.etiqueta || vistos.has(s.etiqueta)) return false;
      vistos.add(s.etiqueta);
      return true;
    });
};

// Lugares y direcciones reales cerca de un punto, del más cercano al más lejano
const opcionesDe = async (p) => {
  const respuesta = await fetch(`${PHOTON}/reverse?lon=${p.lng}&lat=${p.lat}&limit=5`);
  if (!respuesta.ok) throw new Error("No se pudo consultar el mapa");
  const datos = await respuesta.json();

  const origen = L.latLng(p.lat, p.lng);
  const vistos = new Set();
  return (datos.features || [])
    .map((f) => ({
      etiqueta: formatearFeature(f),
      distancia: Math.round(origen.distanceTo(L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]))),
    }))
    .filter((o) => {
      if (!o.etiqueta || o.distancia > RADIO_MAXIMO_M || vistos.has(o.etiqueta)) return false;
      vistos.add(o.etiqueta);
      return true;
    })
    .sort((a, b) => a.distancia - b.distancia);
};

// valor = { direccion, punto: {lat, lng} | null, sincronizada }
function SelectorUbicacion({ valor, onChange }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const temporizadorRef = useRef(null);
  const busquedaRef = useRef(0);
  const consultaRef = useRef(0);
  const alMoverRef = useRef(null);

  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [pendiente, setPendiente] = useState(null);

  // Consulta las opciones de dirección del pin y las deja en el cuadro de confirmación
  const consultar = (punto) => {
    const id = ++consultaRef.current;
    opcionesDe(punto)
      .then((opciones) => {
        if (id !== consultaRef.current) return;
        setPendiente((pd) => (pd ? { ...pd, cargando: false, error: false, opciones, seleccion: 0 } : pd));
      })
      .catch(() => {
        if (id !== consultaRef.current) return;
        setPendiente((pd) => (pd ? { ...pd, cargando: false, error: true, opciones: [] } : pd));
      });
  };

  // Cada vez que el pin se mueve (arrastre o clic) se pide confirmar la dirección
  alMoverRef.current = (nuevo) => {
    if (!dentroRM(nuevo)) {
      setMensaje("Solo se pueden publicar actividades dentro de la Región Metropolitana.");
      if (valor.punto && marcadorRef.current) {
        marcadorRef.current.setLatLng([valor.punto.lat, valor.punto.lng]);
      }
      return;
    }

    const anterior = { punto: valor.punto, sincronizada: valor.sincronizada };
    onChange({ ...valor, punto: nuevo, sincronizada: false });
    setSugerencias([]);
    setMensaje("");
    setPendiente({ anterior, cargando: true, error: false, opciones: [], seleccion: 0 });
    consultar(nuevo);
  };

  const colocarMarcador = (lat, lng) => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    if (marcadorRef.current) {
      marcadorRef.current.setLatLng([lat, lng]);
      return;
    }

    const marcador = L.marker([lat, lng], { icon: iconoPin, draggable: true }).addTo(mapa);
    marcador.on("dragend", () => {
      const p = marcador.getLatLng();
      alMoverRef.current({ lat: p.lat, lng: p.lng });
    });
    marcadorRef.current = marcador;
  };

  // Crear el mapa una sola vez
  useEffect(() => {
    const mapa = L.map(contenedorRef.current, {
      maxBounds: LIMITES_RM,
      maxBoundsViscosity: 1.0,
      minZoom: 9,
    }).setView(valor.punto ? [valor.punto.lat, valor.punto.lng] : CENTRO_SANTIAGO, valor.punto ? 16 : 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Colaboradores de OpenStreetMap",
    }).addTo(mapa);

    mapa.on("click", (e) => alMoverRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
    mapaRef.current = mapa;

    return () => {
      clearTimeout(temporizadorRef.current);
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

  // El pin sigue al punto del formulario
  useEffect(() => {
    if (valor.punto) {
      colocarMarcador(valor.punto.lat, valor.punto.lng);
    } else if (marcadorRef.current) {
      marcadorRef.current.remove();
      marcadorRef.current = null;
    }
  }, [valor.punto]);

  const buscar = async (texto) => {
    const consulta = texto.trim();
    if (consulta.length < 3) {
      setMensaje("Escribe al menos 3 letras para buscar.");
      setSugerencias([]);
      return;
    }

    const id = ++busquedaRef.current;
    setBuscando(true);
    setMensaje("");
    try {
      const resultados = await buscarSugerencias(consulta);
      if (id !== busquedaRef.current) return;
      setSugerencias(resultados);
      if (resultados.length === 0) {
        setMensaje(
          "No encontramos ese lugar o dirección en la Región Metropolitana. Prueba sin el número o con otro nombre, o marca el punto directamente en el mapa."
        );
      }
    } catch (e) {
      if (id !== busquedaRef.current) return;
      setMensaje("No pudimos buscar ahora. Marca el punto directamente en el mapa.");
    } finally {
      if (id === busquedaRef.current) setBuscando(false);
    }
  };

  const alEscribir = (texto) => {
    onChange({ ...valor, direccion: texto, sincronizada: false });
    setMensaje("");
    clearTimeout(temporizadorRef.current);
    if (texto.trim().length < 3) {
      setSugerencias([]);
      return;
    }
    temporizadorRef.current = setTimeout(() => buscar(texto), 700);
  };

  const buscarAhora = () => {
    clearTimeout(temporizadorRef.current);
    buscar(valor.direccion);
  };

  const elegir = (sugerencia) => {
    clearTimeout(temporizadorRef.current);
    busquedaRef.current++;
    setBuscando(false);
    onChange({
      direccion: sugerencia.etiqueta,
      punto: { lat: sugerencia.lat, lng: sugerencia.lng },
      sincronizada: true,
    });
    setSugerencias([]);
    setMensaje("");
    mapaRef.current?.setView([sugerencia.lat, sugerencia.lng], 17);
  };

  const reintentar = () => {
    setPendiente((pd) => (pd ? { ...pd, cargando: true, error: false } : pd));
    consultar(valor.punto);
  };

  const confirmarPin = () => {
    if (!pendiente || pendiente.cargando || pendiente.error) return;
    const opcion = pendiente.opciones[pendiente.seleccion];
    if (!opcion) return;
    consultaRef.current++;
    onChange({ ...valor, direccion: opcion.etiqueta, sincronizada: true });
    setPendiente(null);
  };

  const volverAlAnterior = () => {
    consultaRef.current++;
    onChange({
      ...valor,
      punto: pendiente.anterior.punto,
      sincronizada: pendiente.anterior.sincronizada,
    });
    setPendiente(null);
  };

  const opciones = pendiente?.opciones || [];
  const puedeConfirmar = Boolean(pendiente) && !pendiente.cargando && !pendiente.error && opciones.length > 0;

  const modal = pendiente && (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>Confirma la dirección de este punto</h3>

        {pendiente.cargando && <p style={styles.modalText}>Buscando direcciones y lugares cerca del pin...</p>}

        {pendiente.error && (
          <>
            <p style={styles.modalError}>No pudimos consultar el mapa ahora.</p>
            <button type="button" style={styles.modalSecondary} onClick={reintentar}>
              Reintentar
            </button>
          </>
        )}

        {!pendiente.cargando && !pendiente.error && opciones.length === 0 && (
          <p style={styles.modalError}>
            No encontramos una dirección o lugar a menos de {RADIO_MAXIMO_M} m de este punto. Mueve el pin a una calle o
            a un lugar con dirección, o búscalo por su nombre.
          </p>
        )}

        {puedeConfirmar && (
          <>
            <p style={styles.modalText}>Elige la dirección o lugar que corresponde al pin:</p>
            <div style={styles.opciones}>
              {opciones.map((o, i) => (
                <label key={o.etiqueta} style={pendiente.seleccion === i ? styles.opcionActiva : styles.opcion}>
                  <input
                    type="radio"
                    name="opcion-direccion"
                    checked={pendiente.seleccion === i}
                    onChange={() => setPendiente({ ...pendiente, seleccion: i })}
                  />
                  <span style={styles.opcionTexto}>{o.etiqueta}</span>
                  <span style={styles.opcionDistancia}>a {o.distancia} m</span>
                </label>
              ))}
            </div>
            <p style={styles.modalHint}>
              Esta será la dirección que verán los participantes. Los detalles (piso, sala, referencias) van en
              "Instrucciones para encontrar el lugar".
            </p>
          </>
        )}

        <button
          type="button"
          style={puedeConfirmar ? styles.modalPrimary : styles.modalPrimaryOff}
          onClick={confirmarPin}
          disabled={!puedeConfirmar}
        >
          Confirmar dirección
        </button>
        <button type="button" style={styles.modalSecondary} onClick={volverAlAnterior}>
          {pendiente.anterior.punto ? "Volver al punto anterior" : "Quitar el pin"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={styles.searchRow}>
        <input
          style={styles.input}
          placeholder="Ej.: Centro Cultural GAM, o Av. Providencia 1234"
          value={valor.direccion}
          required
          onChange={(e) => alEscribir(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              buscarAhora();
            }
          }}
        />
        <button type="button" style={styles.button} onClick={buscarAhora} disabled={buscando}>
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {sugerencias.length > 0 && (
        <div style={styles.sugerencias}>
          <p style={styles.sugerenciasTitulo}>Elige un lugar o dirección:</p>
          {sugerencias.map((s) => (
            <button type="button" key={s.etiqueta} style={styles.sugerencia} onClick={() => elegir(s)}>
              {s.etiqueta}
            </button>
          ))}
          <p style={styles.sugerenciasNota}>
            Si no aparece el número exacto, elige la calle y mueve el pin al lugar correcto.
          </p>
        </div>
      )}

      {mensaje && <p style={styles.error}>{mensaje}</p>}

      {valor.direccion && !valor.sincronizada && !pendiente && sugerencias.length === 0 && !buscando && (
        <p style={styles.hint}>
          Elige una sugerencia (o toca Buscar) para que la dirección quede ubicada en el mapa.
        </p>
      )}

      <div ref={contenedorRef} style={styles.mapa} />

      <p style={styles.estado}>
        {valor.punto
          ? "Pin marcado. Arrástralo o haz clic en otro lugar del mapa para cambiarlo; te pediremos confirmar la dirección."
          : "Haz clic en el mapa para marcar el punto, o busca una dirección arriba."}
      </p>

      <p style={styles.aviso}>
        📍 Esta ubicación se muestra públicamente en el mapa, junto con la ruta para llegar. Si la actividad es en tu
        domicilio, marca un punto de encuentro cercano.
      </p>

      {modal && createPortal(modal, document.body)}
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  searchRow: { display: "flex", gap: "8px", marginBottom: "8px" },
  input: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px", fontFamily: font, boxSizing: "border-box" },
  button: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#D3A47D", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  sugerencias: { background: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "8px", marginBottom: "8px", display: "flex", flexDirection: "column", gap: "4px" },
  sugerenciasTitulo: { margin: "0 0 4px", fontSize: "12px", color: "#666", fontWeight: "bold" },
  sugerencia: { textAlign: "left", padding: "8px 10px", borderRadius: "6px", border: "1px solid #eee", background: "#fafafa", cursor: "pointer", fontSize: "13px", color: "#444", fontFamily: font },
  sugerenciasNota: { margin: "6px 0 0", fontSize: "11px", color: "#888" },
  mapa: { height: "300px", borderRadius: "10px", overflow: "hidden", border: "1px solid #ddd" },
  estado: { fontSize: "12px", color: "#666", margin: "8px 0 0" },
  hint: { fontSize: "12px", color: "#997404", margin: "0 0 8px" },
  error: { fontSize: "12px", color: "#c0392b", margin: "0 0 8px" },
  aviso: { fontSize: "11px", color: "#888", margin: "10px 0 0", lineHeight: "1.5" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5000, padding: "20px" },
  modal: { background: "white", borderRadius: "16px", padding: "24px", maxWidth: "420px", width: "100%", display: "flex", flexDirection: "column", gap: "8px", fontFamily: font, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
  modalTitle: { fontSize: "17px", color: "#222", margin: 0 },
  modalText: { fontSize: "13px", color: "#555", margin: 0 },
  modalError: { fontSize: "13px", color: "#c0392b", margin: 0, lineHeight: "1.5" },
  modalHint: { fontSize: "11px", color: "#888", margin: 0, lineHeight: "1.5" },
  opciones: { display: "flex", flexDirection: "column", gap: "6px" },
  opcion: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e5e5e5", background: "white", cursor: "pointer", fontSize: "13px", color: "#444" },
  opcionActiva: { display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #D3A47D", background: "#fff8f0", cursor: "pointer", fontSize: "13px", color: "#444" },
  opcionTexto: { flex: 1 },
  opcionDistancia: { fontSize: "11px", color: "#888", whiteSpace: "nowrap" },
  modalPrimary: { padding: "12px", borderRadius: "8px", border: "none", background: "#F19195", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font, marginTop: "6px" },
  modalPrimaryOff: { padding: "12px", borderRadius: "8px", border: "none", background: "#ddd", color: "#888", fontWeight: "bold", cursor: "not-allowed", fontFamily: font, marginTop: "6px" },
  modalSecondary: { padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "white", color: "#666", cursor: "pointer", fontFamily: font },
};

export default SelectorUbicacion;