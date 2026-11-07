import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO_SANTIAGO = [-33.4489, -70.6693];

const iconoPin = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;background:#F19195;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 27],
});

function SelectorUbicacion({ punto, onChange, onDireccion }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");

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
      onChangeRef.current({ lat: p.lat, lng: p.lng });
    });
    marcadorRef.current = marcador;
    mapa.setView([lat, lng], Math.max(mapa.getZoom(), 15));
  };

  // Crear el mapa una sola vez
  useEffect(() => {
    const mapa = L.map(contenedorRef.current).setView(
      punto ? [punto.lat, punto.lng] : CENTRO_SANTIAGO,
      punto ? 16 : 12
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Colaboradores de OpenStreetMap",
    }).addTo(mapa);

    mapa.on("click", (e) => onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
    mapaRef.current = mapa;
    if (punto) colocarMarcador(punto.lat, punto.lng);

    return () => {
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

  // Mover el pin cuando el punto cambia (clic, arrastre o búsqueda)
  useEffect(() => {
    if (punto) colocarMarcador(punto.lat, punto.lng);
  }, [punto]);

  const buscarDireccion = async () => {
    if (!busqueda.trim()) return;
    setBuscando(true);
    setMensaje("");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cl&q=${encodeURIComponent(busqueda)}`;
      const respuesta = await fetch(url, { headers: { "Accept-Language": "es" } });
      const datos = await respuesta.json();

      if (!datos.length) {
        setMensaje("No encontramos esa dirección. Prueba con calle, número y comuna, o marca el punto en el mapa.");
        return;
      }

      const lat = Number(datos[0].lat);
      const lng = Number(datos[0].lon);
      onChange({ lat, lng });
      mapaRef.current?.setView([lat, lng], 17);
      if (onDireccion) onDireccion(datos[0].display_name);
    } catch (error) {
      setMensaje("No pudimos buscar la dirección ahora. Marca el punto directamente en el mapa.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div>
      <div style={styles.searchRow}>
        <input
          style={styles.input}
          placeholder="Busca una dirección (ej. Av. Providencia 1234, Providencia)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              buscarDireccion();
            }
          }}
        />
        <button type="button" style={styles.button} onClick={buscarDireccion} disabled={buscando}>
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div ref={contenedorRef} style={styles.mapa} />

      <p style={styles.estado}>
        {punto
          ? `Ubicación marcada: ${punto.lat.toFixed(5)}, ${punto.lng.toFixed(5)}. Puedes arrastrar el pin para afinarla.`
          : "Aún no marcas la ubicación. Haz clic en el mapa o busca una dirección."}
      </p>
      {mensaje && <p style={styles.error}>{mensaje}</p>}
    </div>
  );
}

const font = "'Poppins', Arial, sans-serif";
const styles = {
  searchRow: { display: "flex", gap: "8px", marginBottom: "8px" },
  input: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "13px", fontFamily: font, boxSizing: "border-box" },
  button: { padding: "10px 16px", borderRadius: "8px", border: "none", background: "#D3A47D", color: "white", fontWeight: "bold", cursor: "pointer", fontFamily: font },
  mapa: { height: "300px", borderRadius: "10px", overflow: "hidden", border: "1px solid #ddd" },
  estado: { fontSize: "12px", color: "#666", margin: "8px 0 0" },
  error: { fontSize: "12px", color: "#c0392b", margin: "6px 0 0" },
};

export default SelectorUbicacion;