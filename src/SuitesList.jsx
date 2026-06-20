import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Carousel } from "react-bootstrap";
import { Heart } from "lucide-react";
import Skeleton from 'react-loading-skeleton'
import "react-loading-skeleton/dist/skeleton.css"
import "./assets/principal-page/style.css";
import API_URL from "./config/api";
import ProgressiveImage from "./ProgressiveImage";
const SuitesList = () => {
  const [suites, setSuites] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      // .get("https://qss-backend-zed8.onrender.com/suites")
      .get(`${API_URL}/suites`)
      .then((response) => {
        setSuites(response.data);
      })
      .catch((error) => console.error("Error al obtener suites", error))
      .finally(()=> setLoading(false));
    
  }, []);
if (loading) {
  return (
    <div className="container mt-5">
      <div className="row">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="col-md-4 mb-4">
            <Skeleton height={260} borderRadius={20} />
            <Skeleton height={25} className="mt-3" />
            <Skeleton height={18} width="80%" />
            <Skeleton height={20} width="40%" className="mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

if (suites.length === 0) {
  return (
    <div className="text-center py-5">
      <h4>No hay suites disponibles 😕</h4>
      <p className="text-muted">
        Intenta nuevamente más tarde.
      </p>
    </div>
  );
}

return (
  <div className="container mt-5" id="suites">
    <div className="row">
      {suites.map((suite) => (
        <div key={suite.id} className="col-md-4 mb-4">
          <div
            className="suite-card shadow-sm border-0 rounded-4 overflow-hidden position-relative bg-white"
            onClick={() => navigate(`/suites/${suite.id}`)}
            style={{
              cursor: "pointer",
            }}
          >
            <div className="position-relative">
              {suite.images && suite.images.length > 0 ? (
                <Carousel
                  interval={3500}
                  controls={false}
                  indicators={false}
                  fade
                >
                  {suite.images.map((imgObj, index) => {

                    const imageUrl = imgObj.image_url.startsWith("http")
                      ? imgObj.image_url
                      : `${API_URL}${imgObj.image_url}`;

                    const optimizedUrl = imageUrl.includes("cloudinary")
                      ? imageUrl.replace(
                          "/upload/",
                          "/upload/w_900,q_auto,f_auto/"
                        )
                      : imageUrl;

                    return (
                      <Carousel.Item key={imgObj.id}>
                        <ProgressiveImage
  src={imageUrl}
  alt={`Imagen ${index + 1} de ${suite.nombre}`}
  className="d-block w-100"
  style={{
    height: "280px",
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
                  style={{
                    height: "260px",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* Favorito estilo Airbnb */}
              {/* <button
                className="btn position-absolute top-0 end-0 m-3 bg-white rounded-circle shadow-sm"
                style={{
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  zIndex: 10,
                }}
              >
                <Heart size={20} color="#ff385c" />
              </button> */}
            </div>

            <div className="card-body px-3 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-semibold text-dark mb-1 text-truncate">
                  {suite.nombre}
                </h5>
              </div>

              <p
                className="text-muted small mb-2"
                style={{
                  minHeight: "40px",
                }}
              >
                {suite.descripcion_pequena ||
                  "Descripción no disponible"}
              </p>

              <p className="fw-bold text-dark mb-0 fs-5">
                ${suite.precio}
                <span className="text-muted fw-normal fs-6">
                  {" "} / noche
                </span>
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
