import { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Alert, FloatingLabel } from "react-bootstrap";
import { useAuth } from "./AuthContext";

const Register = ({ show, handleClose, onRegisterSuccess, children }) => {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password" || name === "confirmPassword") {
      setPasswordMatch(
        name === "password" ? value === formData.confirmPassword : formData.password === value
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!passwordMatch) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      setUser(user);

      const me = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(me.data.user);

      if (onRegisterSuccess) onRegisterSuccess();
      else handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar usuario. Intenta nuevamente.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear cuenta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <FloatingLabel controlId="registerName" label="Nombre completo" className="mb-3">
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre completo"
              required
            />
          </FloatingLabel>

          <FloatingLabel controlId="registerEmail" label="Correo electrónico" className="mb-3">
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico"
              required
            />
          </FloatingLabel>

          <FloatingLabel controlId="registerPassword" label="Contraseña" className="mb-3">
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
            />
          </FloatingLabel>

          <FloatingLabel controlId="registerConfirmPassword" label="Confirmar contraseña" className="mb-3">
            <Form.Control
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmar contraseña"
              style={{ borderColor: passwordMatch ? "initial" : "red" }}
              required
            />
            {!passwordMatch && (
              <p style={{ color: "red", fontSize: "0.9em" }}>
                Las contraseñas no coinciden
              </p>
            )}
          </FloatingLabel>

          <Button variant="success" type="submit" className="w-100">
            Registrarse
          </Button>
        </Form>

        {children && children}
      </Modal.Body>
    </Modal>
  );
};

export default Register;
