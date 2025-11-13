import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../lib/api";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  useEffect(() => {
    const onCartState = (ev) => {
      const abierto = !!ev?.detail?.abierto;
      setCarritoAbierto(abierto);
      console.log("[Chatbot] cart-state-change received:", abierto);
    };
    window.addEventListener("cart-state-change", onCartState);
    return () => window.removeEventListener("cart-state-change", onCartState);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("nombreUsuario")
  );


  

  useEffect(() => {
    const handleLoginChange = () => {
      const loggedIn = !!localStorage.getItem("nombreUsuario");
      setIsLoggedIn(loggedIn);
      resetChat();
    };

    window.addEventListener("loginStateChanged", handleLoginChange);
    return () => window.removeEventListener("loginStateChanged", handleLoginChange);
  }, []);

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        from: "bot",
        text: "Hola, ¿necesitas ayuda para escoger tu medicamento?",
      },
    ]);
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      resetChat();
    }
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setText("");

    const typingId = Date.now() + 0.5;
    setMessages((prev) => [
      ...prev,
      { id: typingId, from: "bot", text: "Pensando…" },
    ]);

    try {
      const resp = await fetch(
        `${API_BASE}/chat-llm?q=${encodeURIComponent(trimmed)}`
      );
      const data = await resp.json();
      const reply =
        data?.reply || "Disculpa, no entendí bien. ¿Puedes reformular?";
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        { id: Date.now() + 1, from: "bot", text: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== typingId),
        {
          id: Date.now() + 1,
          from: "bot",
          text: "Hubo un problema al procesar tu consulta. Intenta nuevamente.",
        },
      ]);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 w-80 max-h-[26rem] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300"
          role="dialog"
          aria-label="Chat con asistente"
          style={{
            right: carritoAbierto ? 320 : 16,
          }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <h3 className="font-semibold">Asistente</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label="Cerrar chat"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.from === "bot"
                    ? "bg-gray-100 text-gray-900"
                    : "bg-blue-600 text-white ml-auto"
                  }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              </div>
            ))}
            <div ref={endRef} />
          </div>


          <form onSubmit={handleSend} className="p-3 border-t">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      )}


      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat"
        style={{
          bottom: 16,
          right: carritoAbierto ? 320 : 16,
        }}
        className="fixed h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 z-50 flex items-center justify-center transition-all duration-300"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7">
          <path
            d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </>
  );
}
