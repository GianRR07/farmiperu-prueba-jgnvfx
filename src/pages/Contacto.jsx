export default function Contacto() {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-8 lg:px-24 ">
      <main className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-red-600 mb-20 mt-25">
          ¡Mantente en línea!
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 ">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-red-700 mb-2">
                Llámanos
              </h3>
              <p className="text-gray-700">(01) 729 8980</p>
              <p className="text-gray-700">(51) 920 098 339</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-red-700 mb-2">
                Escríbenos
              </h3>
              <p className="text-gray-700">corporacionqf@farmaciasperu.pe</p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-red-700 mb-2">
                Visítanos en
              </h3>
              <p className="text-gray-700">
                Jr. Río Santa 295, Urb. Covida II Etapa. Los Olivos, Perú
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-red-700 mb-2">
                Habla con nosotros directamente
              </h3>
              <p className="text-gray-700">920 098 339</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-red-700 mb-4">
              Ubicación en Google Maps
            </h3>
            <div className="w-full aspect-video">
              <iframe
                title="Ubicación de la empresa"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d243.91782304746232!2d-77.083594!3d-11.996273!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105cfd076e0f751%3A0x980c78035b816af4!2sFARMACIAS%20PER%C3%9A!5e0!3m2!1ses!2spe!4v1757974766130!5m2!1ses!2spe"
                width="100%"
                height="100%"
                className="rounded shadow-lg border-0 w-full h-full"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
