
import background from "./assets/principal-page/1.png";
import Designer from './assets/principal-page/Designer.png'
function Header() {
  return (
    <header
          className="header-1 text-center text-light py-5"
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
          }}
        >
          <div className="container my-5 hero-section">
            <div className="container-f">
            <h1 className="display-2 fw-bold">BIENVENIDO</h1>
            <p className="lead">
              A Quito Smiles Suites <b>"Experiencias con sonrisas"</b>.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <a href="#suites" className="btn btn-outline-light btn-lg buton rounded-pill">
                Explora
              </a>
              <a
        href="https://wa.me/593995921047?text=¡Hola! Estoy interesad@ en más información sobre las suites que ofertan."
        target="_blank"
        rel="noopener noreferrer" 
        className="btn btn1 btn-success btn-lg rounded-pill"
      >
        <i className="bi bi-whatsapp"></i> Escríbenos
      </a>
            </div>
            
            </div>
          </div>
          
        </header>
      
  )
}

export default Header
