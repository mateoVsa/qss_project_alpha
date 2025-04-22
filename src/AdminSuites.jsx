// src/pages/AdminSuites.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { PencilSquare, Trash, PlusCircle } from "react-bootstrap-icons";

const AdminSuites = () => {
  const [suites, setSuites] = useState([]);
  const [show, setShow] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    descripcion_pequena: "",
    zona_estrategica: "",
    desc_movilidad: "",
    precio: "",
    max_capacity: ""
  });

  useEffect(() => {
    fetchSuites();
  }, []);

  const fetchSuites = async () => {
    try {
      const response = await axios.get("http://localhost:5000/suites");
      setSuites(response.data);
    } catch (error) {
      console.error("Error al obtener suites", error);
      setMensaje("Error al cargar las suites");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["max_capacity", "precio"].includes(name) ? (value ? Number(value) : "") : value,
    }));
  };

  const handleSubmit = async () => {
    setMensaje("");

    if (!formData.nombre || !formData.precio || !formData.max_capacity) {
      setMensaje("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const data = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      descripcion_pequena: formData.descripcion_pequena,
      zona_estrategica: formData.zona_estrategica,
      desc_movilidad: formData.desc_movilidad,
      precio: formData.precio,
      max_capacity: formData.max_capacity,
    };
  
    try {
      if (formData.id) {
        // Modo edición
        const res = await axios.put(`http://localhost:5000/suites/${formData.id}`, data, {
          headers: { "Content-Type": "application/json" },
        });
  
        // Actualiza la lista local
        setSuites((prevSuites) =>
          prevSuites.map((suite) => (suite.id === formData.id ? res.data : suite))
        );
  
        setMensaje("Suite actualizada exitosamente");
      } else {
        // Modo creación
        const res = await axios.post("http://localhost:5000/suites", data, {
          headers: { "Content-Type": "application/json" },
        });
  
        setSuites([...suites, res.data]);
        setMensaje("Suite creada exitosamente");
      }
  
      setShow(false);
      setFormData({
        nombre: "",
        descripcion: "",
        descripcion_pequena: "",
        zona_estrategica: "",
        desc_movilidad: "",
        precio: "",
        max_capacity: "",
      });
    } catch (error) {
      setMensaje("Error al guardar suite");
      console.error("Error en la solicitud:", error);
      if (error.response) {
        console.log("Detalles del error:", error.response.data);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm("¿Seguro que deseas eliminar esta suite?")) return;
    try {
      await axios.delete(`http://localhost:5000/suites/${id}`);
      setSuites((prev) => prev.filter((suite) => suite.id !== id));
      setMensaje("Suite eliminada correctamente");
    } catch (error) {
      setMensaje("Error al eliminar suite");
      console.error(error);
    }
  };
  const handleClose = () => {
    setShow(false);
    setFormData({
      nombre: "",
      descripcion: "",
      descripcion_pequena: "",
      zona_estrategica: "",
      desc_movilidad: "",
      precio: "",
      max_capacity: "",
    });
  };
  

  const handleEdit = (suite) => {
    setFormData(suite);
    setShow(true);
  };

  return (
    <div className="container mt-4 admin-con">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className=" fw-bold">Administración de Suites</h2>
        <Button variant="success" className="new-item" onClick={() => {
          setFormData({
            nombre: "",
            descripcion: "",
            descripcion_pequena: "",
            zona_estrategica: "",
            desc_movilidad: "",
            precio: "",
            max_capacity: ""
          });
          setShow(true);
        }}>
          <PlusCircle className="me-2" /> Agregar Suite
        </Button>
      </div>

      {mensaje && <Alert variant="info">{mensaje}</Alert>}

      <div className="table-responsive">
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-light">
            <tr>
              <th><b>Nombre</b></th>
              <th><b>Zona</b></th>
              <th><b>Capacidad</b></th>
              <th><b>Precio/Noche</b></th>
              <th className="text-center"><b>Acciones</b></th>
            </tr>
          </thead>
          <tbody>
            {suites.map((suite) => (
              <tr key={suite.id}>
                <td>{suite.nombre}</td>
                <td>{suite.zona_estrategica}</td>
                <td>{suite.max_capacity}</td>
                <td>${suite.precio}</td>
                <td className="text-center">
                  <Button variant="outline-warning" size="sm" onClick={() => handleEdit(suite)} className="me-2">
                    <PencilSquare /> Editar
                  </Button>
                  <Button variant="outline-danger"className="btn-delete" size="sm" onClick={() => handleDelete(suite.id)}>
                    <Trash /> Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal para Agregar/Editar */}
      <Modal show={show} onHide={() => setShow(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? "Editar Suite" : "Nueva Suite"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Zona Estratégica</Form.Label>
                <Form.Control type="text" name="zona_estrategica" value={formData.zona_estrategica} onChange={handleChange} />
              </Form.Group>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Descripción Corta</Form.Label>
              <Form.Control type="text" name="descripcion_pequena" value={formData.descripcion_pequena} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción Completa</Form.Label>
              <Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción de Movilidad</Form.Label>
              <Form.Control type="text" name="desc_movilidad" value={formData.desc_movilidad} onChange={handleChange} />
            </Form.Group>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Capacidad Máxima</Form.Label>
                <Form.Control type="number" name="max_capacity" value={formData.max_capacity} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Precio por Noche ($)</Form.Label>
                <Form.Control type="number" name="precio" value={formData.precio} onChange={handleChange} required />
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary"onChange={handleClose} onClick={() => setShow(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSuites;
