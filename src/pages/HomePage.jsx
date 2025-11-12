import { useState, useEffect } from "react";

const slides = [
  { image: "/images/farmacias-1.png", alt: "Oferta 1" },
  { image: "/images/farmacias-2.png", alt: "Oferta 2" },
  { image: "/images/farmacias-3.png", alt: "Oferta 3" },
  { image: "/images/farmacias-4.png", alt: "Oferta 4" },
  { image: "/images/farmacias-5.png", alt: "Oferta 5" },
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrent((current + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((current - 1 + slides.length) % slides.length);

  return (
    <div className="pt-20 w-full mt-5">
      <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg shadow-lg">
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide.image}
            alt={slide.alt}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionProperty: "opacity" }}
          />
        ))}

        <button
          onClick={prevSlide}
          aria-label="Anterior"
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition"
        >
          &#8592;
        </button>
        <button
          onClick={nextSlide}
          aria-label="Siguiente"
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 hover:bg-opacity-90 transition"
        >
          &#8594;
        </button>
      </div>

      {}
      <div className="mt-12 w-full flex flex-col items-center space-y-4 px-4">
        <img
          src="/images/logo.png"
          alt="Farmacias Perú Logo"
          className="w-24 md:w-24"
        />

        <p className="text-center text-lg md:text-xl">
          Bienestar en cada receta,{" "}
          <span className="text-red-600 font-semibold">Farmacias Perú</span>, tu
          elección correcta.
        </p>
      </div>
    </div>
  );
}
