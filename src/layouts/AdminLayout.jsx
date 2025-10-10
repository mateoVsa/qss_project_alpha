import { Button, Navbar, Container, Nav, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";

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
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-home">Ver página principal</Tooltip>}
            >
              <Button variant="outline-light" className="btn2 me-2" onClick={goToHome}>
                <i className="bi bi-house me-1"></i>
              </Button>
            </OverlayTrigger>

            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-logout">Cerrar sesión</Tooltip>}
            >
              <Button variant="outline-danger" className="btn-delete" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>
              </Button>
            </OverlayTrigger>
          </Nav>
        </Container>
      </Navbar>
      <div className="container">{children}</div>
    </>
  );
};

export default AdminLayout;
