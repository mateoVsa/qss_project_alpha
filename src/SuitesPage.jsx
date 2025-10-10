import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
//prueba
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
//
import "react-datepicker/dist/react-datepicker.css";
import "./assets/principal-page/style.css";
import { useNavigate } from "react-router-dom";
import { eachDayOfInterval, parseISO } from "date-fns";
import Disponibilidad from "./Disponibilidad";
import ReservaCard from "./ReservaCard";
import { toDate, normalizeToMidday, safeFormat } from './utils/dateHelpers';



const SuitesPage = () => {
  const { id } = useParams();
  const [suite, setSuite] = useState(null);
  const [people, setPeople] = useState(1);
  const [nights, setNights] = useState(1);
  const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);
  const [extraBeds, setExtraBeds] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [disabledRanges, setDisabledRanges] = useState([]);
  const [includeTransport, setIncludeTransport]= useState(false);
  //Prueba para las imagenes
  const [openLightbox, setOpenLightbox] = useState(false);
const [currentImageIndex, setCurrentImageIndex] = useState(0);
//
//
const [isImageLoaded, setIsImageLoaded] = useState(false);
  //desabilitar
  useEffect(() => {
      const fetchDisabledDates = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/reservations/disabled_dates/${id}`);
          console.log("Respuesta recibida:", response.data);
          const dates = response.data.map(dateString => new Date(dateString));
          setDisabledRanges(dates);
        } catch (error) {
          console.error("Error al cargar fechas bloqueadas:", error);
        }
      };
      if (id) {
        fetchDisabledDates();
      }
    }, [id]);

    

  useEffect(() => {
    axios
      .get(`http://localhost:5000/suites/${id}`)
      .then((response) => {
        console.log("Suite desde backend:", response.data);
        setSuite(response.data);
        if (response.data.images?.length > 0) {
          const firstImage = response.data.images[0].image_url;
          setSelectedImage(firstImage.replace("dl=0", "raw=1"));
        }
        if (response.data.fechas_reservadas && response.data.fechas_reservadas.length > 0) {
          const ranges = response.data.fechas_reservadas.map(({ start_date, end_date }) => ({
            start: normalizeToMidday(toDate(start_date)),
            end: normalizeToMidday(toDate(end_date)),
          }));
          setDisabledRanges(ranges);
        }
      })
      .catch((error) => console.error("Error al obtener detalles de la suite", error));
  }, [id]);

  useEffect(() => {
  if (!startDate || !endDate) return;

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  setNights(Math.max(1, diffDays)); // Al menos 1 noche
}, [startDate, endDate]);

  const handleReservar = () => {
    if (!startDate || !endDate) {
    alert("Por favor selecciona el rango de fechas antes de continuar.");
    return;
  }
  if(endDate <= startDate){
    alert("La fecha de salida debe ser posterior a la fecha de entrada.");
    return;
  }
    navigate("/detalle-compra", {
      state: {
        suite,
        people,
        startDate:toDate(startDate),
        endDate: toDate(endDate),
        extraBeds,
        totalPrice: calcularPrecio(),
        includeTransport,
      },
    });
  };
  if (!suite) return <p className="text-center mt-5">Cargando suite...</p>;
  const incrementoPorPersona = 0.20;
  const basePrice = suite.precio;
  const extraBedPrice = 12;
  const transportPrice = 15;

  const calcularPrecio = () => {
  const precioBase = basePrice * nights;
  const adicionalPorPersonas = precioBase * incrementoPorPersona * (people - 1);
  const camasExtras = extraBedPrice * extraBeds;
  const transporte = includeTransport ? transportPrice : 0;
  return precioBase + adicionalPorPersonas + camasExtras + transporte;  };
  // const pricePeople = 0.15;
   
  const maxPersonas = suite.max_capacity;

  const maxVisibleThumbnails = 18;
  const visibleThumbnails = suite.images?.slice(currentIndex, currentIndex + maxVisibleThumbnails) || [];

  const nextThumbnails = () => {
    if (currentIndex + maxVisibleThumbnails < suite.images.length) {
      setCurrentIndex(currentIndex + maxVisibleThumbnails);
    }else{
      setCurrentIndex(0)
    }
  };

  const prevThumbnails = () => {
    if (currentIndex > 0) {
      setCurrentIndex(Math.max(0, currentIndex - maxVisibleThumbnails));
    }else{
      const lastIndex = Math.max(
        0,
        suite.images.length - maxVisibleThumbnails
      );
      setCurrentIndex(lastIndex);
    }
  };
  const handleWhatsAppClick = () => {
  const adminPhoneNumber = "593991633631"; // Número del administrador (sin + ni espacios)
  
  const checkInDate = safeFormat(startDate);
  const checkOutDate = safeFormat(endDate);

  const message = `Necesito más información de la suite "${suite.nombre}". 
Personas: ${people}
Fecha de entrada: ${checkInDate}
Fecha de salida: ${checkOutDate}`;

  const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");
};
  const icons = import.meta.glob("/src/assets/icons/comodidades/*.svg", { eager: true });
    const getIconPath = (comodidad) => {
      return icons[`/src/assets/icons/comodidades/${comodidad.icono}`]?.default || "";
    };
const getImageUrl = (url) => {
  if (!url) return "";
  if (url.includes("dropbox.com")) {
    return url.replace(/dl=0|dl=1/, "raw=1");
  }
  return `http://localhost:5000${url}`;
};
  
  return (
    
    <div className="container suite-page">
      <div className="mb-4 text-center">
        <h1 className="fw-bold suite-title">{suite.nombre}</h1>
        <hr className="custom-line mx-auto" />
        <p className="text-muted">{suite.descripcion || "Descripción no disponible."}</p>
        <hr className="custom-line2 mx-auto" />
      </div>
<Lightbox
  open={openLightbox}
  close={() => setOpenLightbox(false)}
  index={currentImageIndex}
  slides={suite.images.map((img) => ({
    src: getImageUrl(img.image_url),
  }))}
/>

      <div className="row my-4">
        <div className="col-12 text-center">
           {!isImageLoaded && <div className="image-skeleton"></div>}
          {selectedImage && (
            <img
              src={getImageUrl(selectedImage)}
              alt="Imagen seleccionada"
              className="img-fluid rounded main-image"
              style={{ width: "100%",maxHeight: "500px", height: "auto", objectFit: "cover",cursor: "pointer",
                display: isImageLoaded ? "block" : "none"
               }}
               onLoad={() => setIsImageLoaded(true)}
              onClick={()=>{
                setCurrentImageIndex(
                  suite.images.findIndex((img)=>getImageUrl(img.image_url) === getImageUrl(selectedImage))
                );
                setOpenLightbox(true)
              }}
            />
          )}


          </div>
           {/* Miniaturas debajo (imagenes pequeñas)*/}
        <div className="thumbnail-carousel d-flex justify-content-center align-items-center mt-3">
            <button
            className="btn-img btn-outline-secondary me-2"
            onClick={prevThumbnails}
            disabled={currentIndex ===0}
            >
            <span class="material-symbols-outlined">
arrow_back_ios
</span>
            </button>
        <div className="d-flex justify-content-center flex-wrap gap-2">
          {/* <button className="btn btn-secondary mb-2" onClick={prevThumbnails} disabled={currentIndex === 0}>
            &#60;
          </button> */}
          {visibleThumbnails.map((img, index) => (
            <img
              key={index}
              src={getImageUrl(img.image_url)}
              alt={`Miniatura ${index + 1}`}
              className={`img-thumbnail ${
            selectedImage === getImageUrl(img.image_url) ? "border-primary" : ""
          }`}
              style={{ width: "70px", height: "70px", cursor: "pointer", objectFit:"cover",borderRadius:"8px", 
                transition:"transform 0.2s ease-in-out, border-color 0.2s ease-in-out", }}
              onClick={() => setSelectedImage(getImageUrl(img.image_url))}
            />
          ))}
          </div>
          <button className="btn-img btn-outline-secondary ms-2" onClick={nextThumbnails} disabled={currentIndex + maxVisibleThumbnails >= suite.images.length}>
            <span class="material-symbols-outlined">
arrow_forward_ios
</span>
          </button>
        </div>
      
      </div>

      <div className="row mt-5">

  <div className="col-lg-8">
    <div className="p-4 shadow-sm rounded ">

      <h3 className="mb-4 pb-2 section-divider">Detalles de la Suite</h3>

      {/* Secciones con espacio y separación */}
      {/* <div className="py-4 border-bottom">
        <h5 className="fw-bold mb-2">Capacidad</h5>
        <p className="mb-0">{maxPersonas} personas</p>
      </div> */}

      <div className="py-4 section-divider">
        <h5 className="fw-bold mb-3">Comodidades</h5>
        <ul className="row list-unstyled g-3">
          {suite.comodidades && suite.comodidades.length > 0 ? (
            suite.comodidades.map((comodidad, index) => (
              <li key={index} className="col-6 d-flex align-items-center">
                <img
                  src={getIconPath(comodidad)}
                  alt={comodidad.nombre}
                  className="me-2"
                  style={{ width: "20px", height: "20px" }}
                />
                {comodidad.nombre}
              </li>
            ))
          ) : (
            <p className="text-muted">No hay comodidades disponibles.</p>
          )}
        </ul>
      </div>

      <div className="py-5 section-divider">
        <h5 className="fw-bold mb-2">Zona estratégica</h5>
        <p className="mb-0">{suite.zona_estrategica}</p>
      </div>

      <div className="py-5 section-divider">
        <h5 className="fw-bold mb-2">Descripción de movilidad</h5>
        <p className="mb-0">{suite.desc_movilidad}</p>
      </div>

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
        <div className="col-md-4 ">
          <div className="sticky-top" style={{ top: "150px", zIndex: 1 }}>
          <div className="card p-3 shadow-sm">
            <ReservaCard pricePerNight={suite.precio}
          capacity={suite.max_capacity}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          disabledRanges = {disabledRanges}
          nights = {nights}>
            
          </ReservaCard>
            <label><strong>Personas:</strong></label>
            <input type="number" value={people} min="1" max={maxPersonas + 2} className="form-control mb-3" onChange={(e) => setPeople(parseInt(e.target.value))} onKeyDown={(e) => e.preventDefault()} disabled={!suite.habilitada}/>
            {people > maxPersonas && (
              <>
                <label><strong>{suite.nombre==="Suite estudio Edf Santiago" ? "Sofá cama": "Colchones inflables:" }</strong></label>
                <input type="number" value={extraBeds} min="0" max="2" className="form-control mb-3" onChange={(e) => setExtraBeds(Number(e.target.value))} onKeyDown={(e) => e.preventDefault()} disabled={!suite.habilitada}/>
                <p className="text-success">Costo extra (+${extraBedPrice})</p>
              </>
            )}
            <div className="form-check mb-3">
              <input
              className="form-check-input"
              type="checkbox"
              id="includeTransport"
              checked={includeTransport}
              onChange={(e)=> setIncludeTransport(e.target.checked)}>
              </input>
              <label className="form-check-label" htmlFor="includeTransport">
                Agregar transporte desde el aeropuerto<p className="text-success">(+${transportPrice})</p>
              </label>

            </div>
            <h5><b>Total: ${calcularPrecio().toFixed(2)}</b></h5>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              *Precios no reembolsables*
            </p>
           
  {suite.habilitada ? (
  <button className="btn btn-primary btn-block btn2" onClick={handleReservar} disabled={!startDate || !endDate}>
    Reservar ahora
  </button>
) : (
  <div className="alert alert-warning text-center mt-3">
    Actualmente esta suite no está disponible para reservas.
  </div>
)}


            <p></p>
            <a
        href="https://wa.me/593991633631?text=¡Hola! Estoy interesad@ en más información sobre las suites que ofertan."
        target="_blank"
        rel="noopener noreferrer" 
        className="btn btn-primary btn-block"
        onClick={handleWhatsAppClick}
        >
        <i className="bi bi-whatsapp"></i> ¿Necesitas más información?
      </a>
          </div>
        </div>
      </div>
      </div>
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
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${suite.latitud},${suite.longitud}&output=embed`}
      ></iframe>
    </div>
  </div>
</div>          
    </div>
    
  );
};

export default SuitesPage;
