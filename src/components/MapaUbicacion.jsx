import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const iconoPin = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;background:#F19195;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 27],
});

function MapaUbicacion({ lat, lng }) {
  const contenedorRef = useRef(null);

  useEffect(() => {
    const mapa = L.map(contenedorRef.current, { scrollWheelZoom: false }).setView([lat, lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; Colaboradores de OpenStreetMap",
    }).addTo(mapa);
    L.marker([lat, lng], { icon: iconoPin }).addTo(mapa);
    return () => mapa.remove();
  }, [lat, lng]);

  return (
    <div
      ref={contenedorRef}
      style={{ height: "260px", borderRadius: "10px", overflow: "hidden", border: "1px solid #ddd" }}
    />
  );
}

export default MapaUbicacion;