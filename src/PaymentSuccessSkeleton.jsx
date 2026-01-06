import { Card } from "react-bootstrap";
import { motion } from "framer-motion";
import CircularText from "./CircularText";

export default function PaymentSuccessSkeleton() {
  return (
    <motion.div
      className="container my-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Texto circular opcional */}
      <div className="text-center mb-4">
        <CircularText
          text="QUITO☀SMILES☀SUITES☀"
          onHover="speedUp"
          spinDuration={4}
        />
      </div>

      {/* CARD CENTRADA */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-7">
          <Card className="payment-card shadow border-0 rounded-4 overflow-hidden">
            {/* ===== CARRUSEL ===== */}
            <div className="skeleton skeleton-carousel" />

            {/* ===== BODY ===== */}
            <Card.Body className="p-4">
              {/* Título */}
              <div className="skeleton skeleton-title mb-2" />

              {/* Ubicación */}
              <div className="skeleton skeleton-location mb-3" />

              <hr />

              {/* Fechas */}
              <div className="row text-center mb-3">
                <div className="col-6">
                  <div className="skeleton skeleton-small mb-2 mx-auto" />
                  <div className="skeleton skeleton-date mx-auto" />
                </div>
                <div className="col-6">
                  <div className="skeleton skeleton-small mb-2 mx-auto" />
                  <div className="skeleton skeleton-date mx-auto" />
                </div>
              </div>

              <hr />

              {/* Total */}
              <div className="d-flex justify-content-between align-items-center">
                <div className="skeleton skeleton-text w-25" />
                <div className="skeleton skeleton-price" />
              </div>

              {/* Nota */}
              <div className="skeleton skeleton-note mt-3" />
            </Card.Body>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
