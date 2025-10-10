import React, { useState, useEffect } from "react";
import { Tabs, Tab, Table, Button, Form, Badge } from "react-bootstrap";
import axios from "axios";
import {useAuth} from './AuthContext' 
import { useNavigate } from "react-router-dom";
import AdminReservas from "./AdminReservas";
import { Collection } from "react-bootstrap-icons";

const AdminSuites = () => {
  const {user} = useAuth();
  const token = localStorage.getItem("token")

  const navigate = useNavigate();
  const [key, setKey] = useState("list");

  const [suites, setSuites] = useState([]);
  const [editingSuite, setEditingSuite] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [descripcion_pequena, setDescripcionPequena] = useState("");
  const [zona_estrategica, setZonaEstrategica] = useState("");
  const [desc_movilidad, setDescMovilidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [max_capacity, setMaxCapacity] = useState("");
  const [habilitada, setHabilitada] = useState(true);
  const [latitud, setLatitud]=useState("");
  const [longitud, setLongitud]= useState("")

  const [existingComodidades, setExistingComodidades] = useState([]);
  const [availableComodidades, setAvailableComodidades] = useState([]);
  const [selectedComodidades, setSelectedComodidades] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  }
  useEffect(() => {
    fetchSuites();
    fetchAvailableComodidades();
  }, []);

  const fetchSuites = async () => {
    try {
      const res = await axios.get("http://localhost:5000/suites");

      console.log("Suites desde backend:", res.data); // <-- Mira qué trae habilitada
    setSuites(res.data);

    } catch (error) {
      console.error(error);
    }
  };

  const fetchAvailableComodidades = async () => {
    try {
      const res = await axios.get("http://localhost:5000/comodidades");
      setAvailableComodidades(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuiteComodidades = async (suiteId) => {
    try {
      const res = await axios.get(`http://localhost:5000/suites/${suiteId}/comodidades`);
      setExistingComodidades(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingSuite(null);
    setNombre("");
    setDescripcion("");
    setDescripcionPequena("");
    setZonaEstrategica("");
    setDescMovilidad("");
    setPrecio("");
    setMaxCapacity("");
    setHabilitada(true);
    setLatitud("");
    setLongitud("");
    setExistingComodidades([]);
    setSelectedComodidades([]);
    setExistingImages([]);
    setNewImages([]);
    setKey("list"); // vuelve a la lista de suites
  };

  const handleEdit = (suite) => {
    setEditingSuite(suite);
    setNombre(suite.nombre);
    setDescripcion(suite.descripcion);
    setDescripcionPequena(suite.descripcion_pequena);
    setZonaEstrategica(suite.zona_estrategica);
    setDescMovilidad(suite.desc_movilidad);
    setPrecio(suite.precio);
    setMaxCapacity(suite.max_capacity);
    setHabilitada(suite.habilitada === true || suite.habilitada === "true" || suite.habilitada === 1);
    setLatitud(suite.latitud || "");
    setLongitud(suite.longitud || "");
    setExistingImages(suite.images || []);
    fetchSuiteComodidades(suite.id);
    setSelectedComodidades([]);
    setKey("form"); // cambiar a la pestaña de formulario
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageId) => {
    if (!editingSuite || !imageId) return;
    if (!window.confirm("¿Eliminar esta imagen?")) return;
    try {
      await axios.delete(`http://localhost:5000/suites/${editingSuite.id}/images/${imageId}`, axiosConfig);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error(error);
      alert("Error eliminando imagen");
    }
  };

  const handleAddComodidad = async (comodidadId) => {
    if (!editingSuite || !comodidadId) return;
    try {
      await axios.post(`http://localhost:5000/suites/${editingSuite.id}/comodidades`, { comodidad_id: comodidadId }, axiosConfig);
      const added = availableComodidades.find(c => c.id === comodidadId);
      setExistingComodidades(prev => [...prev, added]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComodidad = async (comodidadId) => {
    if (!editingSuite || !comodidadId) return;
    if (!window.confirm("¿Eliminar esta comodidad?")) return;
    try {
      await axios.delete(`http://localhost:5000/suites/${editingSuite.id}/comodidades/${comodidadId}`, axiosConfig);
      setExistingComodidades(prev => prev.filter(c => c.id !== comodidadId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("descripcion_pequena", descripcion_pequena);
    formData.append("zona_estrategica", zona_estrategica);
    formData.append("desc_movilidad", desc_movilidad);
    formData.append("precio", precio);
    formData.append("max_capacity", max_capacity);
    formData.append("habilitada", habilitada);
    formData.append("latitud", latitud);
    formData.append("longitud", longitud);

    newImages.forEach(img => formData.append("images", img));
    selectedComodidades.forEach(id => formData.append("comodidades[]", id));

    try {
      let response;
      if (editingSuite) {
        response = await axios.put(`http://localhost:5000/suites/${editingSuite.id}`, formData, {
           ...axiosConfig, headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" }
        });
      } else {
        response = await axios.post("http://localhost:5000/suites", formData, {
           ...axiosConfig, headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" }
        });
      }
      alert(response.data.message);
      resetForm();
      fetchSuites();
    } catch (error) {
      console.error(error);
      alert("Error al guardar suite");
    }
  };

  const handleDeleteSuite = async (suiteId) => {
    if (!window.confirm("¿Eliminar suite?")) return;
    try {
      await axios.delete(`http://localhost:5000/suites/${suiteId}`, axiosConfig);
      setSuites(prev => prev.filter(s => s.id !== suiteId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <Tabs
        id="admin-suites-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="list" title="Lista de Suites">
          <Table className="table table-striped" bordered hover responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Capacidad</th>
                <th>Habilitada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suites.map(suite => (
                <tr key={suite.id}>
                  <td>{suite.nombre}</td>
                  <td>${suite.precio}</td>
                  <td>{suite.max_capacity}</td>
<td>
          {suite.habilitada ? (
            <span className="badge bg-success">Habilitada</span>
          ) : (
            <span className="badge bg-secondary">Deshabilitada</span>
          )}
        </td>                  <td>
                    <Button className="btn2" size="sm" variant="warning" onClick={() => handleEdit(suite)}>Editar</Button>{" "}
                    <Button size="sm" variant="danger"  className="btn-delete ms-2" onClick={() => handleDeleteSuite(suite.id)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="form" title={editingSuite ? "Editar Suite" : "Nueva Suite"}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción pequeña</Form.Label>
              <Form.Control type="text" value={descripcion_pequena} onChange={(e) => setDescripcionPequena(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Zona estratégica</Form.Label>
              <Form.Control type="text" value={zona_estrategica} onChange={(e) => setZonaEstrategica(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacidad máxima</Form.Label>
              <Form.Control type="number" value={max_capacity} onChange={(e) => setMaxCapacity(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Latitud</Form.Label>
              <Form.Control
                type="number"
                step="any"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
                placeholder="Ej: -0.1807"
              />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Longitud</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  placeholder="Ej: -78.4678"
                />
            </Form.Group>
            {latitud && longitud && (
  <div className="map-container mb-3">
    <iframe
      title="Vista previa ubicación"
      width="100%"
      height="300"
      style={{ border: 0, borderRadius: "10px" }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps?q=${latitud},${longitud}&output=embed`}
    ></iframe>
  </div>
)}


            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Habilitada" checked={habilitada} onChange={(e) => setHabilitada(e.target.checked)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Agregar imágenes</Form.Label>
              <Form.Control type="file" multiple onChange={handleImageChange} />
            </Form.Group>

            {existingImages.length > 0 && (
  <div className="d-flex flex-wrap gap-2 mb-3">
    {existingImages.map((img) => {
      let imageUrl = img.image_url;

      // Si la imagen es de Dropbox, convertirla a formato raw
      if (imageUrl.includes("dropbox.com")) {
        imageUrl = imageUrl.replace(/dl=0|dl=1/, "raw=1");
      } else {
        // Si es local, anteponer el backend
        imageUrl = `http://localhost:5000${imageUrl}`;
      }

      return (
        <div key={img.id} className="position-relative">
          <img
            src={imageUrl}
            alt=""
            style={{
              width: "120px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
          <Button
            size="sm"
            variant="outline-danger"
            className="position-absolute top-0 end-0"
            onClick={() => handleDeleteImage(img.id)}
          >
            <i class="bi bi-x-lg"></i>
          </Button>
        </div>
      );
    })}
  </div>
)}


            {editingSuite && existingComodidades.length > 0 && (
              <div className="mb-3">
                <h5>Comodidades actuales</h5>
                {existingComodidades.map(c => (
                  <Badge
  key={c.id}
  bg="info"
  className="me-2 mb-2 d-inline-flex align-items-center"
>
  {c.nombre}
  <button
    onClick={() => handleDeleteComodidad(c.id)}
    className="ms-2 text-danger border-0 bg-transparent p-0"
    title="Eliminar comodidad"
    variant="outline-danger"
  >
    <i className="bi bi-trash-fill" style={{ fontSize: "1rem" }}></i>
  </button>
</Badge>
                ))}

                <h5><i class="bi bi-plus-lg"></i> Agregar comodidad</h5>
                {availableComodidades.filter(c => !existingComodidades.some(ec => ec.id === c.id)).map(c => (
                  <Button key={c.id} size="sm" variant="secondary" className="me-2 mb-2 btn2" onClick={() => handleAddComodidad(c.id)}>{c.nombre}</Button>
                ))}
              </div>
            )}

            {!editingSuite && availableComodidades.length > 0 && (
              <div className="mb-3">
                <h5>Seleccionar comodidades</h5>
                {availableComodidades.map(c => (
                  <Form.Check key={c.id} type="checkbox" label={c.nombre} checked={selectedComodidades.includes(c.id)} onChange={(e) => {
                    if (e.target.checked) setSelectedComodidades(prev => [...prev, c.id]);
                    else setSelectedComodidades(prev => prev.filter(id => id !== c.id));
                  }} />
                ))}
              </div>
            )}

            <Button type="submit" variant="primary">{editingSuite ? "Actualizar" : "Guardar"}</Button>{" "}
            {editingSuite && <Button variant="secondary" onClick={resetForm}>Cancelar</Button>}
          </Form>
        </Tab>
        <Tab eventKey="reservas" title="Reservas">
        <AdminReservas />
      </Tab>
      </Tabs>
    </div>
  );
};

export default AdminSuites;
