import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { Modal, Button, Form, Alert, FloatingLabel } from "react-bootstrap";

const Login = ({ show, handleClose, children }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      handleClose();
    } catch (err) {
      setError("Credenciales inválidas o error en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Iniciar sesión</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <FloatingLabel
            controlId="loginEmail"
            label="Correo electrónico"
            className="mb-3"
          >
            <Form.Control
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FloatingLabel>

          <FloatingLabel
            controlId="loginPassword"
            label="Contraseña"
            className="mb-3"
          >
            <Form.Control
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FloatingLabel>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </Button>
        </Form>

        {children && children}
      </Modal.Body>
    </Modal>
  );
};

export default Login;
