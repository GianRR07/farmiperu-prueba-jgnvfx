import React, { useState, useEffect } from "react";
import axios from "axios";
import { api, API_BASE } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [dniError, setDniError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { clearCart } = useCart();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "nombre") setNombre(value);
    else if (name === "dni") {
      setDni(value);
      if (!/^\d{8}$/.test(value)) {
        setDniError("Coloca tu DNI completo");
      } else {
        setDniError("");
      }
    } else if (name === "email") {
      setEmail(value);
      if (!value.includes("@") || !value.includes(".")) {
        setEmailError("Coloca un correo electrónico válido");
      } else {
        setEmailError("");
      }
    } else if (name === "password") {
      setPassword(value);
      evaluarContraseña(value);
    }
  };

  const evaluarContraseña = (pwd) => {
    const tieneNumero = /\d/.test(pwd);
    const tieneSimbolo = /[^A-Za-z0-9]/.test(pwd);
    const tieneMinimo = pwd.length >= 5;

    if (tieneMinimo && tieneNumero && tieneSimbolo) {
      setPasswordHint("Contraseña segura");
    } else if (!tieneMinimo && !tieneNumero && !tieneSimbolo) {
      setPasswordHint("Coloca mínimo 5 caracteres, 1 número y un símbolo");
    } else if (!tieneMinimo && !tieneNumero && tieneSimbolo) {
      setPasswordHint("Agregale un número y mínimo 5 caracteres");
    } else if (!tieneMinimo && tieneNumero && !tieneSimbolo) {
      setPasswordHint("Agregale un símbolo y mínimo 5 caracteres");
    } else if (tieneMinimo && !tieneNumero && !tieneSimbolo) {
      setPasswordHint("Agregale un número y un símbolo");
    } else if (tieneMinimo && tieneNumero && !tieneSimbolo) {
      setPasswordHint("Agregale un símbolo");
    } else if (tieneMinimo && !tieneNumero && tieneSimbolo) {
      setPasswordHint("Agregale un número");
    } else {
      setPasswordHint("Coloca mínimo 5 caracteres, 1 número y un símbolo");
    }
  };

  const validarRegistro = () => {
    if (!nombre.trim()) return "El nombre es obligatorio";
    if (!/^\d{8}$/.test(dni)) return "Coloca tu DNI completo";
    if (!email.includes("@") || !email.includes(".")) return "Correo no válido";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      const error = validarRegistro();
      if (error) {
        setMessage(error);
        setTimeout(() => setMessage(""), 4000);
        return;
      }
    }

    try {
      const data = isLogin
        ? { email, password }
        : { nombre, dni, email, password };
      const response = await api.post(isLogin ? "/login" : "/registro", data);

      if (isLogin) {
        const { nombre: nombreUsuario, rol, email, dni } = response.data;
        localStorage.setItem("nombreUsuario", nombreUsuario);
        localStorage.setItem("rolUsuario", rol);
        localStorage.setItem("email", email);
        localStorage.setItem("dni", dni);
         localStorage.setItem("userId", dni);
        clearCart();
        setIsLoggedIn(true);
        window.dispatchEvent(new Event("loginStateChanged"));

        setMessage("Iniciaste sesión con éxito");

        setTimeout(() => {
          if (rol === "admin") {
            navigate("/administrador");
          } else {
            navigate("/cliente");
          }
        }, 1000);
      } else {
        setMessage("Usuario registrado correctamente");
        setTimeout(() => setMessage(""), 4000);
      }
    } catch (error) {
      if (error.response)
        setMessage(error.response.data || "Error al procesar solicitud");
      else setMessage("Error de conexión. Intenta más tarde");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("rolUsuario");
    localStorage.removeItem("email");
    localStorage.removeItem("dni");
    localStorage.removeItem("userId"); 


    clearCart();

    window.dispatchEvent(new Event("loginStateChanged"));
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const nombre = localStorage.getItem('nombreUsuario');
    if (nombre) {
     
      navigate('/cliente');
    }
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden md:flex">
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-6 text-red-600">
            {isLogin ? "Iniciar sesión" : "Registrarse"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label
                    htmlFor="nombre"
                    className="block mb-2 font-semibold text-gray-700"
                  >
                    Nombre:
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={nombre}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu nombre"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dni"
                    className="block mb-2 font-semibold text-gray-700"
                  >
                    DNI:
                  </label>
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    value={dni}
                    onChange={handleInputChange}
                    placeholder="8 dígitos"
                    required
                    maxLength={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {dniError && (
                    <p className="text-red-600 text-sm mt-1">{dniError}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block mb-2 font-semibold text-gray-700"
              >
                Correo electrónico:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                placeholder="Ingresa tu correo"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {emailError && (
                <p className="text-red-600 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 font-semibold text-gray-700"
              >
                Contraseña:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                placeholder="Ingresa tu contraseña"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {password && (
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {passwordHint.includes("segura") ? (
                    <span className="text-green-600">{passwordHint}</span>
                  ) : (
                    <span className="text-red-600">{passwordHint}</span>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              {isLogin ? "Iniciar sesión" : "Registrar"}
            </button>
          </form>

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setNombre("");
              setDni("");
              setEmailError("");
              setDniError("");
              setPasswordHint("");
            }}
            className="mt-4 text-sm text-red-600 hover:underline focus:outline-none"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>

          {message && (
            <div className="mt-4 p-3 rounded bg-red-100 text-red-700 font-medium">
              {message}
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-col justify-center bg-red-600 text-white p-8 md:w-1/2">
          <h2 className="text-3xl font-bold mb-4">¡Promoción de la semana!</h2>
          <p className="text-lg leading-relaxed">
            Obtén un <span className="font-bold">20% de descuento</span> en
            todos nuestros productos farmacéuticos. ¡Aprovecha la oferta!
          </p>
        </div>
      </div>
    </div>
  );
}
