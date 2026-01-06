import React from "react";

const SelectorPersonas = ({ value, setValue, max, capacidadBase }) => {
  const handleDecrease = () => {
    if (value > 1) setValue(value - 1);
  };

  const handleIncrease = () => {
    if (value < max) setValue(value + 1);
  };

  return (
    <div className="selector-personas-container p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center">

        {/* Texto */}
        <div>
          <h6 className="m-0 fw-bold">Personas</h6>
          {value > capacidadBase ? (
            <small className="text-warning">
              Incluye {value - capacidadBase} colchón(es) adicional(es)
            </small>
          ) : (
            <small className="text-muted">
              Capacidad: {capacidadBase} personas
            </small>
          )}
        </div>

        {/* Controles */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary rounded-circle"
            style={{ width: "38px", height: "38px" }}
            onClick={handleDecrease}
            disabled={value <= 1}
          >
            –
          </button>

          <span className="fw-bold fs-5">{value}</span>

          <button
            className="btn btn-outline-secondary rounded-circle"
            style={{ width: "38px", height: "38px" }}
            onClick={handleIncrease}
            disabled={value >= max}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectorPersonas;
