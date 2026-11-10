import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Privacidad from "./pages/Privacidad";
import Home from "./pages/Home";
import DetalleEvento from "./pages/DetalleEvento";
import MisReservas from "./pages/MisReservas";
import PanelOrganizador from "./pages/PanelOrganizador";
import NuevaActividad from "./pages/NuevaActividad";
import ReservasActividad from "./pages/ReservasActividad";
import Notificaciones from "./pages/Notificaciones";
import RutaProtegida from "./components/RutaProtegida";
import AvisosPush from "./components/AvisosPush";
import Perfil from "./pages/Perfil";

function App() {
  return (
    <BrowserRouter>
      <AvisosPush />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/privacidad" element={<Privacidad />} />

        <Route path="/home" element={<RutaProtegida><Home /></RutaProtegida>} />
        <Route path="/evento/:id" element={<RutaProtegida><DetalleEvento /></RutaProtegida>} />
        <Route path="/notificaciones" element={<RutaProtegida><Notificaciones /></RutaProtegida>} />

        <Route
          path="/mis-reservas"
          element={<RutaProtegida rol="participante"><MisReservas /></RutaProtegida>}
        />

        <Route
          path="/panel-organizador"
          element={<RutaProtegida rol="organizador"><PanelOrganizador /></RutaProtegida>}
        />
        <Route
          path="/nueva-actividad"
          element={<RutaProtegida rol="organizador"><NuevaActividad /></RutaProtegida>}
        />
        <Route
          path="/editar-actividad/:id"
          element={<RutaProtegida rol="organizador"><NuevaActividad /></RutaProtegida>}
        />
        <Route
          path="/actividad/:id/inscritos"
          element={<RutaProtegida rol="organizador"><ReservasActividad /></RutaProtegida>}
        />
        <Route
          path="/duplicar-actividad/:id"
          element={<RutaProtegida rol="organizador"><NuevaActividad modo="duplicar" /></RutaProtegida>}
        />
        <Route 
        path="/perfil" 
        element={<RutaProtegida><Perfil /></RutaProtegida>} />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;