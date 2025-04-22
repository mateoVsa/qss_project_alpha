import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./assets/principal-page/style.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";

// import { FaBath, FaBed, FaTv } from "react-icons/fa6";
// import { CgSmartHomeRefrigerator } from "react-icons/cg";

// 🏆 Íconos modernos
const CustomPrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button className="custom-arrow custom-prev" onClick={onClick}>
      <ChevronLeft size={32} />
    </button>
  );
};

const CustomNextArrow = (props) => {
  const { onClick } = props;
  return (
    <button className="custom-arrow custom-next" onClick={onClick}>
      <ChevronRight size={32} />
    </button>
  );
};

const SuitesList = () => {
  const [suites, setSuites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/suites")
      .then((response) => {
        console.log("Datos recibidos:", response.data);
        setSuites(response.data);
      })
      .catch((error) => console.error("Error al obtener suites", error));
  }, []);
  const [startDate, setStartDate] = useState(new Date("2014/02/08"));
  const [endDate, setEndDate] = useState(new Date("2014/02/10"));
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  return (
    <div className="container mt-4" id="suites">
      <div>
        <h3 className="text-center"> 
          Disponibilidad
        </h3>
        <DatePicker  selected={startDate}
        onChange={(date) => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}></DatePicker>
        <DatePicker selected={endDate}
        onChange={(date) => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}></DatePicker>
      </div>
      <hr></hr>
      <div className="row">
        {suites.map((suite) => (
          <div key={suite.id} className="col-md-6 mb-4">
            <div className="card h-100 shadow">
              {suite.images && suite.images.length > 0 ? (
                <Slider {...settings} className="custom-slider">
                  {suite.images.map((img, index) => {
                    const imageUrl = img.image_url
                      ? img.image_url.replace("dl=0", "raw=1")
                      : "https://via.placeholder.com/300"; // Imagen de respaldo
                    return (
                      <div key={index}>
                        <img
                          src={imageUrl}
                          alt={`Imagen ${index + 1} de ${suite.nombre}`}
                          className="card-img-top suite-image"
                          style={{
                            width: "100%",
                            height: "300px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    );
                  })}
                </Slider>
              ) : (
                <img
                  src="https://via.placeholder.com/300"
                  alt="Imagen no disponible"
                  className="card-img-top suite-image"
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                  }}
                />
              )}

              <div className="card-body">
                <h3 className="card-title">{suite.nombre}</h3>
                <p className="card-text">
                  {suite.descripcion_pequena || "Descripción no disponible"}
                </p>
                <p className="card-text price-icons">
                  <strong></strong> ${suite.precio}
                  <span className="icon-container">
                    {/* <FaBath size={20} className="icon-style" />
                    <FaBed size={20} className="icon-style" />
                    <FaTv size={20} className="icon-style" />
                    <CgSmartHomeRefrigerator size={20} className="icon-style" /> */}
                  </span>
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/suites/${suite.id}`)}
                >
                  Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <hr className="my-4" />
    </div>
  );
};

export default SuitesList;
