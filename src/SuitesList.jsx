import { useState, useEffect } from "react";
import axios from "axios";
const SuitesList = () => {
  const [suites, setSuites] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/suites")
      .then(response => setSuites(response.data))
      .catch(error => console.error("Error al obtener suites", error));
  }, []);

  return (
    <div className="container mt-4" id="suites">
      <h2 className="text-center mb-4"></h2>
      <div className="row">
        {suites.map(suite => (
          <div key={suite.id} className="col-md-6 mb-4">
            <div className="card h-100">
              <img
                src={suite.image_url}
                alt={suite.nombre}
                className="card-img-top suite-image"
              />
              <div className="card-body">
                <h3 className="card-title">{suite.nombre}</h3>
                <p className="card-text">{suite.descripcion}</p>
                <p className="card-text">
                  <strong>Precio:</strong> ${suite.precio}
                </p>
                <button>Detalles</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <hr className="my-4" />
    </div>
  );
};

export default SuitesList;