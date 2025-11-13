import axios from "axios";

// Lee la variable de entorno y la normaliza para evitar que un valor sin protocolo
// (por ejemplo: "farmi-serve-production.up.railway.app") se convierta en una ruta
// relativa como `/farmi-serve-production.up.railway.app/productos` en producción.
const raw = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// Si no empieza con http:// o https://, asumimos https://
let normalized = String(raw).trim();
if (!/^https?:\/\//i.test(normalized)) {
  normalized = `https://${normalized}`;
}

// Elimina slash final para evitar dobles // al concatenar rutas
normalized = normalized.replace(/\/$/, "");

export const API_BASE = normalized;

export const api = axios.create({
  baseURL: API_BASE,
  // puedes añadir headers comunes aquí si los necesitas
});

export default api;
