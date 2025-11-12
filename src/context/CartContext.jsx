import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("cart_items");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1, onError) => {
  setItems((prev) => {
    const i = prev.findIndex((p) => p.id === product.id);
    const stock = product.stock ?? 0;
    if (i !== -1) {
      const cantidadActual = prev[i].qty;
      if (cantidadActual + qty > stock) {
        if (onError) onError("No puedes agregar más unidades que el stock disponible.");
        return prev;
      }
      const copy = [...prev];
      copy[i] = { ...copy[i], qty: cantidadActual + qty };
      return copy;
    }
    if (qty > stock) {
      if (onError) onError("No puedes agregar más unidades que el stock disponible.");
      return prev;
    }
    return [
      ...prev,
      {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        imagen: product.imagen,
        presentacion: product.presentacion,
        qty,
        stock,
      },
    ];
  });
};

  const removeItem = (id) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const setQty = (id, qty) => {
  setItems((prev) =>
    prev.map((p) => {
      if (p.id === id) {
        if (qty > (p.stock ?? 0)) {
          
          return { ...p, qty: p.stock ?? 0 };
        }
        return { ...p, qty: Math.max(1, qty) };
      }
      return p;
    }).filter((p) => p.qty > 0)
  );
};

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((acc, it) => acc + it.qty, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((acc, it) => acc + it.qty * Number(it.precio || 0), 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    setQty,
    clearCart,
    totalItems,
    totalPrice,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
