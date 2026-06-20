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
  <div className="container py-5" style={{ marginTop: "90px", minHeight: "100vh" }}>
    
    {/* HEADER */}
    <div className="text-center mb-5">
      <span
        className="text-uppercase small fw-semibold"
        style={{
          letterSpacing: "4px",
          color: "#b48a64"
        }}
      >
        Historial
      </span>

      <h1 className="fw-bold display-5 mt-2">
        Mis Reservas
      </h1>

      <p className="text-muted">
        Gestiona y revisa todas tus estadías
      </p>
    </div>

    {/* LOADING */}
    {loading ? (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    ) : reservas.length === 0 ? (

      <div
        className="text-center py-5 rounded-4 border"
        style={{
          background: "#fff",
          maxWidth: "600px",
          margin: "0 auto"
        }}
      >
        <h5 className="fw-bold mb-3">
          No tienes reservas todavía
        </h5>

        <p className="text-muted">
          Cuando realices una reserva aparecerá aquí.
        </p>
      </div>

    ) : (

      <div className="d-flex flex-column gap-4">

        {reservas.map((r) => {

          const estadoColor =
            r.status === "confirmada"
              ? "#198754"
              : "#b48a64";

          return (
            <div
              key={r.id}
              className="reservation-card position-relative overflow-hidden"
              style={{
                borderRadius: "28px",
                background: "#fff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.06)"
              }}
            >

              {/* Barra lateral tipo Uber */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "6px",
                  height: "100%",
                  background: estadoColor
                }}
              />

              <div className="p-4 p-md-5">

                <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">

                  {/* IZQUIERDA */}
                  <div className="flex-grow-1">

                    <div className="d-flex align-items-center gap-3 mb-3">

                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "58px",
                          height: "58px",
                          background: "rgba(180,138,100,0.12)",
                          color: "#b48a64",
                          fontSize: "1.3rem"
                        }}
                      >
                        <i className="bi bi-buildings"></i>
                      </div>

                      <div>
                        <h4 className="fw-bold mb-1">
                          {r.suite_nombre}
                        </h4>

                        <span
                          className="px-3 py-1 rounded-pill small fw-semibold"
                          style={{
                            background:
                              r.status === "confirmada"
                                ? "rgba(25,135,84,0.12)"
                                : "rgba(180,138,100,0.12)",
                            color: estadoColor
                          }}
                        >
                          {r.status}
                        </span>
                      </div>

                    </div>

                    {/* TIMELINE */}
                    <div className="mt-4">

                      <div className="d-flex align-items-start gap-3 mb-4">

                        <div className="d-flex flex-column align-items-center">
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: "#198754"
                            }}
                          />

                          <div
                            style={{
                              width: "2px",
                              height: "50px",
                              background: "#ddd"
                            }}
                          />
                        </div>

                        <div>
                          <small className="text-muted d-block">
                            Check-in
                          </small>

                          <strong>
                            {new Date(r.start_date).toLocaleDateString()}
                          </strong>
                        </div>

                      </div>

                      <div className="d-flex align-items-start gap-3">

                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: "#dc3545",
                            marginTop: "5px"
                          }}
                        />

                        <div>
                          <small className="text-muted d-block">
                            Check-out
                          </small>

                          <strong>
                            {new Date(r.end_date).toLocaleDateString()}
                          </strong>
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* DERECHA */}
                  <div
                    className="text-md-end"
                    style={{
                      minWidth: "220px"
                    }}
                  >

                    <div className="mb-3">
                      <small className="text-muted d-block">
                        Total pagado
                      </small>

                      <div
                        className="fw-bold"
                        style={{
                          fontSize: "2rem",
                          color: "#198754"
                        }}
                      >
                        ${Number(r.total_pagado).toFixed(2)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <small className="text-muted d-block">
                        Huéspedes
                      </small>

                      <div className="fw-semibold">
                        {r.personas} personas
                      </div>
                    </div>

                    <Button
                      variant="dark"
                      className="rounded-pill px-4 py-2"
                      onClick={() => setSelectedReserva(r)}
                    >
                      Ver detalles
                    </Button>

                  </div>

                </div>

              </div>

            </div>
          );
        })}
      </div>
    )}

    {/* MODAL PREMIUM */}
    <Modal
      show={!!selectedReserva}
      onHide={() => setSelectedReserva(null)}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          Detalle de reserva
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">

        {selectedReserva && (
          <>

            <div className="mb-4">
              <h3 className="fw-bold">
                {selectedReserva.suite_nombre}
              </h3>

              <p className="text-muted">
                Reserva #{selectedReserva.id}
              </p>
            </div>

            <div className="row g-4 mb-4">

              <div className="col-md-4">
                <div className="border rounded-4 p-3 h-100">
                  <small className="text-muted d-block mb-2">
                    Check-in
                  </small>

                  <strong>
                    {new Date(selectedReserva.start_date).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded-4 p-3 h-100">
                  <small className="text-muted d-block mb-2">
                    Check-out
                  </small>

                  <strong>
                    {new Date(selectedReserva.end_date).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded-4 p-3 h-100">
                  <small className="text-muted d-block mb-2">
                    Total pagado
                  </small>

                  <strong className="text-success">
                    ${Number(selectedReserva.total_pagado).toFixed(2)}
                  </strong>
                </div>
              </div>

            </div>

            {selectedReserva.latitud &&
              selectedReserva.longitud && (
                <iframe
                  title="Ubicación"
                  width="100%"
                  height="320"
                  style={{
                    border: 0,
                    borderRadius: "20px"
                  }}
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
