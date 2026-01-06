import { Button, Navbar, Container, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import IconButton from "../IconButton";
const AdminLayout = ({ children }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/admin/login";
  };

  const goToHome = () => {
    window.open("/", "_blank");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Panel de Administración</Navbar.Brand>
          <Nav className="ms-auto">
            <IconButton
            icon="bi bi-house me-1"
            variant="outline-light"
            size="md"
            className="btn2"
            tooltip="Ver Página principal"
            onClick={goToHome}
            />
            <IconButton
            icon="bi bi-box-arrow-right me-1"
            variant="outline-danger"
            size="md"
            tooltip="Cerrar Sesión"
            className="btn-delete"
            onClick={handleLogout}
            />
          </Nav>
        </Container>
      </Navbar>
      <div className="container">{children}</div>
    </>
  );
};

export default AdminLayout;
