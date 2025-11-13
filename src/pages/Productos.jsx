import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useLocation } from "react-router-dom";

export default function ListaProductosPorCategoria({ categoria }) {
  const [productosBase, setProductosBase] = useState([]);
  const { addItem } = useCart();
  const location = useLocation();


  const [cantidades, setCantidades] = useState({});


  const [sortBy, setSortBy] = useState("none");


  function sortProducts(arr, mode) {
    const a = [...arr];
    switch (mode) {
      case "price_desc":
        a.sort((x, y) => Number(y.precio ?? 0) - Number(x.precio ?? 0));
        break;
      case "price_asc":
        a.sort((x, y) => Number(x.precio ?? 0) - Number(y.precio ?? 0));
        break;
      case "stock_desc":
        a.sort((x, y) => Number(y.stock ?? 0) - Number(x.stock ?? 0));
        break;
      case "stock_asc":
        a.sort((x, y) => Number(x.stock ?? 0) - Number(y.stock ?? 0));
        break;
      case "alpha_asc":
        a.sort((x, y) =>
          String(x.nombre || "").localeCompare(String(y.nombre || ""), "es", {
            sensitivity: "base",
          })
        );
        break;
      default:
        break;
    }
    return a;
  }


  useEffect(() => {
    api
      .get("/productos")
      .then((res) => setProductosBase(res.data || []))
      .catch((err) => console.error("Error al obtener productos", err));
  }, []);


  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("search")?.toLowerCase() || "";
  }, [location.search]);


  const productosFiltrados = useMemo(() => {
    let arr = productosBase;

    if (categoria) {
      arr = arr.filter(
        (p) =>
          p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (searchQuery) {
      arr = arr.filter((p) =>
        String(p.nombre || "").toLowerCase().includes(searchQuery)
      );
    }

    return arr;
  }, [productosBase, categoria, searchQuery]);


  const productosOrdenados = useMemo(
    () => sortProducts(productosFiltrados, sortBy),
    [productosFiltrados, sortBy]
  );



  useEffect(() => {
    function onOrderPlaced(e) {
      const { items } = e.detail || {};
      if (!Array.isArray(items) || !items.length) return;


      setProductosBase((prev) =>
        prev.map((p) => {
          const hit = items.find((i) => Number(i.id) === Number(p.id));
          if (!hit) return p;
          const nuevoStock = Math.max(
            0,
            (Number(p.stock) || 0) - (Number(hit.qty) || 0)
          );
          return { ...p, stock: nuevoStock };
        })
      );


      setCantidades((prev) => {
        const next = { ...prev };
        for (const it of items) {
          const pid = Number(it.id);
          const prod = productosBase.find((p) => Number(p.id) === pid);
          if (!prod) continue;
          const newStock = Math.max(
            0,
            (Number(prod.stock) || 0) - (Number(it.qty) || 0)
          );
          if (next[pid] && next[pid] > newStock) {
            next[pid] = Math.max(1, newStock);
          }
        }
        return next;
      });
    }

    window.addEventListener("order-placed", onOrderPlaced);
    return () => window.removeEventListener("order-placed", onOrderPlaced);



  }, []);


  useEffect(() => {
    const handleProductoEliminado = (ev) => {
      const { id } = ev.detail || {};
      setProductosBase((prev) => prev.filter((p) => p.id !== id));
    };
    window.addEventListener("producto-eliminado", handleProductoEliminado);
    return () =>
      window.removeEventListener("producto-eliminado", handleProductoEliminado);
  }, []);

  const manejarCambioCantidad = (id, delta, stock) => {
    setCantidades((prev) => {
      const nueva = (prev[id] || 1) + delta;
      if (nueva < 1) return { ...prev, [id]: 1 };
      if (nueva > stock) return { ...prev, [id]: stock };
      return { ...prev, [id]: nueva };
    });
  };

  return (
    <div className="p-6">
      <h1 className="pt-30 text-3xl font-bold text-center mb-8 text-red-600">
        {categoria}
      </h1>


      <div className="mb-4 flex justify-end">
        <label className="text-sm text-gray-700 mr-2">Ordenar por:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="none">Sin orden</option>
          <option value="price_desc">Precio (De mayor a menor)</option>
          <option value="price_asc">Precio (De menor a mayor)</option>
          <option value="stock_desc">Stock (De mayor a menor)</option>
          <option value="stock_asc">Stock (De menor a mayor)</option>
          <option value="alpha_asc">Alfabéticamente (De la A a la Z)</option>
        </select>
      </div>

      {productosOrdenados.length === 0 ? (
        <p className="text-center text-gray-600">
          No hay productos disponibles en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosOrdenados.map((producto) => {
            const cantidad = cantidades[producto.id] || 1;
            const agotado = Number(producto.stock) <= 0;

            return (
              <div
                key={producto.id}
                className="bg-white shadow-md rounded-xl p-4 text-center relative mx-auto max-w-sm w-full flex flex-col items-center h-auto hover:shadow-lg transition transform hover:scale-105"
              >
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                  {producto.nombre}
                </h2>

                {producto.otc === 1 || producto.otc === true ? (
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded mb-2">
                    🏷️ Producto OTC
                  </span>
                ) : null}

                {producto.presentacion && (
                  <p className="text-sm text-gray-500 italic mb-2">
                    {producto.presentacion}
                  </p>
                )}

                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-40 object-contain mb-3"
                />

                <p className="text-gray-700 text-sm mb-2 px-2 line-clamp-2">
                  {producto.descripcion}
                </p>

                <p className="text-base font-medium text-green-600 mb-1">
                  S/ {producto.precio}
                </p>

                <p className="text-sm text-gray-600 mb-1">
                  {agotado ? (
                    <span className="text-red-600 font-bold">AGOTADO</span>
                  ) : (
                    `Stock disponible: ${producto.stock}`
                  )}
                </p>

                {!agotado && Number(producto.stock) < 20 && (
                  <div className="text-yellow-700 bg-yellow-100 rounded px-2 py-1 font-semibold w-full text-center mb-2 text-xs">
                    ¡Quedan pocas unidades!
                  </div>
                )}

                <div
                  className={`flex items-center justify-center gap-3 mt-2 mb-3 ${agotado ? "opacity-50" : ""
                    }`}
                >
                  <button
                    onClick={() =>
                      manejarCambioCantidad(
                        producto.id,
                        -1,
                        Number(producto.stock)
                      )
                    }
                    disabled={agotado}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2.5 py-1 rounded-full disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="text-base font-semibold">{cantidad}</span>
                  <button
                    onClick={() =>
                      manejarCambioCantidad(
                        producto.id,
                        1,
                        Number(producto.stock)
                      )
                    }
                    disabled={agotado}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-2.5 py-1 rounded-full disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addItem(producto, cantidad);
                  }}
                  disabled={agotado}
                  className={`mt-2 px-5 py-2 rounded-lg w-40 font-semibold shadow-md transition ${agotado
                    ? "bg-gray-400 text-white line-through cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                >
                  Añadir al carrito
                </button>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
