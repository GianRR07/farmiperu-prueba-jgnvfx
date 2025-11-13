import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MisPedidos from "./pages/MisPedidos";
import Productos from "./pages/Productos";
import Login from "./pages/Login";
import CarritoCompras from "./pages/CarritoCompras";
import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";
import LoginCliente from "./pages/LoginCliente";
import Administrador from "./pages/Administrador";
import ProductosFarmaceuticos from "./pages/ProductosFarmaceuticos";
import DispositivosMedicos from "./pages/DispositivosMedicos";
import ProductosSanitarios from "./pages/ProductosSanitarios";
import Otros from "./pages/Otros";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";


import "./style.css";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quienes-somos" element={<QuienesSomos />} />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/productos/farmaceuticos" element={<ProductosFarmaceuticos />} />
            <Route path="/productos/dispositivos" element={<DispositivosMedicos />} />
            <Route path="/productos/sanitarios" element={<ProductosSanitarios />} />
            <Route path="/productos/otros" element={<Otros />} />
            <Route path="/login" element={<Login />} />
            <Route path="/carrito" element={<CarritoCompras />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/cliente" element={<LoginCliente />} />
            <Route path="/admin" element={<Administrador />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/administrador" element={<Administrador />} />
          
          </Routes>
        </main>
        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}
