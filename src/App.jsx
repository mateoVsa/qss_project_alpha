import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/principal-page/style.css";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import SuitesPage from "./SuitesPage";
import SuitesList from "./SuitesList";
import AdminSuites from "./AdminSuites";
import PurchaseDetail from "./PurchaseDetail";
import Login from "./login";
import AdminLogin from "./AdminLogin";
import ProtectedRoute from "./ProtectedRoute";
import Header from "./Header";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailed from "./PaymentFailed";
import MisReservas from "./MisReservas";
import PrivacyPolicy from "./PrivacyPolicy";
function App() {
  return (
    <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
<Router>
      <Routes>
        {/* Páginas públicas */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Header />
              <section id="suites" className="luxury-title-section">
  <div className="overlay-logo"></div>
  <div className="content text-center">
    <img
    src="src\assets\principal-page\logo.png"
    alt="Logo"
    className="section-logo"
  />

    <h3 className="display-5 fw-bold text-uppercase text-black">
      SUITES
    </h3>

    <div className="gold-line"></div>

    <p className="lead text-black mt-4 mx-auto description">
      Suites amobladas para rentas cortas. Totalmente equipadas
      para estadías cómodas en la ciudad.
    </p>
  </div>
</section>
              <SuitesList />
            </PublicLayout>
          }
        />
        <Route
          path="/suites/:id"
          element={
            <PublicLayout>
              <SuitesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/detalle-compra"
          element={
            <PublicLayout>
              <PurchaseDetail />
            </PublicLayout>
          }
        />
        <Route path="/pago-exitoso/:reservaId" element={<PaymentSuccess />} />
        <Route path="/pago-fallido/:reservaId" element={<PaymentFailed />} />

        <Route path="/login" element={<Login />} />
        <Route
  path="/mis-reservas"
  element={
    <PublicLayout>
      <MisReservas />
    </PublicLayout>
  }
/>
<Route
  path="/politica-privacidad"
  element={
    <PublicLayout>
      <PrivacyPolicy />
    </PublicLayout>
  }
/>


        {/* Login exclusivo de admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Panel de administración */}
        <Route
          path="/admin/suites"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminSuites />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </PayPalScriptProvider>
    
  );
}

export default App;
