import { useEffect, useState } from "react";
import axios from "axios";
import { Badge, Button, Card, Modal, Row, Col,OverlayTrigger, Tooltip, Form, Accordion} from "react-bootstrap";
import IconButton from "./IconButton";
import API_URL from "./config/api";
const AdminReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedView, setSelectedView] = useState("");
  const [viewByReserva, setViewByReserva] = useState({});



  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReservas();
  }, []);
  const handleChangeView = (reservaId, view) => {
  setViewByReserva((prev) => ({
    ...prev,
    [reservaId]: view,
  }));
};


  const fetchReservas = async () => {
    try {
      // const res = await axios.get("https://qss-backend-zed8.onrender.com/api/admin/reservas", {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      const res = await axios.get(`${API_URL}/api/admin/reservas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reservasConUrl = res.data.map((reserva) => ({
        ...reserva,
        clientes: reserva.clientes.map((cliente) => ({
          ...cliente,
          cedula_url: cliente.cedula_path
            // ? `https://qss-backend-zed8.onrender.com/${cliente.cedula_path}`
            ? `${API_URL}/${cliente.cedula_path}`
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
        // `https://qss-backend-zed8.onrender.com/api/admin/reserva/${id}/pdf`,
        `${API_URL}/api/admin/reserva/${id}/pdf`,
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
      <div className="table-responsive shadow-sm rounded-4">
  <table className="table table-hover align-middle mb-0">
    <thead className="table-light">
      <tr>
        <th># Reserva</th>
        <th>Cliente</th>
        <th>Suite</th>
        <th>Fecha de llegada</th>
        <th>Fecha de salida</th>
        <th> # Personas</th>
        <th> Total pagado </th>
        <th>Estado</th>
        <th className="text-center">Acciones</th>
      </tr>
    </thead>

    <tbody>
      {reservas.map((reserva) => (
        <>
          <tr
            key={reserva.reserva_id}
            style={{ cursor: "pointer" }}
            onClick={() =>
              setViewByReserva((prev) => ({
                ...prev,
                [reserva.reserva_id]:
                  prev[reserva.reserva_id] ? "" : "responsable",
              }))
            }
          >
            <td><strong>#{reserva.reserva_id}</strong></td>
            <td>{reserva.nombre_cliente}</td>
            <td>{reserva.suite_nombre}</td>
            <td>{new Date(reserva.start_date).toLocaleDateString()}</td>
            <td>{new Date(reserva.end_date).toLocaleDateString()}</td>
            <td>{reserva.personas}</td>
            <td>${reserva.total_pagado}</td>
            <td>
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
            </td>

            <td className="text-center">
              <Button
                size="sm"
                variant="outline-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadPDF(reserva.reserva_id);
                }}
              >
                <i className="bi bi-file-earmark-pdf"></i>
              </Button>
            </td>
          </tr>

          {viewByReserva[reserva.reserva_id] && (
            <tr>
              <td colSpan="8" className="bg-light">
               
  <Accordion defaultActiveKey="0" className="mt-2">
    <Accordion.Item eventKey="0">
      <Accordion.Header>
        Información del Responsable y Huéspedes
      </Accordion.Header>

      <Accordion.Body>

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

            <div className="text-muted small">Correo: {cliente.correo || "-"}</div>
            <div className="text-muted small">Teléfono: {cliente.telefono || "-"}</div>
            <div className="text-muted small">
              Teléfono Emergencia: {cliente.telefono_emergencia || "-"}{" "}
              {cliente.parentesco ? `(${cliente.parentesco})` : ""}
            </div>
            <div className="text-muted small">Ciudad: {cliente.ciudad || "-"}</div>
            <div className="text-muted small">
              Motivo: {cliente.motivo || "-"}{" "}
              {cliente.detalle_motivo ? `- ${cliente.detalle_motivo}` : ""}
            </div>

            {/* Cédula */}
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

      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
<Accordion defaultActiveKey="0" className="mt-2">
    <Accordion.Item eventKey="0">
      <Accordion.Header>Datos de Facturación</Accordion.Header>

      <Accordion.Body>
        {reserva.factura && reserva.factura.nombre ? (
          <div>
            <strong>Razón Social:</strong> {reserva.factura.nombre}<br />
            <strong>RUC:</strong> {reserva.factura.cedula_ruc}<br />
            <strong>Dirección:</strong> {reserva.factura.direccion}<br />
            <strong>Email:</strong> {reserva.factura.correo}<br />
            <strong>Teléfono:</strong> {reserva.factura.telefono}
          </div>
        ) : (
          <div className="text-danger">
            No se han guardado datos de facturación.
          </div>
        )}
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
                
  
              </td>
            </tr>
          )}
        </>
      ))}
    </tbody>
  </table>
</div>


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
