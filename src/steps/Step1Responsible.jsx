import { Form, Row, Col, Button } from "react-bootstrap";
import { useState } from "react";

export default function Step1Responsible({
  data,
  includeTransport,
  onChange,
  onNext,
}) {
  const [errors, setErrors] = useState({});

  const parentescoOpciones = [
    "Padre",
    "Madre",
    "Hijo/a",
    "Otro",
  ];

  const motivoOpciones = [
    "Vacaciones",
    "Trabajo",
    "Familia",
    "Salud",
    "Educación",
    "Turismo",
    "Evento",
    "Otro",
  ];

  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0] || null;
    handleChange("cedulaFile", file);
  };

  const validate = () => {
    const newErrors = {};

    if (!data.nombres) newErrors.nombres = "Requerido";
    if (!data.apellidos) newErrors.apellidos = "Requerido";
    if (!data.cedula) newErrors.cedula = "Requerido";
    if (!data.fechaNacimiento) newErrors.fechaNacimiento = "Requerido";
    if (!data.telefono) newErrors.telefono = "Requerido";
    if (!data.correo) newErrors.correo = "Requerido";
    if (!data.telefonoEmergencia) newErrors.telefonoEmergencia = "Requerido";

    if (!data.parentesco) newErrors.parentesco = "Requerido";
    if (!data.motivo) newErrors.motivo = "Requerido";

    if (!data.detalleMotivo) newErrors.detalleMotivo = "Requerido";
    if (!data.ciudad) newErrors.ciudad = "Requerido";

    if (!data.cedulaFile) newErrors.cedulaFile = "Requerido";

    if (includeTransport && !data.horaLlegada) {
      newErrors.horaLlegada = "Requerido si incluye transporte";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onNext();
  };

  return (
    <>
      <h4 className="fw-bold mt-3 mb-3">Huésped Responsable</h4>

      {/* NOMBRES Y APELLIDOS */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Nombres</Form.Label>
            <Form.Control
              type="text"
              value={data.nombres}
              onChange={(e) => handleChange("nombres", e.target.value)}
              isInvalid={!!errors.nombres}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombres}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Apellidos</Form.Label>
            <Form.Control
              type="text"
              value={data.apellidos}
              onChange={(e) => handleChange("apellidos", e.target.value)}
              isInvalid={!!errors.apellidos}
            />
            <Form.Control.Feedback type="invalid">
              {errors.apellidos}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* CÉDULA / FECHA NAC */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Cédula / Pasaporte</Form.Label>
            <Form.Control
              type="text"
              value={data.cedula}
              onChange={(e) => handleChange("cedula", e.target.value)}
              isInvalid={!!errors.cedula}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cedula}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Fecha de nacimiento</Form.Label>
            <Form.Control
              type="date"
              value={data.fechaNacimiento}
              onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              isInvalid={!!errors.fechaNacimiento}
            />
            <Form.Control.Feedback type="invalid">
              {errors.fechaNacimiento}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* TELÉFONOS */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={data.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              isInvalid={!!errors.telefono}
            />
            <Form.Control.Feedback type="invalid">
              {errors.telefono}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              value={data.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              isInvalid={!!errors.correo}
            />
            <Form.Control.Feedback type="invalid">
              {errors.correo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* EMERGENCIA + PARENTESCO */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Teléfono de Emergencia</Form.Label>
            <Form.Control
              type="text"
              value={data.telefonoEmergencia}
              onChange={(e) => handleChange("telefonoEmergencia", e.target.value)}
              isInvalid={!!errors.telefonoEmergencia}
            />
            <Form.Control.Feedback type="invalid">
              {errors.telefonoEmergencia}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        {/* SELECT PARENTESCO */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Parentesco</Form.Label>
            <Form.Select
              value={data.parentesco}
              onChange={(e) => handleChange("parentesco", e.target.value)}
              isInvalid={!!errors.parentesco}
            >
              <option value="">Seleccionar...</option>
              {parentescoOpciones.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.parentesco}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* MOTIVO */}
      <Row className="mb-3">
        {/* SELECT MOTIVO */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Motivo</Form.Label>
            <Form.Select
              value={data.motivo}
              onChange={(e) => handleChange("motivo", e.target.value)}
              isInvalid={!!errors.motivo}
            >
              <option value="">Seleccionar...</option>
              {motivoOpciones.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.motivo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Detalle del motivo</Form.Label>
            <Form.Control
              type="text"
              value={data.detalleMotivo}
              onChange={(e) => handleChange("detalleMotivo", e.target.value)}
              isInvalid={!!errors.detalleMotivo}
            />
            <Form.Control.Feedback type="invalid">
              {errors.detalleMotivo}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* CIUDAD */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Ciudad</Form.Label>
            <Form.Control
              type="text"
              value={data.ciudad}
              onChange={(e) => handleChange("ciudad", e.target.value)}
              isInvalid={!!errors.ciudad}
            />
            <Form.Control.Feedback type="invalid">
              {errors.ciudad}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* ARCHIVO CÉDULA */}
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>Foto de cédula</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFile}
              isInvalid={!!errors.cedulaFile}
            />
            <Form.Control.Feedback type="invalid">
              {errors.cedulaFile}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* TRANSPORTE */}
      {includeTransport && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Hora estimada de llegada</Form.Label>
              <Form.Control
                type="time"
                value={data.horaLlegada}
                onChange={(e) => handleChange("horaLlegada", e.target.value)}
                isInvalid={!!errors.horaLlegada}
              />
              <Form.Control.Feedback type="invalid">
                {errors.horaLlegada}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      )}

      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={handleSubmit}>
          Siguiente
        </Button>
      </div>
    </>
  );
}
