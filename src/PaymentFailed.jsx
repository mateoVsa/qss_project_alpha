import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import { XCircleFill, Whatsapp, ArrowRepeat } from "react-bootstrap-icons";
import axios from "axios";

export default function PaymentFailed() {
  const { reservaId } = useParams();
  const navigate = useNavigate();

  const api = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await axios.get(`${api}/reservas/${reservaId}`);

        if (res.data?.status === "confirmada") {
          setConfirmed(true);
          setTimeout(() => {
            navigate(`/pago-exitoso/${reservaId}`);
          }, 1200);
          return;
        }
      } catch (err) {
        console.error("Error verificando pago:", err);
      }

      if (attempts < MAX_ATTEMPTS) {
        setTimeout(() => {
          setAttempts(prev => prev + 1);
        }, 2000);
      } else {
        setChecking(false);
      }
    };

    verifyPayment();
  }, [attempts]);

  const whatsappLink = `https://wa.me/593995921047?text=Hola,%20tuve%20un%20problema%20con%20el%20pago%20de%20mi%20reserva%20#${reservaId}`;

  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-7 col-xl-6">
          <Card className="shadow border-0 rounded-4 p-4 text-center">

            {/* ICONO */}
            <div className="mb-3">
              <XCircleFill size={64} className="text-danger" />
            </div>

            <h3 className="fw-bold mb-2">
              {checking ? "Verificando tu pago..." : "El pago no se completó"}
            </h3>

            {/* ESTADO */}
            {checking ? (
              <>
                <p className="text-muted">
                  Estamos confirmando el estado de tu pago, por favor espera.
                </p>
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3">
                  Intento {attempts + 1} de {MAX_ATTEMPTS}
                </p>
              </>
            ) : (
              <>
                <Alert variant="warning" className="mt-3">
                  No se pudo confirmar el pago automáticamente.
                  <br />
                  No se realizó ningún cobro.
                </Alert>

                <p className="text-muted mt-2">
                  Puedes intentar nuevamente o comunicarte con nosotros.
                </p>

                {/* BOTONES */}
                <div className="d-grid gap-3 mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-pill"
                    onClick={() => navigate(`/detalle-compra`)}
                  >
                    <ArrowRepeat className="me-2" />
                    Reintentar pago
                  </Button>

                  <Button
                    variant="success"
                    size="lg"
                    className="rounded-pill"
                    href={whatsappLink}
                    target="_blank"
                  >
                    <Whatsapp className="me-2" />
                    Contactar por WhatsApp
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/")}
                  >
                    Volver al inicio
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
