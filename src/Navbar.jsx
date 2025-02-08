import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/principal-page/logo.png"; // Ajusta la ruta según donde esté la imagen

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar-custom navbar navbar-expand-lg navbar-dark fixed-top ${scrolled ? "navbar-custom" : "navbar-scrolled"}`}>
      <div className="container d-flex align-items-center">
        {/* Logo más grande */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src={logo} 
            alt="Logo Quito Smiles Suites" 
            width="80" 
            height="120" 
            className="me-3 navbar-logo"
          />
          <span className={`fs-3 fw-bold  ${scrolled ? "nav-scroll" : ""}`}>Quito Smiles Suites</span>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto fs-5">
            <li className="nav-item"><Link className="nav-link fw-bold" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link fw-bold" to="/suites">Suites</Link></li>
            <li className="nav-item"><Link className="nav-link fw-bold" to="/servicios">Servicios</Link></li>
            <li className="nav-item"><Link className="nav-link fw-bold" to="/sobre-nosotros">Sobre nosotros</Link></li>
            <li className="nav-item"><Link className="nav-link fw-bold" to="/contacto">Contacto</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
