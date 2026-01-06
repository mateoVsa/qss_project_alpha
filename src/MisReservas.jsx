import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Badge, Button, Modal, Spinner } from "react-bootstrap";
import API_URL from "./config/api";
const MisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${API_URL}/api/mis-reservas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setReservas(res.data))
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container admin-con py-5">

  <h2 className="text-center fw-bold mb-5">Mis Reservas</h2>

  {loading ? (
    <div className="text-center py-5">
      <Spinner animation="border" />
    </div>
  ) : reservas.length === 0 ? (
    <div className="text-center text-muted py-5">
      No tienes reservas registradas todavía.
    </div>
  ) : (
    <div className="d-flex flex-column gap-4">
      {reservas.map(r => (
        <div
          key={r.id}
          className="p-4 shadow-sm rounded-4 border d-flex justify-content-between align-items-center flex-wrap"
        >
          <div className="d-flex flex-column gap-2">
            <h5 className="fw-bold mb-1">{r.suite_nombre}</h5>

            <div className="text-muted small">
              {new Date(r.start_date).toLocaleDateString()} → {new Date(r.end_date).toLocaleDateString()}
            </div>

            <div className="d-flex gap-3 small">
              <span><i class="bi bi-person-arms-up"></i> {r.personas} personas</span>
            </div>
          </div>

          <div className="text-end d-flex flex-column gap-2">
            <div className="fw-bold text-success fs-5">
              ${Number(r.total_pagado).toFixed(2)}
            </div>

            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => setSelectedReserva(r)}
            >
              <i className="bi bi-geo-alt me-1"></i> Ver ubicación
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Modal de detalles */}
  <Modal show={!!selectedReserva} onHide={() => setSelectedReserva(null)} centered size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Detalle de la reserva</Modal.Title>
    </Modal.Header>

    <Modal.Body className="d-flex flex-column gap-3">
      {selectedReserva && (
        <>
          <h5 className="fw-bold">{selectedReserva.suite_nombre}</h5>

          <div className="d-flex gap-4">
            <span>📅 {new Date(selectedReserva.start_date).toLocaleDateString()}</span>
            <span>→ {new Date(selectedReserva.end_date).toLocaleDateString()}</span>
          </div>

          <div>👥 Personas: {selectedReserva.personas}</div>

          <div className="fw-bold text-success fs-5">
            Total pagado: ${Number(selectedReserva.total_pagado).toFixed(2)}
          </div>

          {selectedReserva.latitud && selectedReserva.longitud && (
            <iframe
              title="Ubicación"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: "12px" }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${selectedReserva.latitud},${selectedReserva.longitud}&output=embed`}
            />
          )}
        </>
      )}
    </Modal.Body>
  </Modal>

</div>

  );
};

export default MisReservas;
