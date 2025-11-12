import { useCart } from "../context/CartContext";
import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function CarritoCompras({ isOpen, onClose }) {
  const open = isOpen ?? true;
  const { items, setQty, removeItem, clearCart, totalItems, totalPrice } =
    useCart();
  const [showPay, setShowPay] = useState(false);
  const PEN_TO_USD = 0.27; 
  const totalUSD = (Number(totalPrice) * PEN_TO_USD).toFixed(2);
console.log("🧠 Render del carrito activo");

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold text-red-600">Tu Carrito</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-600 text-xl"
        >
          &times;
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-9rem)]">
        {items.length === 0 ? (
          <p className="text-gray-600">Tu carritoooo está vacío.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-center border-b pb-3"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-14 h-14 object-contain border rounded"
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
              <div className="flex-1">
                <p className="font-medium">{item.nombre}</p>
                {item.presentacion && (
                  <p className="text-xs text-gray-500">{item.presentacion}</p>
                )}
                <p className="text-sm text-green-700 font-semibold">
                  S/ {Number(item.precio).toFixed(2)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="px-2 py-1 border rounded"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="w-14 border rounded px-2 py-1 text-center"
                    value={item.qty}
                    onChange={(e) =>
                      setQty(item.id, Number(e.target.value || 1))
                    }
                    min={1}
                  />
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-sm text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t space-y-2">
        <div className="flex justify-between text-sm text-gray-700">
          <span>Items:</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>S/ {totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={clearCart}
            disabled={items.length === 0}
            className="flex-1 border rounded py-2 disabled:opacity-50"
          >
            Vaciar
          </button>
          <button
            disabled={items.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2 disabled:opacity-50"
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  );
}
