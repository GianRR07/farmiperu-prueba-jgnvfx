import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


const icon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
});


const obtenerDireccion = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data.display_name || "Dirección desconocida";
  } catch {
    return "Error al obtener dirección";
  }
};


const buscarDireccion = async (texto) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        texto
      )}&addressdetails=1`
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        direccion: data[0].display_name,
      };
    }
    return null;
  } catch {
    return null;
  }
};


function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}


function LocationMarker({ onSeleccion }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const direccion = await obtenerDireccion(lat, lng);
      onSeleccion({ lat, lng, direccion });
    },
  });
  return null;
}

export default function DireccionMap({ onDireccionSeleccionada }) {
  const [principal, setPrincipal] = useState(null); 
  const [temporal, setTemporal] = useState(null); 
  const [center, setCenter] = useState([-12.0464, -77.0428]);
  const [cargando, setCargando] = useState(true);
  const inputRef = useRef(null);

  
 useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const dir = await obtenerDireccion(latitude, longitude);
        const info = { lat: latitude, lng: longitude, direccion: dir };
        setPrincipal(info);
        setCenter([latitude, longitude]);
        setCargando(false);
        
      },
      () => setCargando(false)
    );
  } else {
    setCargando(false);
  }
}, []);



  const handleBuscar = async () => {
    const texto = inputRef.current.value.trim();
    if (!texto) return;
    const resultado = await buscarDireccion(texto);
    if (resultado) {
      setTemporal(resultado);
      setCenter([resultado.lat, resultado.lng]);
    } else {
      alert("No se encontró esa dirección");
    }
  };


  const guardarDireccion = () => {
    if (!temporal) return alert("Selecciona una dirección primero");
    setPrincipal(temporal);
    onDireccionSeleccionada(temporal);
    setTemporal(null);
    alert("✅ Dirección principal actualizada");
  };


  const irADireccionPrincipal = () => {
    if (principal) setCenter([principal.lat, principal.lng]);
  };

  return (
    <div className="space-y-4">
     
      {principal && (
        <div
          onClick={irADireccionPrincipal}
          className="cursor-pointer bg-green-50 p-3 rounded-md shadow hover:bg-green-100 transition"
        >
          <strong className="text-green-700">Dirección principal:</strong>
          <p className="underline text-green-800">{principal.direccion}</p>
          <p className="text-xs text-gray-600">(Haz clic para ir a esta ubicación)</p>
        </div>
      )}

    
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar dirección (ej. Av. Arequipa 123, Lima)"
          className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleBuscar}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Buscar
        </button>
      </div>

     
      <div className="border rounded-lg overflow-hidden shadow-md">
        {cargando ? (
          <p className="text-center p-4">Obteniendo ubicación actual...</p>
        ) : (
          <MapContainer
            center={center}
            zoom={14}
            style={{ height: "400px", width: "100%" }}
          >
            <ChangeView center={center} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            <LocationMarker
              onSeleccion={(info) => {
                setTemporal(info);
                setCenter([info.lat, info.lng]);
              }}
            />
            {principal && <Marker position={[principal.lat, principal.lng]} icon={icon} />}
            {temporal && <Marker position={[temporal.lat, temporal.lng]} icon={icon} />}
          </MapContainer>
        )}
      </div>

     
      {temporal && (
        <div className="bg-white p-3 rounded-md shadow text-sm text-gray-700">
          <strong>Nueva dirección seleccionada:</strong>
          <p>{temporal.direccion}</p>
        </div>
      )}

   
      <button
        onClick={guardarDireccion}
        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
      >
        Guardar dirección como principal
      </button>
    </div>
  );
}
