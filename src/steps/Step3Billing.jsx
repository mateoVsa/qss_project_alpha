import { pre } from "framer-motion/client";
import { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

export default function Step3Billing({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setData((prev)=>({
      ...(typeof prev === "object" && prev ? prev: {}),
      [field]:value,
    }))
  };

  const validate = () => {
    const b = data || {};
    const newErrors = {};

    if (!b.nombre || !b.nombre.trim()) newErrors.nombre = "Requerido";
    if (!b.cedula || !b.cedula.trim()) newErrors.cedula = "Requerido";
    if (!b.correo || !b.correo.trim()) newErrors.correo = "Requerido";
    if (!b.telefono || !b.telefono.trim()) newErrors.telefono = "Requerido";
    if (!b.direccion || !b.direccion.trim()) newErrors.direccion = "Requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const billing = data  || {};

  return (
    <>
      <h4 className="fw-bold mt-3 mb-3">Datos de Facturación</h4>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Nombre completo</Form.Label>
            <Form.Control
              type="text"
              value={billing.nombre || ""}
              onChange={(e) => handleChange("nombre", e.target.value)}
              isInvalid={!!errors.nombre}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Cédula / RUC</Form.Label>
            <Form.Control
              type="text"
              value={billing.cedula || ""}
              onChange={(e) => handleChange("cedula", e.target.value)}
              isInvalid={!!errors.cedula}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cedula}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              value={billing.correo || ""}
              onChange={(e) => handleChange("correo", e.target.value)}
              isInvalid={!!errors.correo}
            />
            <Form.Control.Feedback type="invalid">
              {errors.correo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={billing.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
              isInvalid={!!errors.telefono}
            />
            <Form.Control.Feedback type="invalid">
              {errors.telefono}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              value={billing.direccion || ""}
              onChange={(e) => handleChange("direccion", e.target.value)}
              isInvalid={!!errors.direccion}
            />
            <Form.Control.Feedback type="invalid">
              {errors.direccion}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={onBack}>
          Atrás
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Siguiente
        </Button>
      </div>
    </>
  );
}
