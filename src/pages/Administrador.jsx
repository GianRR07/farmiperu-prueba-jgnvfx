import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../lib/api";

export default function Administrador() {
  const [contenido, setContenido] = useState("Selecciona una opción");
  const [adminNombre, setAdminNombre] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminDni, setAdminDni] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoAdmin, setNuevoAdmin] = useState({
    nombre: "",
    dni: "",
    email: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const usuariosFiltrados = usuarios.filter((u) =>
    u.dni.toLowerCase().includes(busqueda.toLowerCase())
  );


  const navigate = useNavigate();

  useEffect(() => {
    const nombre = localStorage.getItem("nombreUsuario");
    const email = localStorage.getItem("email");
    const dni = localStorage.getItem("dni");
    const rol = localStorage.getItem("rolUsuario");

    if (rol !== "admin") {
      navigate("/login");
    } else {
      setAdminNombre(nombre || "");
      setAdminEmail(email || "");
      setAdminDni(dni || "");
    }
  }, [navigate]);

  const manejarClick = async (opcion) => {
    setContenido(opcion);
    setMensaje("");
    setUsuarios([]);

    if (
      opcion === "Lista de Administradores" ||
      opcion === "Lista de Clientes"
    ) {
      try {
  const res = await api.get("/usuarios");
        const filtro =
          opcion === "Lista de Administradores" ? "admin" : "cliente";
        const filtrados = res.data.filter((user) => user.rol === filtro);
        setUsuarios(filtrados);
      } catch (error) {
        setMensaje("Error al obtener los usuarios");
      }
    }

    if (opcion === "Eliminar producto") {
      obtenerProductos();
    }
    if (opcion === "Editar producto") {
      setEditProducto(null);
      obtenerProductosAdmin();
    }

  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("usuarioActualizado"));
    navigate("/");
  };

  const handleNuevoAdminChange = (e) => {
    const { name, value } = e.target;
    setNuevoAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const registrarAdmin = async (e) => {
    e.preventDefault();
    const { nombre, dni, email, password } = nuevoAdmin;

    if (!nombre || !dni || !email || !password) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    try {
  await api.post("/registro", {
        nombre,
        dni,
        email,
        password,
        rol: "admin",
      });
      setMensaje("Administrador registrado correctamente");
      setNuevoAdmin({ nombre: "", dni: "", email: "", password: "" });
    } catch (error) {
      if (error.response) {
        setMensaje(error.response.data);
      } else {
        setMensaje("Error al registrar administrador");
      }
    }
  };

  const obtenerProductos = async () => {
    try {
  const res = await api.get("/productos");
      setProductos(res.data);
    } catch (error) {
      setMensaje("Error al obtener productos");
    }
  };

  const obtenerProductosAdmin = async () => {
    try {
  const res = await api.get("/admin/productos");
      setProductos(res.data);
    } catch (error) {
      setMensaje("Error al obtener productos (admin)");
    }
  };

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (!confirmar) return;

    try {
  await api.delete(`/productos/${id}`);

      setProductos((prev) => prev.filter((p) => p.id !== id));

      window.dispatchEvent(new CustomEvent("producto-eliminado", { detail: { id } }));

      setMensaje("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setMensaje("Error al eliminar el producto");
    }
  };



  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    presentacion: "",
    imagen: "",
    stock: "",
    categoria: "",
    sirve_para: "",
    otc: false,
  });


  const [editProducto, setEditProducto] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    precio: "",
    presentacion: "",
    imagen: "",
    stock: "",
    categoria: "",
    sirve_para: "",
    otc: false,
  });


  const handleNuevoProductoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const registrarProducto = async (e) => {
    e.preventDefault();
    const { nombre, descripcion, precio, presentacion, imagen, stock, categoria, otc } = nuevoProducto;

    if (
      !nombre ||
      !descripcion ||
      !precio ||
      !presentacion ||
      !imagen ||
      stock === "" ||
      !categoria
    ) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    try {
  await api.post("/productos", {
        nombre,
        descripcion,
        precio,
        presentacion,
        imagen,
        stock,
        categoria,
        sirve_para: nuevoProducto.sirve_para || null,
        otc,
      });

      setMensaje("Producto registrado correctamente");
      setNuevoProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        presentacion: "",
        imagen: "",
        stock: "",
        categoria: "",
        sirve_para: "",
        otc: false,
      });
    } catch (error) {
      console.error(error);
      setMensaje("Error al registrar el producto");
    }
  };

  const normalizeCategoria = (c = "") => {
    const base = (c || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().trim();

    if (base.includes("farmaceut")) return "Productos Farmaceuticos";
    if (base.includes("dispositivo")) return "Dispositivos medicos";
    if (base.includes("sanitari")) return "Productos Sanitarios";
    if (base.includes("otros") || base === "otro") return "Otros";
    return "";
  };

  const normalizeSirvePara = (v) => {
    if (v == null) return "";                 // null/undefined
    if (Array.isArray(v)) return v.join(", "); // array -> "a, b, c"
    if (typeof v === "object") {
      // objeto -> "val1, val2"
      try {
        return Object.values(v).join(", ");
      } catch {
        return "";
      }
    }
    // si es string pero parece JSON de array
    const s = String(v).trim();
    if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.join(", ");
        if (parsed && typeof parsed === "object") return Object.values(parsed).join(", ");
      } catch { }
    }
    return s; // string normal
  };

  const pickSirvePara = (prod) =>
    normalizeSirvePara(
      prod.sirve_para ??
      prod.sirvePara ??
      prod.sirvepara ??
      prod.sirve_para_text ??
      ""
    );





  const handleEditStart = (prod) => {
    setEditProducto(prod.id);
    setEditForm({
      id: prod.id,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      presentacion: prod.presentacion,
      imagen: prod.imagen,
      stock: prod.stock,
      categoria: normalizeCategoria(prod.categoria || ""),
      sirve_para: pickSirvePara(prod),
      otc: prod.otc === 1 || prod.otc === true,
    });
  };



  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const actualizarProducto = async (e) => {
    e.preventDefault();
    const { id, nombre, descripcion, precio, presentacion, imagen, stock, categoria, otc } = editForm;

    if (
      !id ||
      !nombre ||
      !descripcion ||
      !precio ||
      !presentacion ||
      !imagen ||
      stock === "" ||
      !categoria
    ) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    try {
  await api.put(`/productos/${id}`, {
        nombre,
        descripcion,
        precio,
        presentacion,
        imagen,
        stock,
        categoria,
        sirve_para: String(editForm.sirve_para || "").trim() || null,
        otc,
    });

    setMensaje("Producto actualizado correctamente");
    setEditProducto(null);
      await obtenerProductosAdmin();
  } catch (error) {
    console.error(error);
    setMensaje("Error al actualizar el producto");
  }
};


function ReporteVentas() {
  const [granularity, setGranularity] = React.useState('day');
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [data, setData] = React.useState([]);
  const [msg, setMsg] = React.useState('');

  const fetchReport = async () => {
    try {
      const params = new URLSearchParams({ granularity });
      if (start) params.append('start', start);
      if (end) params.append('end', end);
  const res = await api.get(`/reports/sales?${params.toString()}`);
      setData(res.data);
      setMsg('');
    } catch (e) {
      setMsg('No se pudo obtener el reporte.');
    }
  };

  const formatoSoles = (v) => `S/ ${Number(v).toFixed(2)}`;
  const formatoUSD = (v) => `$ ${Number(v).toFixed(2)}`;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reporte de Ventas</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="border rounded px-2 py-1">
          <option value="day">Por día</option>
          <option value="week">Por semana</option>
          <option value="month">Por mes</option>
          <option value="year">Por año</option>
        </select>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded px-2 py-1" />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded px-2 py-1" />
        <button onClick={fetchReport} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Generar</button>
      </div>

      {msg && <p className="text-red-600 mb-2">{msg}</p>}

      {data.length === 0 ? (
        <p>No hay datos para mostrar.</p>
      ) : (
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">Periodo</th>
              <th className="px-4 py-2 border">Pedidos</th>
              <th className="px-4 py-2 border">Total (S/)</th>
              <th className="px-4 py-2 border">Total (USD)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} className="text-center">
                <td className="px-4 py-2 border">{r.periodo}</td>
                <td className="px-4 py-2 border">{r.pedidos}</td>
                <td className="px-4 py-2 border">{formatoSoles(r.total_pen)}</td>
                <td className="px-4 py-2 border">{formatoUSD(r.total_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RevisarVentas() {
  const [ventas, setVentas] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [q, setQ] = React.useState('');
  const [expanded, setExpanded] = React.useState({});

  const fetchVentas = async () => {
    try {
      setLoading(true);
      setMsg('');
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      if (q) params.append('q', q);
      params.append('limit', '200');

  const res = await api.get(`/orders?${params.toString()}`);
      setVentas(res.data || []);
    } catch (e) {
      console.error(e);
      setMsg('No se pudieron cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVentas();
  }, []);

  const fmtSoles = (v) => `S/ ${Number(v || 0).toFixed(2)}`;
  const fmtUSD = (v) => `$ ${Number(v || 0).toFixed(2)}`;

  const nombreComprador = (v) => {

    if (v.usuario_email || v.usuario_dni) {
      return v.usuario_email || v.usuario_dni;
    }
    if (v.guest_nombre || v.guest_email) {
      return `${v.guest_nombre || ''}${v.guest_email ? ' (' + v.guest_email + ')' : ''}`.trim();
    }
    return '—';
  };

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Revisar Ventas</h2>

      { }
      <div className="flex flex-wrap gap-3 mb-4">
        <input type="date" value={start} onChange={e => setStart(e.target.value)}
          className="border rounded px-2 py-1" />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)}
          className="border rounded px-2 py-1" />
        <input type="text" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Buscar por email/nombre/DNI/PayPal ID"
          className="border rounded px-2 py-1 w-64" />
        <button onClick={fetchVentas}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Buscar
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {msg && <p className="text-red-600 mb-2">{msg}</p>}

      {(!loading && ventas.length === 0) ? (
        <p>No hay ventas.</p>
      ) : (
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-3 py-2 border text-left">Fecha</th>
              <th className="px-3 py-2 border text-left">PayPal Order</th>
              <th className="px-3 py-2 border text-left">Comprador</th>
              <th className="px-3 py-2 border text-right">Total (S/)</th>
              <th className="px-3 py-2 border text-right">Total (USD)</th>
              <th className="px-3 py-2 border text-left">Estado</th>
              <th className="px-3 py-2 border text-center">Ítems</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <React.Fragment key={v.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 py-2 border">{new Date(v.fecha).toLocaleString()}</td>
                  <td className="px-3 py-2 border">{v.paypal_order_id || '—'}</td>
                  <td className="px-3 py-2 border">{nombreComprador(v)}</td>
                  <td className="px-3 py-2 border text-right">{fmtSoles(v.total_pen)}</td>
                  <td className="px-3 py-2 border text-right">{fmtUSD(v.total_usd)}</td>
                  <td className="px-3 py-2 border">{v.estado || '—'}</td>
                  <td className="px-3 py-2 border text-center">
                    <button
                      onClick={() => toggle(v.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {expanded[v.id] ? 'Ocultar' : 'Ver'}
                    </button>
                  </td>
                </tr>

                {expanded[v.id] && (
                  <tr>
                    <td className="px-3 py-2 border bg-gray-50" colSpan={7}>
                      {(!v.items || v.items.length === 0) ? (
                        <p className="text-sm text-gray-600">Sin ítems.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full table-auto border">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-2 py-1 border text-left">Producto</th>
                                <th className="px-2 py-1 border text-right">Precio (S/)</th>
                                <th className="px-2 py-1 border text-right">Cantidad</th>
                                <th className="px-2 py-1 border text-right">Subtotal (S/)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {v.items.map(it => (
                                <tr key={it.id}>
                                  <td className="px-2 py-1 border">{it.nombre}</td>
                                  <td className="px-2 py-1 border text-right">{fmtSoles(it.precio_pen)}</td>
                                  <td className="px-2 py-1 border text-right">{it.qty}</td>
                                  <td className="px-2 py-1 border text-right">
                                    {fmtSoles(Number(it.precio_pen) * Number(it.qty))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const renderContenido = () => {
  switch (contenido) {
    case "perfil":
      return (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            👤 Perfil del Administrador
          </h2>
          <p>
            <strong>Nombre:</strong> {adminNombre}
          </p>
          <p>
            <strong>Email:</strong> {adminEmail}
          </p>
          <p>
            <strong>DNI:</strong> {adminDni}
          </p>
        </div>
      );
    case "Registrar Nuevo Administrador":
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Registrar Nuevo Administrador
          </h2>
          <form onSubmit={registrarAdmin} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={nuevoAdmin.nombre}
              onChange={handleNuevoAdminChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              value={nuevoAdmin.dni}
              onChange={handleNuevoAdminChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              value={nuevoAdmin.email}
              onChange={handleNuevoAdminChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={nuevoAdmin.password}
              onChange={handleNuevoAdminChange}
              className="w-full p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Registrar
            </button>
          </form>
          {mensaje && (
            <p className="mt-4 text-red-600 font-medium">{mensaje}</p>
          )}
        </div>
      );
    case "Lista de Administradores":
    case "Lista de Clientes":
      return (
        <div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{contenido}</h2>
            <input
              type="text"
              placeholder="Buscar por DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full max-w-xs border-2 border-red-400 rounded-lg p-2 focus:outline-none focus:border-red-600 transition"
            />
          </div>


          {usuariosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600">No hay resultados.</p>
          ) : (
            <table className="min-w-full table-auto border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-800">
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">DNI</th>
                  <th className="px-4 py-2 border">Correo</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((user, idx) => (
                  <tr key={idx} className="text-center hover:bg-red-50 transition">
                    <td className="px-4 py-2 border">{user.nombre}</td>
                    <td className="px-4 py-2 border">{user.dni}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );

    case "Registrar Producto":
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">Registrar Producto</h2>
          <form onSubmit={registrarProducto} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del producto"
              value={nuevoProducto.nombre}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
            />
            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={nuevoProducto.descripcion}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="precio"
              placeholder="Precio"
              value={nuevoProducto.precio}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="presentacion"
              placeholder="Presentación (ej: Caja, Unidad, etc)"
              value={nuevoProducto.presentacion}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="imagen"
              placeholder="URL de la imagen"
              value={nuevoProducto.imagen}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={nuevoProducto.stock}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
            />

            <select
              name="categoria"
              value={nuevoProducto.categoria}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">------Selecciona una categoría-------</option>
              <option value="Productos Farmaceuticos">Productos Farmacéuticos</option>
              <option value="Dispositivos medicos">Dispositivos Médicos</option>
              <option value="Productos Sanitarios">Productos Sanitarios</option>
              <option value="Otros">Otros</option>
            </select>



            <textarea
              name="sirve_para"
              placeholder='Sirve para (ej: "fiebre, dolor de cabeza, congestión")'
              value={nuevoProducto.sirve_para}
              onChange={handleNuevoProductoChange}
              className="w-full p-2 border rounded"
            />


            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                name="otc"
                checked={nuevoProducto.otc}
                onChange={handleNuevoProductoChange}
              />
              Producto OTC (venta libre)
            </label>

            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Registrar Producto
            </button>
          </form>
          {mensaje && (
            <p className="mt-4 text-red-600 font-medium">{mensaje}</p>
          )}
        </div>
      );

    case "Eliminar producto":

      return (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold mb-4">Eliminar Producto</h2>

            <input
              type="text"
              placeholder="🔍 Buscar producto por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="mt-3 md:mt-0 w-full md:w-80 border-2 border-red-400 rounded-lg p-2 focus:outline-none focus:border-red-600 transition"
            />
          </div>

          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600">No hay productos disponibles.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="px-4 py-2 border">Nombre</th>
                    <th className="px-4 py-2 border">Precio</th>
                    <th className="px-4 py-2 border">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto) => (
                    <tr
                      key={producto.id}
                      className="text-center hover:bg-red-50 transition"
                    >
                      <td className="px-4 py-2 border">{producto.nombre}</td>
                      <td className="px-4 py-2 border">
                        S/ {Number(producto.precio).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => eliminarProducto(producto.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mensaje && (
            <p className="mt-4 text-center text-red-600 font-medium">{mensaje}</p>
          )}
        </div>
      );


    case "Editar producto":

      return (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>

            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="mt-3 md:mt-0 w-full md:w-80 border-2 border-blue-400 rounded-lg p-2 focus:outline-none focus:border-blue-600 transition"
            />
          </div>


          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-600">No hay productos disponibles.</p>
          ) : (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full table-auto border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="px-4 py-2 border">Nombre</th>
                    <th className="px-4 py-2 border">Precio</th>
                    <th className="px-4 py-2 border">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((p) => (
                    <tr
                      key={p.id}
                      className="text-center hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-2 border">{p.nombre}</td>
                      <td className="px-4 py-2 border">
                        S/ {Number(p.precio).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 border">
                        <button
                          onClick={() => handleEditStart(p)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {editProducto && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">

                <button
                  onClick={() => setEditProducto(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
                >
                  ×
                </button>

                <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                  Editar Producto: {editForm.nombre}
                </h3>

                <form onSubmit={actualizarProducto} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">
                        Nombre del producto
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ejemplo: Paracetamol 500mg"
                        value={editForm.nombre}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">
                        Precio (S/)
                      </label>
                      <input
                        type="number"
                        name="precio"
                        placeholder="Ejemplo: 15.90"
                        value={editForm.precio}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">
                        Presentación
                      </label>
                      <input
                        type="text"
                        name="presentacion"
                        placeholder="Ejemplo: Caja, Blíster, Unidad, etc."
                        value={editForm.presentacion}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">
                        Stock disponible
                      </label>
                      <input
                        type="number"
                        name="stock"
                        placeholder="Ejemplo: 50"
                        value={editForm.stock}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col md:col-span-2">
                      <label className="font-medium text-gray-700 mb-1">
                        URL de la imagen
                      </label>
                      <input
                        type="text"
                        name="imagen"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={editForm.imagen}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col md:col-span-2">
                      <label className="font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        placeholder="Ejemplo: Analgésico y antipirético para aliviar el dolor y la fiebre."
                        value={editForm.descripcion}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>

                    <div className="flex flex-col md:col-span-2">
                      <label className="font-medium text-gray-700 mb-1">
                        Sirve para
                      </label>
                      <textarea
                        name="sirve_para"
                        placeholder='Ej: "fiebre, dolor de cabeza, congestión"'
                        value={editForm.sirve_para}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                      />
                    </div>


                    <div className="flex flex-col md:col-span-2">
                      <label className="font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        name="categoria"
                        value={editForm.categoria}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">------Selecciona una categoría-------</option>
                        <option value="Productos Farmaceuticos">Productos Farmacéuticos</option>
                        <option value="Dispositivos medicos">Dispositivos Médicos</option>
                        <option value="Productos Sanitarios">Productos Sanitarios</option>
                        <option value="Otros">Otros</option>
                      </select>


                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          name="otc"
                          checked={editForm.otc}
                          onChange={handleEditChange}
                        />
                        Producto OTC (venta libre)
                      </label>


                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditProducto(null)}
                      className="bg-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-400 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                    >
                      Guardar cambios
                    </button>
                  </div>

                  {mensaje && (
                    <p className="mt-2 text-center text-red-600 font-medium">{mensaje}</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      );



    case "Generar Reporte de ventas":
      return <ReporteVentas />;

    case "Revisar Ventas":
      return <RevisarVentas />;


    default:
      return <p className="text-gray-600">{contenido}</p>;
  }
};

return (
  <div className="pt-30 bg-gray-50 min-h-screen max-h-screen overflow-y-auto px-6 pt-8">
    <h1 className="text-4xl font-bold text-red-600 mb-8">
      Bienvenido Administrador
    </h1>

    <div className="flex gap-6 min-h-[75vh]">
      <div className="w-1/4 bg-white shadow-md rounded-lg p-4 space-y-4">
        <button
          onClick={() => manejarClick("perfil")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Ver Perfil
        </button>
        <button
          onClick={() => manejarClick("Registrar Producto")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Registrar Producto
        </button>
        <button
          onClick={() => manejarClick("Registrar Nuevo Administrador")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Registrar Nuevo Administrador
        </button>
        <button
          onClick={() => manejarClick("Eliminar producto")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Eliminar producto
        </button>
        <button
          onClick={() => manejarClick("Editar producto")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Editar producto
        </button>
        <button
          onClick={() => manejarClick("Generar Reporte de ventas")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Generar Reporte de ventas
        </button>
        <button
          onClick={() => manejarClick("Revisar Ventas")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Revisar Ventas
        </button>
        <button
          onClick={() => manejarClick("Lista de Administradores")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Lista de Administradores
        </button>
        <button
          onClick={() => manejarClick("Lista de Clientes")}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Lista de Clientes
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="flex-1 bg-white shadow-md rounded-lg p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Sección activa
        </h2>
        {renderContenido()}
      </div>
    </div>
  </div>
);
}
