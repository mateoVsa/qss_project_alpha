import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Dispara la animación al montar el componente
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      console.log("Resultado del login",user);
      if (user.role !== "admin") {
        setError("No tienes permisos de administrador");
        return;
      }

      navigate("/admin/suites");
    } catch (err) {
      console.error(err);
      setError("Email o contraseña incorrectos");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #000000ff 0%, #D5B667 100%)",
        overflow: "hidden",
      }}
    >
      <div
        className={`card shadow-lg p-4 ${
          visible ? "fade-in" : "fade-start"
        }`}
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "16px",
          border: "none",
          backgroundColor: "white",
          transition: "all 0.8s ease",
        }}
      >
        <div className="text-center mb-4">
          <i
            className="bi bi-shield-lock-fill text-primary"
            style={{ fontSize: "3rem" }}
          ></i>
          <h4 className="mt-2 fw-semibold text-dark">Panel Administrativo</h4>
          <p className="text-muted small">Acceso exclusivo para administradores</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="admin@qss.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn2 btn-primary w-100 fw-semibold"
            style={{ borderRadius: "10px" }}
          >
            Iniciar sesión
          </button>
        </form>
      </div>

      {/* Animaciones inline */}
      <style>{`
        .fade-start {
          opacity: 0;
          transform: translateY(30px);
        }
        .fade-in {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
