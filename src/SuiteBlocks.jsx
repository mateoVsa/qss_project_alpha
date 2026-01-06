import { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import API_URL from "./config/api";
export default function SuiteBlocks({ suiteId }) {
  const [show, setShow] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    motivo: ""
  });
  const token = localStorage.getItem("token");

  const loadBlocks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/bloqueos/${suiteId}`);
      setBlocks(res.data);
    } catch (err) {
      console.error("Error cargando bloqueos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  // VALIDACIÓN del formulario
  const validateForm = () => {
    if (!form.start_date || !form.end_date) {
      setError("Debes seleccionar ambas fechas.");
      return false;
    }

    if (new Date(form.start_date) > new Date(form.end_date)) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      setSaving(true);

      await axios.post(`${API_URL}/admin/bloqueos`, {
        suite_id: suiteId,
        start_date: form.start_date,
        end_date: form.end_date,
        motivo: form.motivo
      },
      {
        headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      },
    }
    );

      // limpiar formulario
      setForm({ start_date: "", end_date: "", motivo: "" });
      setShow(false);

      loadBlocks();
    } catch (err) {
      console.error("Error guardando bloqueo:", err);
      setError("Ocurrió un error al guardar el bloqueo.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBlock = async (id) => {
    if (!window.confirm("¿Eliminar este bloqueo?")) return;

    try {
      await axios.delete(`${API_URL}/admin/bloqueos/${id}`);
      loadBlocks();
    } catch (err) {
      console.error("Error eliminando bloqueo:", err);
    }
  };

  return (
    <div className="p-3 mt-3 shadow-sm rounded bg-light">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Bloqueo Manual de Fechas</h5>
        <Button variant="primary" onClick={() => setShow(true)}>
          Bloquear fechas
        </Button>
      </div>

      {/* TABLA DE BLOQUEOS */}
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Motivo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center py-3">
                <Spinner animation="border" size="sm" /> Cargando...
              </td>
            </tr>
          ) : blocks.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No hay bloqueos registrados
              </td>
            </tr>
          ) : (
            blocks.map((b) => (
              <tr key={b.id}>
                <td>{b.start_date}</td>
                <td>{b.end_date}</td>
                <td>{b.motivo || "-"}</td>
                <td className="text-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteBlock(b.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* MODAL PROFESIONAL */}
      <Modal show={show} onHide={() => setShow(false)} centered className="modal-elegante">
        <Modal.Header closeButton>
          <Modal.Title>Bloquear Fechas</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && (
            <Alert variant="danger" className="py-2">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de inicio</Form.Label>
              <Form.Control
                type="date"
                required
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de fin</Form.Label>
              <Form.Control
                type="date"
                required
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Motivo (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ej: Mantenimiento, limpieza profunda, evento privado..."
                value={form.motivo}
                onChange={(e) =>
                  setForm({ ...form, motivo: e.target.value })
                }
              />
            </Form.Group>

          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" /> Guardando...
              </>
            ) : (
              "Guardar bloqueo"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
