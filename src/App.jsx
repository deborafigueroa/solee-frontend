import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DetalleEvento from "./pages/DetalleEvento";
import PanelOrganizador from "./pages/PanelOrganizador";
import RutaProtegida from "./components/RutaProtegida";
import NuevaActividad from "./pages/NuevaActividad";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<RutaProtegida><Home /></RutaProtegida>} />
        <Route path="/evento/:id" element={<RutaProtegida><DetalleEvento /></RutaProtegida>} />
        <Route path="/panel-organizador" element={<RutaProtegida rol="organizador"><PanelOrganizador /></RutaProtegida>}/>
        <Route path="/nueva-actividad" element={<RutaProtegida rol="organizador"><NuevaActividad /></RutaProtegida>}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;