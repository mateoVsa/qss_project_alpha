import { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

export default function Step2Guests({ data, setData, onNext, onBack }) {
  const { totalGuests, guests } = data;

  const [errors, setErrors] = useState({});

  // -----------------------------
  // Manejo de cambios de inputs
  // -----------------------------
  const handleGuestChange = (index, e) => {
    const { name, value } = e.target;

    const updatedGuests = guests.map((g, i) =>
      i === index ? { ...g, [name]: value } : g
    );

    setData({ guests: updatedGuests });
  };
   const handleFile = (index, e) => {
    const file = e.target.files[0] || null;
    const updatedGuests = guests.map((g,i)=>
      i=== index ? {...g, cedulaFile:file}:g
    )
    setData({guests:updatedGuests})
  };
  // -----------------------------
  // Validación de huéspedes
  // -----------------------------
  const validate = () => {
    let errs = {};

    guests.forEach((g, index) => {
      if (!g.nombres?.trim()) errs[`nombres_${index}`] = "Requerido";
      if (!g.apellidos?.trim()) errs[`apellidos_${index}`] = "Requerido";
      if (!g.cedula?.trim()) errs[`cedula_${index}`] = "Requerido";
      if (!g.cedulaFile) errs[`cedulaFile_${index}`] = "Debe subir una foto de la cédula";
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // -----------------------------
  // Submit
  // -----------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onNext();
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-3">
      <h5 className="fw-bold mb-3">Huéspedes ({totalGuests})</h5>

      {guests.map((guest, index) => (
        <div key={index} className="border rounded p-3 mb-3">
          <h6 className="fw-bold">Huésped {index + 1}</h6>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  type="text"
                  name="nombres"
                  value={guest.nombres}
                  onChange={(e) => handleGuestChange(index, e)}
                  isInvalid={!!errors[`nombres_${index}`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`nombres_${index}`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  name="apellidos"
                  value={guest.apellidos}
                  onChange={(e) => handleGuestChange(index, e)}
                  isInvalid={!!errors[`apellidos_${index}`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`apellidos_${index}`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Cédula / Pasaporte</Form.Label>
                <Form.Control
                  type="text"
                  name="cedula"
                  value={guest.cedula}
                  onChange={(e) => handleGuestChange(index, e)}
                  isInvalid={!!errors[`cedula_${index}`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`cedula_${index}`]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaNacimiento"
                  value={guest.fechaNacimiento}
                  onChange={(e) => handleGuestChange(index, e)}
                />
              </Form.Group>
            </Col>
          </Row>
          {/* ARCHIVO DE CÉDULA */}
     <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Foto de cédula</Form.Label>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFile(index, e)}
                  isInvalid={!!errors[`cedulaFile_${index}`]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[`cedulaFile_${index}`]}
                </Form.Control.Feedback>

                {guest.cedulaFile && (
                  <p className="mt-1 small text-success">
                    Archivo cargado: {guest.cedulaFile.name}
                  </p>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>
      ))}

      <div className="d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={onBack}>
          Atrás
        </Button>

        <Button type="submit" variant="primary">
          Siguiente
        </Button>
      </div>
    </Form>
  );
}
