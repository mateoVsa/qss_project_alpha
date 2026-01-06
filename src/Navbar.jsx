import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/principal-page/logo2.png";
import { useAuth } from "./AuthContext";
import Login from "./login";
import Register from "./Register";
import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next"; // Importamos hook de traducción

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Inicializamos traducción

  // Cambio de idioma
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

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
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto fs-5 align-items-center">
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/">{t("Home")}</Link>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-bold" href="#suites">{t("Suites")}</a>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/servicios">{t("Services")}</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/sobre-nosotros">{t("About")}</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-bold" to="/contacto">{t("Contact")}</Link>
              </li>

              {/* Menú de usuario */}
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
                         <i class="bi bi-door-open"></i> {t("Login")}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleRegisterShow}>
                          {t("Sign In")}
                        </Dropdown.Item>
                      </>
                    ) : (
                      <>
                        <Dropdown.Header>
                        <i class="bi bi-file-person-fill"></i>  {user.name} 
                        </Dropdown.Header>
                         <Dropdown.Item onClick={() => navigate("/mis-reservas")}>
      <i class="bi bi-card-checklist"></i> {t("My reservations")}
    </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout}>
                          {t("Logout")} 
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </li>

              
            </ul>
          </div>

          {/* Logo y selector de idioma */}
<div className="d-flex align-items-center ms-auto gap-3">
  <Link className="navbar-brand d-flex align-items-center" to="/">
    <img
      src={logo}
      alt="Logo Quito Smiles Suites"
      width="160"
      height="120"
      className="navbar-logo"
    />
  </Link>

  {/* Selector de idioma */}
  {/* <Dropdown align="end">
    <Dropdown.Toggle
      variant="light"
      className="d-flex align-items-center border-0 bg-transparent fw-semibold"
      style={{ color: "#fff" }}
    >
      <i className="bi bi-translate me-2"></i>
      {i18n.language === "es" ? "Español" : "English"}
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item onClick={() => changeLanguage("es")}>
        🇪🇸 Español
      </Dropdown.Item>
      <Dropdown.Item onClick={() => changeLanguage("en")}>
        🇺🇸 English
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown> */}
</div>

        </div>
      </nav>

      {/* Modales */}
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
