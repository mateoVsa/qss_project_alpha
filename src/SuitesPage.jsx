import React, { useState, useEffect } from "react";
import axios from "axios";

const Suites = () => {
  const [suite, setSuite] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    
    axios.get("http://localhost:5000/suites")
      .then(response => {
        const suiteWithId1 = response.data.find(suite => suite.id === 1);
        if (suiteWithId1) {
          setSuite(suiteWithId1); 
        } else {
          setError("No se encontró la suite con id=1");
        }
        setLoading(false); 
      })
      .catch(error => {
        console.error("Error al obtener suites", error);
        setError("Error al cargar los datos"); 
        setLoading(false); 
      });
  }, []);

  
  if (loading) {
    return <div className="text-center mt-4">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center mt-4 text-danger">{error}</div>;
  }

  return (
    <div className="container mt-5 header3">
      {/* Encabezado */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">{suite.nombre}</h1>
        <p className="lead">{suite.descripcion}</p>
      </div>

      {/* Sección de detalles */}
      <div className="row">
        {/* Columna izquierda */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title fw-bold">Detalles</h3>
              <p className="card-text">
                {suite.detalles || "Detalles no disponibles."}
              </p>
              <ul className="list-unstyled">
                <li><strong>Característica 1:</strong> {suite.caracteristica1 || "Descripción breve."}</li>
                <li><strong>Característica 2:</strong> {suite.caracteristica2 || "Descripción breve."}</li>
                <li><strong>Característica 3:</strong> {suite.caracteristica3 || "Descripción breve."}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title fw-bold">Información Adicional</h3>
              <p className="card-text">
                {suite.informacion_adicional || "Información adicional no disponible."}
              </p>
              <button className="btn btn-primary">Más Información</button>
            </div>
          </div>
        </div>
      </div>

      {/* Línea decorativa */}
      <hr className="my-5" />
    </div>
  );
};

export default Suites;