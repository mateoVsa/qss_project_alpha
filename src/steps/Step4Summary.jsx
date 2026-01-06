import { Card, Row, Col, Button } from "react-bootstrap";
import PayPalButton from "../PayPalButton";

export default function Step4Summary({
  data,
  suite,
  onBack,
  onConfirm,
  loading,
}) {
  
  const { responsible, guests, billing, totalPrice, includeTransport } = data;
  const handlePayPalSuccess = async (paypalDetails) =>{
    console.log("Pago Completado:", paypalDetails);

    await onConfirm(paypalDetails);
  }
  
  return (
    <div className="mt-3">
      <h4 className="fw-bold mb-4">Resumen de la Reserva</h4>

      {/* ================================
          RESPONSABLE
      ================================= */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Huésped Responsable</h5>

          <Row>
            <Col md={6}>
              <p><strong>Nombres:</strong> {responsible.nombres}</p>
              <p><strong>Apellidos:</strong> {responsible.apellidos}</p>
              <p><strong>Cédula:</strong> {responsible.cedula}</p>
              <p><strong>Teléfono:</strong> {responsible.telefono}</p>
              <p><strong>Correo:</strong> {responsible.correo}</p>
            </Col>

            <Col md={6}>
              <p><strong>Fecha nacimiento:</strong> {responsible.fechaNacimiento}</p>

              {includeTransport && (
                <p>
                  <strong>Hora de llegada:</strong>{" "}
                  {responsible.horaLlegada || "No especificada"}
                </p>
              )}

              {/* Archivo de cédula */}
              <div className="mt-2">
                <strong>Foto de cédula:</strong>
                {responsible.cedulaFile ? (
                  <div className="mt-2">
                    <p className="text-success mb-1">Archivo cargado:</p>
                    <p className="small">{responsible.cedulaFile.name}</p>

                    {/* Vista previa si es imagen */}
                    {responsible.cedulaFile.type.startsWith("image/") && (
                      <img
                        src={URL.createObjectURL(responsible.cedulaFile)}
                        alt="Cedula Preview"
                        className="img-fluid rounded border"
                        style={{ maxWidth: "180px" }}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-danger">No se ha subido ningún archivo</p>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ================================
          HUESPEDES
      ================================= */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Huéspedes Adicionales ({guests.length})</h5>
       
          {guests.map((g, i) => (
            <div key={i} className="mb-3 border-bottom pb-2">
              <Row>
              <Col md={5}>
              <p><strong>Huésped {i + 1}</strong></p>
              <p><strong>Nombres:</strong> {g.nombres}</p>
              <p><strong>Apellidos:</strong> {g.apellidos}</p>
              <p><strong>Cédula:</strong> {g.cedula}</p>
              <p><strong>Fecha nacimiento:</strong> {g.fechaNacimiento}</p>
              </Col>
              
              <Col md={6}>
              <div className="mt-2">
                <strong>Foto de cédula:</strong>
                {g.cedulaFile ? (
                  <div className="mt-2">
                    <p className="text-success mb-1">Archivo cargado:</p>
                    <p className="small">{g.cedulaFile.name}</p>

                    {/* Vista previa si es imagen */}
                    {g.cedulaFile.type.startsWith("image/") && (
                      <img
                        src={URL.createObjectURL(g.cedulaFile)}
                        alt="Cedula Preview"
                        className="img-fluid rounded border"
                        style={{ maxWidth: "180px" }}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-danger">No se ha subido ningún archivo</p>
                )}
              </div>
              </Col>
              </Row>
              
            </div>
          ))}
          
        </Card.Body>
      </Card>

      {/* ================================
          DATOS DE FACTURACIÓN
      ================================= */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Datos de Facturación</h5>
            <p><strong>Razón Social:</strong> {billing.nombre || responsible.nombres}</p>
       
          <p><strong>RUC / Cédula:</strong> {billing.cedula || responsible.cedula}</p>
          <p><strong>Dirección:</strong> {billing.direccion || responsible.ciudad}</p>
          <p><strong>Correo:</strong> {billing.correo || responsible.correo}</p>
          <p><strong>Teléfono:</strong> {billing.telefono || responsible.telefono}</p>
        </Card.Body>
      </Card>

      {/* ================================
          TOTAL
      ================================= */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="fw-bold mb-3">Total a pagar</h5>

          <p className="fs-4 fw-bold text-success">
            ${totalPrice.toFixed(2)}
          </p>

          {includeTransport && (
            <p className="text-info">
              Incluye transporte seleccionado en SuiteDetail.
            </p>
          )}
        </Card.Body>
      </Card>

      {/* ================================
          BOTONES
      ================================= */}
      <div className="mt-4">
        <Button variant="secondary" onClick={onBack}>
          Atrás
        </Button>

        {/* <Button
          variant="primary"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Procesando..." : "Confirmar Reserva"}
        </Button> */}
        <div style={{ 
          marginTop:"20px",
          minHeight: "200px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"

         }}>
          <div style={{width:"300px"}}>
            <PayPalButton
            reservaId={data.reservationId}
            monto={totalPrice}
            onSuccess={handlePayPalSuccess}
          />
          </div>
          
        </div>
      </div>
    </div>
  );
}
