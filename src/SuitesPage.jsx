import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./assets/principal-page/style.css";
import { useNavigate } from "react-router-dom";


const SuitesPage = () => {
  const { id } = useParams();
  const [suite, setSuite] = useState(null);
  const [people, setPeople] = useState(1);
  const [nights, setNights] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [extraBeds, setExtraBeds] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/suites/${id}`)
      .then((response) => {
        setSuite(response.data);
        if (response.data.images?.length > 0) {
          setSelectedImage(response.data.images[0].replace("dl=0", "raw=1"));
        }
      })
      .catch((error) => console.error("Error al obtener detalles de la suite", error));
  }, [id]);
  const handleReservar = () => {
    navigate("/detalle-compra", {
      state: {
        suite,
        people,
        startDate,
        endDate,
        extraBeds,
        totalPrice: calcularPrecio(),
      },
    });
  };
  if (!suite) return <p className="text-center mt-5">Cargando suite...</p>;
  const incrementoPorPersona = 0.15;
  const basePrice = suite.precio;
  const extraBedPrice = 12;

  const calcularPrecio = () => {
    return basePrice * (1 + incrementoPorPersona * (people - 1))+ extraBedPrice * extraBeds;
  };
  // const pricePeople = 0.15;
   
  const maxPersonas = suite.max_capacity;

  const maxVisibleThumbnails = 3;
  const visibleThumbnails = suite.images?.slice(currentIndex, currentIndex + maxVisibleThumbnails) || [];

  const nextThumbnails = () => {
    if (currentIndex + maxVisibleThumbnails < suite.images.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevThumbnails = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  const handleWhatsAppClick = () => {
    const adminPhoneNumber = "593991633631"; // Número del administrador (sin + ni espacios)
    const checkInDate = startDate.toLocaleDateString();
    const checkOutDate = new Date(endDate);
    checkOutDate.setDate(checkOutDate.getDate() + nights);
    const checkOutDateString = checkOutDate.toLocaleDateString();
  
    const message = `Necesito más información de la suite "${suite.nombre}". 
    Personas: ${people}
    Fecha de entrada: ${checkInDate}
    Fecha de salida: ${checkOutDateString}`;
  
    const whatsappURL = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
    
  };
  const icons = import.meta.glob("/src/assets/icons/comodidades/*.svg", { eager: true });
    const getIconPath = (comodidad) => {
      return icons[`/src/assets/icons/comodidades/${comodidad.icono}`]?.default || "";
    };

  
  return (
    <div className="container suite-page">
      <div className="mb-4 text-center">
        <h1 className="fw-bold suite-title">{suite.nombre}</h1>
        <hr className="custom-line mx-auto" />
        <p className="text-muted">{suite.descripcion || "Descripción no disponible."}</p>
        <hr className="custom-line2 mx-auto" />
      </div>

      <div className="row my-4">
        <div className="col-md-8 text-center image-gallery">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Imagen seleccionada"
              className="img-fluid rounded main-image"
              style={{ width: "100%", height: "500px", objectFit: "cover",marginLeft:"100px" }}
            />
          )}
        </div>
        <div className="col-md-4 d-flex align-items-center flex-column">
          <button className="btn btn-secondary mb-2" onClick={prevThumbnails} disabled={currentIndex === 0}>
            &#60;
          </button>
          {visibleThumbnails.map((img, index) => (
            <img
              key={index}
              src={img.replace("dl=0", "raw=1")}
              alt={`Miniatura ${index + 1}`}
              className="img-thumbnail my-1"
              style={{ width: "100px", height: "100px", cursor: "pointer" }}
              onClick={() => setSelectedImage(img.replace("dl=0", "raw=1"))}
            />
          ))}
          <button className="btn btn-secondary mt-2" onClick={nextThumbnails} disabled={currentIndex + maxVisibleThumbnails >= suite.images.length}>
            &#62;
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <h3>Detalles de la Suite</h3>
          <table className="table">
            <tbody>
              <tr><td><strong>Capacidad:</strong> {maxPersonas} personas</td></tr>
              <tr><td><strong><h4>Comodidades</h4></strong>
              <ul className="icon-sp row g-3">
  {suite.comodidades && suite.comodidades.length > 0 ? (
    suite.comodidades.map((comodidad, index) => (
      <li key={index} className="col-6 d-flex align-items-center">
        <img src={getIconPath(comodidad)} alt={comodidad.nombre} className="me-2" />
        {comodidad.nombre}
      </li>
    ))
  ) : (
    <p className="text-muted">No hay comodidades disponibles.</p>
  )}
</ul>
    </td></tr>
              
                {/* <tr><td><strong><i className="bi bi-wifi"></i></strong> </td></tr>
                <tr><td><strong><i className="bi bi-tv"></i></strong> </td></tr> */}
              <tr><td><strong><h4>Zona estratégica</h4></strong> {suite.zona_estrategica}</td></tr>
              <tr><td><strong><h4>Descripción de movilidad</h4></strong> {suite.desc_movilidad}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h4>Reserva</h4>
            <p><strong></strong> ${basePrice} la noche</p>
            <label><strong>Fecha de entrada:</strong></label>
            <DatePicker selected={startDate} onChange={setStartDate}  minDate={new Date()} className="form-control mb-3" />
            <label><strong>Fecha de salida:</strong></label>
            <DatePicker selected={endDate} onChange={setEndDate} minDate={new Date()} className="form-control mb-3" />
            <label><strong>Personas:</strong></label>
            <input type="number" value={people} min="1" max={maxPersonas + 2} className="form-control mb-3" onChange={(e) => setPeople(parseInt(e.target.value))} onKeyDown={(e) => e.preventDefault()}/>
            {people > maxPersonas && (
              <>
                <label><strong>Colchones inflables:</strong></label>
                <input type="number" value={extraBeds} min="0" max="2" className="form-control mb-3" onChange={(e) => setExtraBeds(Number(e.target.value))} onKeyDown={(e) => e.preventDefault()}/>
                <p className="text-danger">Se requieren camas extra (+${extraBedPrice})</p>
              </>
            )}
            <h5><b>Total: ${calcularPrecio().toFixed(2)}</b></h5>
            <button className="btn btn-primary btn-block btn2" onClick={handleReservar}>Reservar ahora</button>
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
