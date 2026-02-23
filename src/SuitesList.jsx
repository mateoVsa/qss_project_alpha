import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Carousel } from "react-bootstrap";
import { Heart } from "lucide-react";
import "./assets/principal-page/style.css";
import API_URL from "./config/api";
const SuitesList = () => {
  const [suites, setSuites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      // .get("https://qss-backend-zed8.onrender.com/suites")
      .get(`${API_URL}/suites`)
      .then((response) => {
        setSuites(response.data);
      })
      .catch((error) => console.error("Error al obtener suites", error));
  }, []);

  return (
    <div className="container mt-5" id="suites">
      <div className="row">
        {suites.map((suite) => (
          <div key={suite.id} className="col-md-4 mb-4">
            <div
              className="suite-card shadow-sm border-0 rounded-4 overflow-hidden position-relative"
              onClick={() => navigate(`/suites/${suite.id}`)}
              style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div className="position-relative">
                {suite.images && suite.images.length > 0 ? (
                  <Carousel interval={3000} controls={false} indicators={false} fade>
                    {suite.images.map((imgObj, index) => {
                     const imageUrl = imgObj.image_url.startsWith("http")
  ? imgObj.image_url
  : `${API_URL}${imgObj.image_url}`;
                      return (
                        <Carousel.Item key={imgObj.id}>
                          <img
                            className="d-block w-100"
                            src={imageUrl}
                            alt={`Imagen ${index + 1} de ${suite.nombre}`}
                            style={{
                              height: "260px",
                              objectFit: "cover",
                              pointerEvents: "none",
                            }}
                          />
                        </Carousel.Item>
                      );
                    })}
                  </Carousel>
                ) : (
                  <img
                    src="https://via.placeholder.com/600x300?text=Sin+imagen"
                    alt="Imagen no disponible"
                    className="w-100"
                    style={{ height: "260px", objectFit: "cover" }}
                  />
                )}

                {/* Ícono tipo favorito (decorativo) */}
                {/* <button
                  className="btn position-absolute top-0 end-0 m-3 bg-white rounded-circle shadow-sm"
                  style={{
                    width: "38px",
                    height: "38px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                  }}
                >
                  <Heart size={20} color="#ff385c" />
                </button> */}
              </div>

              <div className="card-body px-3 py-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h5 className="fw-semibold text-dark mb-0">{suite.nombre}</h5>
                </div>
                <p className="text-muted small mb-2">
                  {suite.descripcion_pequena || "Descripción no disponible"}
                </p>
                <p className="fw-bold text-dark mb-0">
                  ${suite.precio}{" "}
                  <span className="text-muted fw-normal">por noche</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuitesList;
