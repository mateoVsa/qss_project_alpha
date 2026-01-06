import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const BillingInfoModal = ({ show, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: "",
    cedula_ruc: "",
    direccion: "",
    correo: "",
    telefono: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.nombre || !form.cedula_ruc || !form.direccion) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }
    setError("");
    onSave(form);
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      className="billing-modal"
      dialogClassName="billing-modal" 
    >
      <Modal.Header closeButton>
        <Modal.Title>Datos de Facturación</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre o Razón Social</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez o Hotel Quito S.A."
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cédula / RUC </Form.Label>
            <Form.Control
              type="text"
              name="cedula_ruc"
              value={form.cedula_ruc}
              onChange={handleChange}
              placeholder="Ej: 1728391823"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dirección </Form.Label>
            <Form.Control
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Amazonas y Colón"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="Ej: facturacion@empresa.com"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej: +593 99 123 4567"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="outline-secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar Datos
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BillingInfoModal;
