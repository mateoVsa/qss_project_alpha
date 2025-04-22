// src/pages/PurchaseDetail.jsx
import { useLocation } from "react-router-dom";
 // Puedes crear un CSS propio o añadir esto a tu global

const PurchaseDetail = () => {
  const location = useLocation();
  const { suite, people, startDate, endDate, extraBeds, totalPrice } = location.state || {};

  if (!suite) return <p className="text-center mt-5">No se encontraron datos de la suite.</p>;

  return (
    <div className="container admin-con d-flex justify-content-center align-items-center mt-5">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: "600px" }}>
        <h2 className="mb-4 fw-bold">Resumen de tu reserva</h2>
        <hr />
        <div className="mb-3">
          <p><i className="bi bi-house-fill text-secondary me-2"></i><strong>Suite:</strong> {suite.nombre}</p>
          <p><i className="bi bi-people-fill text-secondary me-2"></i><strong>Personas:</strong> {people}</p>
          <p><i className="bi bi-calendar-event-fill text-secondary me-2"></i><strong>Entrada:</strong> {new Date(startDate).toLocaleDateString()}</p>
          <p><i className="bi bi-calendar-check-fill text-secondary me-2"></i><strong>Salida:</strong> {new Date(endDate).toLocaleDateString()}</p>
          <p><i className="bi bi-plus-square-fill text-secondary me-2"></i><strong>Colchones extra:</strong> {extraBeds}</p>
        </div>
        <hr />
        <div className="text-end mb-4">
          <p>d</p>
          <h4 className="fw-bold">Total: <span className="text-success">${totalPrice.toFixed(2)}</span></h4>
        </div>
        <div className="d-grid">
          <button className="btn btn-lg btn-success shadow-sm">
            <i className="bi bi-credit-card-fill me-2"></i> Proceder al pago
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetail;
