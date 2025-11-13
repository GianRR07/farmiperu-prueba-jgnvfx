import axios from "axios";

export const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE,
  // Puedes añadir headers comunes aquí si los necesitas
});

export default api;
