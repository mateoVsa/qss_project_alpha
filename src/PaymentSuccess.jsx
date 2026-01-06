import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import axios from "axios";
import { motion } from "framer-motion";
import { GeoAltFill, Whatsapp } from "react-bootstrap-icons";
import { Carousel } from "react-bootstrap";
import PaymentSuccessSkeleton from "./PaymentSuccessSkeleton";
import Lottie from "lottie-react";
import successAnim from "./assets/lottie/Success Check.json";

export default function PaymentSuccess() {
  const { reservaId } = useParams();

  const [reserva, setReserva] = useState(null);
  const [suite, setSuite] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simula skeleton (opcional)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 1️⃣ Reserva
        const reservaRes = await axios.get(`${api}/reservas/${reservaId}`);
        setReserva(reservaRes.data);

        // 2️⃣ Suite
        if (reservaRes.data.suite_id) {
          const suiteRes = await axios.get(
            `${api}/suites/${reservaRes.data.suite_id}`
          );
          setSuite(suiteRes.data);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reservaId]);

  const getImageUrl = (path) => {
    if (!path) return "/placeholder-suite.jpg";
    if (path.startsWith("/uploads")) return `${api}${path}`;
    return `${api}/uploads/${path}`;
  };

  if (loading) return <PaymentSuccessSkeleton />;

  if (!reserva) {
    return (
      <p className="text-center mt-5 text-danger">
        No se pudo cargar la reserva.
      </p>
    );
  }

  const whatsappLink = `https://wa.me/593995921047?text=Hola,%20tengo%20una%20consulta%20sobre%20mi%20reserva%20#${reservaId}`;

  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ===== HEADER ===== */}
      <div className="text-center mb-5">
        <Lottie
          animationData={successAnim}
          loop={false}
          style={{ width: 120, margin: "0 auto" }}
        />
        <h2 className="fw-bold mt-3">¡Pago confirmado!</h2>
        <p className="text-muted mb-0">Reserva #{reservaId}</p>
      </div>

      {/* ===== CARD CENTRADA ===== */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-7">
          <Card className="payment-card shadow border-0 rounded-4 overflow-hidden">
            {/* ===== CARRUSEL ===== */}
            <Carousel
              fade
              indicators={suite?.images?.length > 1}
              controls={suite?.images?.length > 1}
              interval={5000}
            >
              {suite?.images?.length > 0 ? (
                suite.images.map((img) => (
                  <Carousel.Item key={img.id}>
                    <img
                      className="d-block w-100"
                      src={getImageUrl(img.image_url)}
                      alt="Suite"
                      style={{
                        height: "320px",
                        objectFit: "cover",
                      }}
                    />
                  </Carousel.Item>
                ))
              ) : (
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src="/placeholder-suite.jpg"
                    alt="Suite"
                    style={{
                      height: "320px",
                      objectFit: "cover",
                    }}
                  />
                </Carousel.Item>
              )}
            </Carousel>

            {/* ===== BODY ===== */}
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-1">{suite?.nombre}</h4>

              <p className="text-muted d-flex align-items-center gap-1 mb-3">
                <GeoAltFill />
                {suite?.desc_movilidad || "Ubicación de la suite"}
              </p>

              <hr />

              {/* ===== FECHAS ===== */}
              <div className="row text-center">
                <div className="col-6">
                  <strong>Check-in</strong>
                  <p className="mb-0">
                    {new Date(reserva.start_date).toLocaleDateString()}
                  </p>
                  <small className="text-muted">Desde las 3:00 PM</small>
                </div>

                <div className="col-6">
                  <strong>Check-out</strong>
                  <p className="mb-0">
                    {new Date(reserva.end_date).toLocaleDateString()}
                  </p>
                  <small className="text-muted">Hasta las 12:00 PM</small>
                </div>
              </div>

              <hr />

              {/* ===== TOTAL ===== */}
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-5 fw-bold">Total pagado</span>
                <span className="fs-4 fw-bold text-success">
                  ${Number(reserva.total_pagado).toFixed(2)}
                </span>
              </div>

              {/* ===== RECORDATORIO ===== */}
              <div className="alert alert-light border mt-3 mb-0">
                <small className="text-muted">
                  Recuerda:
                  <br />• Check-in a partir de las{" "}
                  <strong>3:00 PM</strong>
                  <br />• Check-out hasta las{" "}
                  <strong>12:00 PM</strong>
                </small>
              </div>
               {/* ===== MAPA ===== */}
      {suite?.latitud && suite?.longitud && (
        <div className="mt-5">
          <strong>📍 Ubicación de tu estadía</strong>
          <iframe
            title="Ubicación de la suite"
            width="100%"
            height="350"
            style={{ border: 0, borderRadius: "12px" }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${suite.latitud},${suite.longitud}&output=embed`}
          />
        </div>
      )}
            </Card.Body>
            
          </Card>
        </div>
      </div>

     

      {/* ===== WHATSAPP ===== */}
      <div className="text-center mt-4">
        <Button
          variant="success"
          size="lg"
          className="rounded-pill px-4"
          href={whatsappLink}
          target="_blank"
        >
          <Whatsapp className="me-2" />
          ¿Algún inconveniente? Escríbenos
        </Button>
      </div>
    </motion.div>
  );
}
