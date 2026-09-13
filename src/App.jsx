import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DetalleEvento from "./pages/DetalleEvento";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/evento/:id" element={<DetalleEvento />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;