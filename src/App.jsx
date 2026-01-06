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
              <section id="suites">
                <div className="container-fluid p-5">
                  <div className="text-center position-relative">
                    <h3 className="display-6 fw-bold d-inline-block">SUITES</h3>
                    <hr className="custom-line mx-auto" />
                  </div>
                  <p className="lead text-dark m-4">
                    Suites amobladas para rentas cortas. Totalmente equipadas
                    para estadías cómodas en la ciudad (cocina, baño, lavandería,
                    parqueadero, etc.) Ubicadas en las mejores zonas de Quito.
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
