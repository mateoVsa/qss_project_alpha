import { useEffect, useState } from "react";
import axios from "axios";
import { Badge, Button, Card, Modal, Row, Col,OverlayTrigger, Tooltip } from "react-bootstrap";

const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      const res = await axios.get("https://qss-backend-zed8.onrender.com/api/admin/reservas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reservasConUrl = res.data.map((reserva) => ({
        ...reserva,
        clientes: reserva.clientes.map((cliente) => ({
          ...cliente,
          cedula_url: cliente.cedula_path
            ? `https://qss-backend-zed8.onrender.com/${cliente.cedula_path}`
            : null,
        })),
      }));
      setReservas(reservasConUrl);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
      alert("Error al cargar reservas");
    }
  };

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await fetch(
        `https://qss-backend-zed8.onrender.com/api/admin/reserva/${id}/pdf`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Error al generar PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reserva_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("No se pudo descargar el PDF");
    }
  };

  return (
    <div className="container py-4">
      <Row xs={1} md={2} className="g-4">
        {reservas.map((reserva) => (
          <Col key={reserva.reserva_id}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center rounded-top-4">
                <span className="fw-semibold">
                  <i className="bi bi-bookmark-check me-2 text-primary"></i>
                  Reserva #{reserva.reserva_id}
                </span>
                <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-logout">Exportar a PDF</Tooltip>}
            >
              <Button
                  variant="outline-danger"
                  className="btn2"
                  size="sm"
                  onClick={() => handleDownloadPDF(reserva.reserva_id)}
                >
                  <i className="bi bi-file-earmark-pdf"></i>
                </Button>
            </OverlayTrigger>
                
                <Badge
                  bg={
                    reserva.status === "confirmada"
                      ? "success"
                      : reserva.status === "pendiente"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {reserva.status}
                </Badge>
              </Card.Header>

              <Card.Body>
                <p className="mb-1">
                  <strong>Cliente:</strong> {reserva.nombre_cliente}
                </p>
                <p className="mb-1">
                  <strong>Suite:</strong> {reserva.suite_nombre}
                </p>
                <div className="d-flex justify-content-between my-2">
                  <span className="text-muted">
                    <i className="bi bi-calendar-event me-1"></i>
                    <strong>Inicio:</strong>{" "}
                    {new Date(reserva.start_date).toLocaleDateString()}
                  </span>
                  <span className="text-muted">
                    <i className="bi bi-calendar-check me-1"></i>
                    <strong>Fin:</strong>{" "}
                    {new Date(reserva.end_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="mb-2">
                  <strong>Personas:</strong> {reserva.personas}
                </p>

                <div className="mt-3 p-3 rounded bg-light">
                  <h6 className="fw-semibold mb-2 text-secondary">
                    <i className="bi bi-people-fill me-2"></i>Huéspedes
                  </h6>
                  {reserva.clientes.map((cliente, index) => (
                    <div
                      key={cliente.id}
                      className="p-2 mb-2 border rounded bg-white"
                    >
                      <div className="fw-semibold">
                        {cliente.is_responsable
                          ? "Responsable:"
                          : `Huésped ${index + 1}:`}{" "}
                        <span className="text-dark">
                          {cliente.nombres} {cliente.apellidos}
                        </span>
                      </div>
                      <div className="text-muted small">
                        Teléfono Emergencia:{" "}
                        {cliente.telefono_emergencia || "-"}
                      </div>
                      <div className="text-muted small">
                        Parentesco: {cliente.parentesco || "-"}
                      </div>
                      <div className="text-muted small">
                        Motivo: {cliente.motivo || "-"}{" "}
                        {cliente.detalle_motivo
                          ? `- ${cliente.detalle_motivo}`
                          : ""}
                      </div>
                      <div className="text-muted small">
                        Teléfono: {cliente.telefono || "-"}{" "}
                      </div>

                      {cliente.cedula_url ? (
                        <div className="mt-2">
                          <img
                            src={cliente.cedula_url}
                            alt="Cédula"
                            onClick={() => openModal(cliente.cedula_url)}
                            style={{
                              width: "120px",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "transform 0.2s, box-shadow 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(0,0,0,0.2)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.boxShadow = "none")
                            }
                          />
                          <div>
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 mt-1 text-decoration-none text-primary"
                              href={cliente.cedula_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="bi bi-download me-1"></i>
                              Descargar Cédula
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <small className="text-muted fst-italic">
                          No hay cédula disponible
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Vista de Cédula</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Cédula"
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                borderRadius: "12px",
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminReservas;
