import { Modal, Button } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";

export default function ConfirmBeforePayModal({ show, onClose, onConfirm }) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Body className="text-center p-4">
        <div
          style={{
            fontSize: "48px",
            color: "#f5a623",
            marginBottom: "15px",
          }}
        >
          <ExclamationTriangleFill />
        </div>

        <h5 className="fw-bold mb-3">Antes de continuar</h5>

        <p className="text-muted mb-3" style={{ lineHeight: "1.5" }}>
          Al confirmar, serás redirigido al formulario final.
          <br />
          <strong>Dispondrás de 10 minutos</strong> para completarlo.
        </p>

        <p className="text-danger fw-semibold mb-4">
          Si no completas el formulario a tiempo,
          <br />
          la reserva se cancelará automáticamente.
        </p>

        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={onConfirm}>
            Continuar
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
