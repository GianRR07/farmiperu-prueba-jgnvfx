import React, { useState } from "react";

export default function QuienesSomos() {
  const [misionFlipped, setMisionFlipped] = useState(false);
  const [visionFlipped, setVisionFlipped] = useState(false);

  return (
    <div className="pt-35 px-4 md:px-10 lg:px-20 pb-15">
      <main className="max-w-7xl mx-auto space-y-12 text-center">
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
          Somos una empresa peruana dedicada al cuidado de la salud,
          comercialización, dispensación y expendio de productos farmacéuticos,
          dispositivos médicos y productos sanitarios de calidad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-center">
          <div
            className="perspective"
            onClick={() => setMisionFlipped(!misionFlipped)}
          >
            <div className={`flip-card ${misionFlipped ? "flipped" : ""}`}>
              <div className="flip-card-front bg-white border rounded-lg p-10 shadow-md flex items-center justify-center">
                <h3 className="text-2xl font-bold text-[#cf2e2e]">Misión</h3>
              </div>
              <div className="flip-card-back bg-white border rounded-lg p-10 shadow-md text-ml text-gray-700 flex items-center justify-center text-center">
                Brindar un servicio de calidad, ofreciendo productos seguros y
                eficaces para cuidar la salud con excelentes asesoramientos
                farmacéuticos, solucionando los diversos problemas de salud de
                la comunidad, acorde a las exigencias de las familias peruanas.
              </div>
            </div>
          </div>

          <div
            className="perspective"
            onClick={() => setVisionFlipped(!visionFlipped)}
          >
            <div className={`flip-card ${visionFlipped ? "flipped" : ""}`}>
              <div className="flip-card-front bg-white border rounded-lg p-10 shadow-md flex items-center justify-center">
                <h3 className="text-2xl font-bold text-[#cf2e2e]">Visión</h3>
              </div>
              <div className="flip-card-back bg-white border rounded-lg p-10 shadow-md text-ml text-gray-700 flex items-center justify-center text-center">
                Ser el establecimiento farmacéutico peruano con autenticidad,
                reconocimiento y aceptación por los ciudadanos en cuidado del
                bienestar y la salud de todas las familias peruanas.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#cf2e2e] text-white text-lg md:text-xl py-6 px-4 rounded-md shadow-md">
          Como profesionales de la salud tenemos más de 10 años en el sector,
          cuidando la salud y el bienestar de todas las familias peruanas.
        </div>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-[#cf2e2e] mb-8">
            Nuestros valores
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <img
                src="/images/valor1.PNG"
                alt="valor1"
                className="mx-auto w-24 h-24 object-contain"
              />
              <p className="text-sm text-gray-700">
                Personas capacitadas y<br />
                honestas al cumplir sus funciones
              </p>
            </div>
            <div className="text-center space-y-2">
              <img
                src="/images/valor2.PNG"
                alt="valor2"
                className="mx-auto w-24 h-24 object-contain"
              />
              <p className="text-sm text-gray-700">
                Dedicados a la atención personalizada
                <br />
                de nuestros pacientes y sus necesidades
              </p>
            </div>
            <div className="text-center space-y-2">
              <img
                src="/images/valor3.PNG"
                alt="valor3"
                className="mx-auto w-24 h-24 object-contain"
              />
              <p className="text-sm text-gray-700">
                Comprometidos con la salud y<br />
                el bienestar de nuestros pacientes
              </p>
            </div>
            <div className="text-center space-y-2">
              <img
                src="/images/valor4.PNG"
                alt="valor4"
                className="mx-auto w-24 h-24 object-contain"
              />
              <p className="text-sm text-gray-700">
                Personal con liderazgo
                <br />
                absoluto
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
