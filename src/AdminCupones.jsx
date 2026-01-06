import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";
import axios from "axios";
import API_URL from "./config/api";

const AdminCupones = () => {
  const token = localStorage.getItem("token");
  const [cupones, setCupones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [descuento, setDescuento] = useState("");
  const [mensaje, setMensaje] = useState("");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchCupones();
  }, []);

  const fetchCupones = async () => {
    try {
      const res = await axios.get( `${API_URL}/api/cupones`, axiosConfig);
      setCupones(res.data);
    } catch (error) {
      console.error("Error al obtener cupones:", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!descuento) return setMensaje("Selecciona un porcentaje de descuento");

    try {
      const res = await axios.post(
        `${API_URL}/api/cupones`,
        { discount_percentage: parseFloat(descuento) },
        axiosConfig
      );
      setMensaje(`✅ Cupón creado: ${res.data.code} (${res.data.discount_percentage}%)`);
      setDescuento("");
      setShowModal(false);
      fetchCupones();
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al crear el cupón");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este cupón?")) return;
    try {
      await axios.delete(`${API_URL}/api/cupones/${id}`, axiosConfig);
      fetchCupones();
    } catch (error) {
      console.error(error);
      alert("Error eliminando cupón");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Gestión de Cupones</h4>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <i class="bi bi-plus-lg"></i> Nuevo cupón
        </Button>
      </div>

      {mensaje && (
        <div className="alert alert-info text-center py-2">{mensaje}</div>
      )}

      <Table bordered hover responsive className="text-center">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descuento (%)</th>
            <th>Usado</th>
            <th>Fecha de creación</th>
          </tr>
        </thead>
        <tbody>
          {cupones.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No hay cupones creados
              </td>
            </tr>
          ) : (
            cupones.map((c) => (
              <tr key={c.id}>
                <td className="fw-semibold">{c.code}</td>
                <td>{c.discount_percentage}%</td>
                <td>{c.is_used ? "Si ✅" : " No ❌"}</td>
                <td>{new Date(c.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal para crear cupón */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Cupón</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Porcentaje de descuento</Form.Label>
              <Form.Select
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                required
              >
                <option value="">Seleccionar</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Crear cupón
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminCupones;
