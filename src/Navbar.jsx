import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/principal-page/logo2.png";
import { useAuth } from "./AuthContext";
import Login from "./login";
import Register from "./Register";
import { Dropdown } from "react-bootstrap";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // abrir / cerrar login
  const handleLoginShow = () => {
    setShowRegister(false);
    setShowLogin(true);
  };
  const handleLoginClose = () => setShowLogin(false);

  // abrir / cerrar register
  const handleRegisterShow = () => {
    setShowLogin(false);
    setShowRegister(true);
  };
  const handleRegisterClose = () => setShowRegister(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`navbar-custom navbar navbar-expand-lg navbar-dark fixed-top ${
          scrolled ? "navbar-custom" : "navbar-scrolled"
        }`}
      >
        <div className="container d-flex align-items-center justify-content-between">
          {/* Botón Hamburguesa */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Opciones de navegación */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto fs-5 align-items-center">
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-bold" href="#suites">Suites</a>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/servicios">Servicios</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/sobre-nosotros">Sobre nosotros</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/contacto">Contacto</Link>
              </li>

              {/* Menú usuario */}
              <li className="nav-item fw-bold">
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-user"
                    className="navbar-icon-button"
                  >
                    <i className="bi bi-person-circle"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {!user ? (
                      <>
                        <Dropdown.Item onClick={handleLoginShow}>
                          Iniciar sesión
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleRegisterShow}>
                          Registrarse
                        </Dropdown.Item>
                      </>
                    ) : (
                      <>
                        <Dropdown.Header>
                          Hola, {user.name}
                        </Dropdown.Header>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout}>
                          Cerrar sesión
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
          </div>

          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center ms-auto" to="/">
            <img
              src={logo}
              alt="Logo Quito Smiles Suites"
              width="160"
              height="120"
              className="navbar-logo"
            />
          </Link>
        </div>
      </nav>

      {/* Modal Login con link a Register */}
       <Login
        show={showLogin}
        handleClose={handleLoginClose}
        children={
          <p className="text-center mt-3">
            ¿No tienes cuenta?{" "}
            <span
              className="text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleLoginClose();
                handleRegisterShow();
              }}
            >
              Regístrate
            </span>
          </p>
        }
      />

      {/* Modal Register con link a Login */}
       <Register
        show={showRegister}
        handleClose={handleRegisterClose}
        children={
          <p className="text-center mt-3">
            ¿Ya tienes cuenta?{" "}
            <span
              className="text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleRegisterClose();
                handleLoginShow();
              }}
            >
              Inicia sesión
            </span>
          </p>
        }
      />
    </>
  );
};

export default Navbar;
