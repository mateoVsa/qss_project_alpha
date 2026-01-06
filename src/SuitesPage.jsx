import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import "react-datepicker/dist/react-datepicker.css";
import "./assets/principal-page/style.css";

import Disponibilidad from "./Disponibilidad";
import ReservaCard from "./ReservaCard";
import SelectorPersonas from "./SelectorPersonas";

import { toDate, normalizeToMidday, safeFormat } from "./utils/dateHelpers";
import { Rss } from "lucide-react";

import API_URL from "./config/api";

const SuitesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suite, setSuite] = useState(null);
  const [people, setPeople] = useState(1);
  const [nights, setNights] = useState(1);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [extraBeds, setExtraBeds] = useState(0);
  const [backendPrice, setBackendPrice] = useState(null);
  const [precios, setPrecios] = useState({});

  const [disabledRanges, setDisabledRanges] = useState([]);

  const [includeTransport, setIncludeTransport] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [precioData, setPrecioData] = useState(null);


  // === FETCH DESFECHAS BLOQUEADAS ===
  useEffect(() => {
    const fetchDisabledDates = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/reservations/disabled_dates/${id}`
        );

        const dates = response.data.map((d) => new Date(d));
        setDisabledRanges(dates);
      } catch (error) {
        console.error("Error cargando fechas bloqueadas", error);
      }
    };

    if (id) fetchDisabledDates();
  }, [id]);

  // === FETCH SUITE ===
  useEffect(() => {
    axios
      .get(`${API_URL}/suites/${id}`)
      .then((response) => {
        setSuite(response.data);

        if (response.data.images?.length > 0) {
          const url = response.data.images[0].image_url.replace("dl=0", "raw=1");
          setSelectedImage(url);
        }

        if (response.data.fechas_reservadas) {
          const ranges = response.data.fechas_reservadas.map(
            ({ start_date, end_date }) => ({
              start: normalizeToMidday(toDate(start_date)),
              end: normalizeToMidday(toDate(end_date)),
            })
          );
          setDisabledRanges(ranges);
        }
      })
      .catch((error) => console.error("Error obteniendo suite", error));
  }, [id]);

  // === CALCULAR NOCHES ===
  useEffect(() => {
    if (!startDate || !endDate) return;
    const diff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setNights(Math.max(1, days));
  }, [startDate, endDate]);

 
  const calcularPrecioFrontend = () => {
  if (!suite || !startDate || !endDate) return;

  const precioBase = Number(suite.precio);
  const maxCap = Number(suite.max_capacity);
  const precioColchon = 12; // costo por colchon que mencionaste
  const noches = nights;

  // --- Precio base ---
  const totalBase = precioBase * noches;

  // --- Personas extra ---
  const personasExtra = Math.max(0, people - maxCap);

  // 🔥 20% por CADA persona extra por noche
  const incrementoPersonas = totalBase * 0.20 * (people - 1);

  // --- Colchones extra automáticos ---
  const colchonesExtra = personasExtra;
  const totalColchon = colchonesExtra * precioColchon * noches;

  // --- Transporte (si el usuario marcó la casilla) ---
  const costoTransporte = includeTransport ? 20 : 0;  

  // --- TOTAL ---
  const total =
    totalBase + incrementoPersonas + totalColchon + costoTransporte;

  setPrecioData({
    noches,
    personas: people,
    colchonesExtra,
    includeTransport,
    desglose: {
      totalBase,
      incrementoPersonas,
      totalColchon,
      costoTransporte,
    },
    total,
  });
};

useEffect(() => {
  calcularPrecioFrontend();
}, [suite, people, nights, startDate, endDate, includeTransport]);


  const handleReservar = async () => {
    if (!startDate || !endDate) {
      alert("Debes seleccionar fecha de entrada y salida.");
      return;
    }

    if (endDate <= startDate) {
      alert("La fecha de salida debe ser posterior a la entrada.");
      return;
    }
    if(!precioData){
      alert("No se pudo calcular el precio")
      return;
    }

    try{
      const response = await axios.post(`${API_URL}/api/reservations/calcular-precio`,
        {
          suite_id: suite.id,
          start_date: startDate,
          end_date: endDate,
          personas: people,
          colchonesExtra: precioData.colchonesExtra,
          includeTransport,
          expectedTotal: precioData.total
        }
      );
      if(!response.data.ok){
        alert(response.data.message || "No se pudo validar la reserva")
        return;
      }
        navigate("/detalle-compra", {
      state: {
        suite,
        people,
        startDate: toDate(startDate),
        endDate: toDate(endDate),
        colchonesExtra: precioData.colchonesExtra,
        totalPrice: precioData.total,
        includeTransport,
      },
    });

    }catch(error){
      console.error(error)
      alert("Error de validacion. Intenta nuevamente")
    }
  };

  if (!suite) return <p className="text-center mt-5">Cargando suite...</p>;

  const maxPersonas = suite.max_capacity;
  const maxVisibleThumbnails = 18;

  const visibleThumbnails =
    suite.images?.slice(currentIndex, currentIndex + maxVisibleThumbnails) || [];

  const nextThumbnails = () => {
    if (currentIndex + maxVisibleThumbnails < suite.images.length) {
      setCurrentIndex(currentIndex + maxVisibleThumbnails);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevThumbnails = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - maxVisibleThumbnails));
    } else {
      const lastIndex = Math.max(
        0,
        suite.images.length - maxVisibleThumbnails
      );
      setCurrentIndex(lastIndex);
    }
  };

  // === FORMATEAR TEXTOS CON VIÑETAS ===
  const formatText = (text) => {
    if (!text) return "";

    const bulletRegex = /^[\-\*•]\s+/;
    const lines = text.split("\n");

    let html = "";
    let inList = false;

    for (const line of lines) {
      if (bulletRegex.test(line.trim())) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${line.replace(bulletRegex, "")}</li>`;
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<p>${line}</p>`;
      }
    }

    if (inList) html += "</ul>";
    return html;
  };
//formatear precios
const formatoPrecio = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
  // === WHATSAPP ===
  const handleWhatsAppClick = () => {
    const adminPhoneNumber = "593995921047";

    const message = `Necesito más información de la suite "${suite.nombre}". 
Personas: ${people}
Entrada: ${safeFormat(startDate)}
Salida: ${safeFormat(endDate)}`;

    window.open(
      `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const getImageUrl = (url) => {
  if (!url) return "";

  // Si ya es una URL absoluta → NO tocarla
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Si viene de Dropbox
  if (url.includes("dropbox.com")) {
    return url.replace(/dl=0|dl=1/, "raw=1");
  }

  // Caso normal: imágenes locales
  return `${API_URL}${url}`;
};

  const getIconPath = (comodidad) => {
    const icons = import.meta.glob(
      "/src/assets/icons/comodidades/*.svg",
      { eager: true }
    );
    return icons[`/src/assets/icons/comodidades/${comodidad.icono}`]?.default;
  };

  return (
    <div className="container suite-page">
      {/* ===== TITULO ===== */}
      <div className="mb-4 text-center">
        <h1 className="fw-bold suite-title">{suite.nombre}</h1>
        <hr className="custom-line mx-auto" />
        <p
          className="suite-text text-muted"
          dangerouslySetInnerHTML={{ __html: formatText(suite.descripcion) }}
        ></p>
        <hr className="custom-line2 mx-auto" />
      </div>

      {/* ===== LIGHTBOX ===== */}
      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        index={currentImageIndex}
        slides={suite.images.map((img) => ({
          src: getImageUrl(img.image_url),
        }))}
      />

      {/* ===== IMAGEN PRINCIPAL ===== */}
      <div className="row my-4">
        <div className="col-12 text-center">
          {!isImageLoaded && <div className="image-skeleton"></div>}

          {selectedImage && (
            <img
              src={getImageUrl(selectedImage)}
              className="img-fluid rounded main-image"
              style={{
                width: "100%",
                maxHeight: "500px",
                objectFit: "cover",
                cursor: "pointer",
                display: isImageLoaded ? "block" : "none",
              }}
              onLoad={() => setIsImageLoaded(true)}
              onClick={() => {
                setCurrentImageIndex(
                  suite.images.findIndex(
                    (img) =>
                      getImageUrl(img.image_url) === getImageUrl(selectedImage)
                  )
                );
                setOpenLightbox(true);
              }}
            />
          )}
        </div>

        {/* ===== MINIATURAS ===== */}
        <div className="thumbnail-carousel d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn-img btn-outline-secondary me-2"
            onClick={prevThumbnails}
            disabled={currentIndex === 0}
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>

          <div className="d-flex justify-content-center flex-wrap gap-2">
            {visibleThumbnails.map((img, i) => (
              <img
                key={i}
                src={getImageUrl(img.image_url)}
                className={`img-thumbnail ${
                  selectedImage === getImageUrl(img.image_url)
                    ? "border-primary"
                    : ""
                }`}
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedImage(getImageUrl(img.image_url))}
              />
            ))}
          </div>

          <button
            className="btn-img btn-outline-secondary ms-2"
            onClick={nextThumbnails}
            disabled={
              currentIndex + maxVisibleThumbnails >= suite.images.length
            }
          >
            <span className="material-symbols-outlined">
              arrow_forward_ios
            </span>
          </button>
        </div>
      </div>

      {/* ===== LAYOUT PRINCIPAL ===== */}
      <div className="row mt-5">
        {/* ===== DETALLES DE LA SUITE ===== */}
        <div className="col-lg-8">
          <div className="p-4 shadow-sm rounded">
            <h3 className="mb-4 pb-2 section-divider">Detalles de la Suite</h3>

            {/* COMODIDADES */}
            <div className="py-4 section-divider">
              <h5 className="fw-bold mb-3">Comodidades</h5>

              <ul className="row list-unstyled g-3">
                {suite.comodidades?.length ? (
                  suite.comodidades.map((c, i) => (
                    <li key={i} className="col-6 d-flex align-items-center">
                      <img
                        src={getIconPath(c)}
                        alt={c.nombre}
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                        className="me-2"
                      />
                      {c.nombre}
                    </li>
                  ))
                ) : (
                  <p className="text-muted">Sin comodidades registradas.</p>
                )}
              </ul>
            </div>

            {/* ZONA */}
            <div className="py-5 section-divider">
              <h5 className="fw-bold mb-2">Zona estratégica</h5>
              <p>{suite.zona_estrategica}</p>
            </div>

            {/* MOVILIDAD */}
            <div className="py-5 section-divider">
              <h5 className="fw-bold mb-2">Movilidad</h5>
              <p>{suite.desc_movilidad}</p>
            </div>

            {/* DISPONIBILIDAD */}
            <div className="py-5">
              <Disponibilidad
                suiteId={suite.id}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                disabledRanges={disabledRanges}
              />
            </div>
          </div>
        </div>

        {/* ===== COSTOS Y RESERVA ===== */}
        <div className="col-md-4">
          <div className="sticky-top" style={{ top: "150px", zIndex: 1 }}>
            <div className="card p-3 shadow-sm">
              <ReservaCard
                pricePerNight={suite.precio}
                capacity={suite.max_capacity}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                disabledRanges={disabledRanges}
                nights={nights}
              />

              {/* Personas */}
              
<SelectorPersonas
  value={people}
  setValue={setPeople}
  max={suite.max_capacity + 2}
  capacidadBase={suite.max_capacity}
/>
<br></br>
<h5>
  <b>Total: {""}{precioData ? formatoPrecio.format(precioData.total): formatoPrecio.format(suite.precio)}</b>
</h5>

              {/* Transporte */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeTransport"
                  checked={includeTransport}
                  onChange={(e) => setIncludeTransport(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeTransport">
                  Agregar transporte desde el aeropuerto
                </label>
                <p className="text-success">(+$20)</p>
              </div>



              <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                *Precios no reembolsables*
              </p>

              {/* BOTÓN RESERVAR */}
              {suite.habilitada ? (
                <button
                  className="btn btn-primary btn-block btn2"
                  onClick={handleReservar}
                  disabled={!startDate || !endDate}
                >
                  Reservar
                </button>
              ) : (
                <div className="alert alert-warning text-center mt-3">
                  Esta suite no está habilitada para reservas.
                </div>
              )}

              {/* WHATSAPP */}
              <a
                className="btn btn1 btn-primary btn-block mt-2"
                onClick={handleWhatsAppClick}
              >
                <i className="bi bi-whatsapp"></i> ¿Necesitas más información?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MAPA */}
      <div className="row mt-4">
        <div className="col-12">
          <h3>Ubicación</h3>
          <div className="map-container">
            <iframe
              title="Ubicación de la suite"
              width="100%"
              height="400"
              style={{ border: "0", borderRadius: "10px" }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${suite.latitud},${suite.longitud}&output=embed`}
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuitesPage;
