import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO_SANTIAGO = [-33.4489, -70.6693];

const iconoActividad = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;background:#F19195;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 27],
  popupAnchor: [0, -24],
});

// El popup se arma con nodos del DOM (no con HTML en texto) para que un título
// con símbolos raros no pueda inyectar código en la página.
const crearPopup = (actividad, alVerDetalle) => {
  const caja = document.createElement("div");
  caja.style.fontFamily = "'Poppins', Arial, sans-serif";

  const titulo = document.createElement("strong");
  titulo.textContent = actividad.titulo;

  const info = document.createElement("div");
  info.style.cssText = "font-size:12px;color:#555;margin:4px 0 8px";
  const precio = actividad.precio === 0 ? "Gratis" : `$${actividad.precio} CLP`;
  const distancia =
    actividad.distanciaMetros !== undefined
      ? ` · a ${(actividad.distanciaMetros / 1000).toFixed(1)} km`
      : "";
  info.textContent = `${actividad.disciplina} · ${precio}${distancia}`;

  const boton = document.createElement("button");
  boton.textContent = "Ver detalle";
  boton.style.cssText =
    "padding:6px 12px;border:none;border-radius:6px;background:#F19195;color:white;font-weight:bold;cursor:pointer";
  boton.onclick = () => alVerDetalle(actividad._id);

  caja.append(titulo, info, boton);
  return caja;
};

function MapaActividades({ actividades, ubicacion, radioKm, onVerDetalle }) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const capaRef = useRef(null);
  const alVerDetalleRef = useRef(onVerDetalle);
  alVerDetalleRef.current = onVerDetalle;

  // Crear el mapa una sola vez
  useEffect(() => {
    const mapa = L.map(contenedorRef.current).setView(CENTRO_SANTIAGO, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Colaboradores de OpenStreetMap",
    }).addTo(mapa);
    capaRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;

    return () => {
      mapa.remove();
      mapaRef.current = null;
      capaRef.current = null;
    };
  }, []);

  // Redibujar pines y radio cuando cambian los datos
  useEffect(() => {
    const mapa = mapaRef.current;
    const capa = capaRef.current;
    if (!mapa || !capa) return;

    capa.clearLayers();
    const puntos = [];

    actividades.forEach((actividad) => {
      const coords = actividad.ubicacion?.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) return;
      const [lng, lat] = coords;
      L.marker([lat, lng], { icon: iconoActividad })
        .addTo(capa)
        .bindPopup(crearPopup(actividad, (id) => alVerDetalleRef.current(id)));
      puntos.push([lat, lng]);
    });

    if (ubicacion) {
      L.circle([ubicacion.lat, ubicacion.lng], {
        radius: radioKm * 1000,
        color: "#D3A47D",
        fillColor: "#D3A47D",
        fillOpacity: 0.15,
      }).addTo(capa);
      L.circleMarker([ubicacion.lat, ubicacion.lng], {
        radius: 7,
        color: "white",
        weight: 2,
        fillColor: "#4285F4",
        fillOpacity: 1,
      })
        .addTo(capa)
        .bindTooltip("Tu ubicación");
      mapa.fitBounds(L.latLng(ubicacion.lat, ubicacion.lng).toBounds(radioKm * 2000), {
        padding: [20, 20],
      });
    } else if (puntos.length > 0) {
      mapa.fitBounds(puntos, { padding: [40, 40], maxZoom: 15 });
    }
  }, [actividades, ubicacion, radioKm]);

  const sinUbicacion = actividades.filter(
    (a) => !Array.isArray(a.ubicacion?.coordinates) || a.ubicacion.coordinates.length !== 2
  ).length;

  return (
    <div>
      <div ref={contenedorRef} style={{ height: "460px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
      {sinUbicacion > 0 && (
        <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
          {sinUbicacion} {sinUbicacion === 1 ? "actividad no tiene" : "actividades no tienen"} ubicación física (por ejemplo, las virtuales) y solo aparecen en la vista de lista.
        </p>
      )}
    </div>
  );
}

export default MapaActividades;