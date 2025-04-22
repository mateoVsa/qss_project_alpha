import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import Navbar from "./Navbar";
import SuitesPage from './SuitesPage';
import "./assets/principal-page/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import SuitesList from "./SuitesList";
import AdminSuites from './AdminSuites';
import "bootstrap/dist/css/bootstrap.min.css";
import PurchaseDetail from "./PurchaseDetail";


function App() {
  return (
    <Router>
      <div>
        <Navbar /> {/* Navbar se muestra en todas las páginas */}
        <Routes>
          {/* Ruta para la página de inicio */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <section id="suites">
                  <div className="container-fluid p-5">
                    <div className="text-center position-relative">
                      <h3 className="display-6 fw-bold d-inline-block">SUITES</h3>
                      <hr className="custom-line mx-auto" />
                    </div>
                    <p className="lead text-dark m-4">
                      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Rem laborum, iste veniam aperiam fugit debitis dicta quo, quod voluptates accusamus sapiente ipsam necessitatibus? Cum doloribus, repudiandae animi sapiente pariatur reiciendis.
                    </p>
                    <hr className="custom-line2 mx-auto" />
                  </div>
                </section>
                <SuitesList />
              </>
            }
          />
          <Route path="/admin/suites" element={<AdminSuites />} />
          {/* Ruta para la página de suites */}
          <Route path="/suites/:id" element={<SuitesPage/>} />
          <Route path="/detalle-compra" element={<PurchaseDetail />} />
        </Routes>
        <Footer /> {/* Footer se muestra en todas las páginas */}
      </div>
    </Router>
  );
}

export default App;