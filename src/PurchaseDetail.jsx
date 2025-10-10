import { useLocation } from "react-router-dom";
import { useEffect, useState,useRef } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Modal } from 'react-bootstrap';
import Login from './login';
  const PurchaseDetail = () => {
  const location = useLocation();
  const { suite, people, startDate, endDate, extraBeds, totalPrice, includeTransport } = location.state || {};
  const [coupon, setCoupon] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState([]);
  const [tempReservationId, setTempReservationId] = useState(null);
  const [reservationCreated, setReservationCreated] = useState(false);
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [timeLeft,setTimeLeft] = useState(10*60);
  
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  //Nuevo estado para controlar el modo resumen
  const [isConfirmed,setIsConfirmed] = useState(false);

const handleTimeoutConfirm = () => {
  setShowTimeoutModal(false);
  navigate("/"); // o la ruta real a tu SuitesPage.jsx
};
//Recuperar datos
//modal para iniciar sesion
const handleOpenLoginModal = () => setShowLoginModal(true);
const handleCloseLoginModal = () => setShowLoginModal(false);

useEffect(() => {
  const stored = localStorage.getItem("tempReservation");
  if (stored) {
    const { id, createdAt } = JSON.parse(stored);
    const elapsedSeconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    const remaining = 10 * 60 - elapsedSeconds;
    if (remaining > 0) {
      setTempReservationId(id);
      setReservationCreated(true);
      setTimeLeft(remaining);
    } else {
      localStorage.removeItem("tempReservation");
    }
  }
}, []);

  //Useefect para el contador
useEffect(() => {
  return () => {
    if (timerId.current) clearTimeout(timerId.current);
  };
}, []);

  useEffect(()=>{
    if(!reservationCreated) return;

    const interval = setInterval(()=>{
      setTimeLeft((prev)=>{
        if(prev<=1){
          clearInterval(interval);
          setShowTimeoutModal(true);
          return 0;
        }
        return prev -1;
      });
    },1000);
    return () => clearInterval(interval)
  },[reservationCreated]);

  //funcion para formatear el time

  const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};
  
  const createTempReservation = async () => {
    try {
      const res = await axios.post("http://localhost:5000/reservas/temporal", {
        suite_id: suite.id,
        start_date:startDate,
        end_date:endDate,
        personas:people,
        total_pagado:totalPrice * (1 - discountApplied / 100),
        transporte: includeTransport,


      });
      console.log("Respuesta reserva temporal:", res.data);
      if (res.data.success) {
        setTempReservationId(res.data.reservationId);
        localStorage.setItem("tempReservation", JSON.stringify({
  id: res.data.reservationId,
  createdAt: new Date().toISOString()
}));

        setReservationCreated(true);
        console.log("Reserva temporal creada con ID:", res.data.reservationId);
      }
    } catch (error) {
      console.error("Error al crear la reserva temporal:", error);
    }
  };

 

 const timerId = useRef(null);
useEffect(() => {
  if (tempReservationId) {
    const timer = setTimeout(async () => {
      try {
        await axios.delete(`http://localhost:5000/reservas/temporal/${tempReservationId}`);
        console.log("Reserva temporal cancelada por tiempo excedido");
        alert("Tu reserva fue cancelada por inactividad. Intenta reservar de nuevo.");
        window.location.href = "/";
        localStorage.removeItem("tempReservation");

      } catch (error) {
        console.error("Error al cancelar reserva temporal:", error);
      }
    }, 10 * 60 * 1000); // 10 minutos

   
    timerId.current = timer;


    return () => clearTimeout(timer);
  }
}, [tempReservationId]);
  const handleInputChange = (index, e) => {
    const { name, type, files, value } = e.target;
    setFormData((prev) => {
      const updated = [...prev];
      updated[index]={
        ...updated[index],
        [name]: type == "file" ? files?.[0] ?? null : value,
      };
      return updated;
    });
  };

  const getDifferenceInDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const diasReserva = getDifferenceInDays(startDate, endDate);

  const handleApplyCoupon = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/coupons/validate", { code: coupon });
      if (res.data.valid) {
        setDiscountApplied(res.data.discount);
        setDiscountMessage(`Cupón aplicado: ${res.data.discount}% de descuento`);
      } else {
        setDiscountMessage("Cupón inválido o expirado");
      }
    } catch (error) {
      setDiscountMessage("Error al validar el cupón");
    }
  };
//seguridad
//funcion para la seguridad
function validateGuestForm(form, index) {
  const errors = [];

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  const cedulaRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9\s\-\+\(\)]{7,20}$/;

  if (!nameRegex.test(form.nombres)) {
    errors.push("Nombre inválido.");
  }

  if (!nameRegex.test(form.apellidos)) {
    errors.push("Apellido inválido.");
  }
  if (includeTransport &&index === 0 && !form.horaLlegada) {
  errors.push("Debe indicar la hora de llegada al aeropuerto.");
}
  // if (!cedulaRegex.test(form.cedula)) {
  //   errors.push("Cédula inválida.");
  // }
  if(index ===0) {
    if (!emailRegex.test(form.correo)) {
    errors.push("Correo inválido.");
  }
  if (form.telefono && !phoneRegex.test(form.telefono)) {
    errors.push("Teléfono inválido.");
  }

  if (form.telefonoEmergencia && !phoneRegex.test(form.telefonoEmergencia)) {
    errors.push("Teléfono de emergencia inválido.");
  }
  if (!form.parentesco) {
      errors.push("Debe seleccionar un parentesco.");
    }
    if (!form.motivo) {
      errors.push("Debe seleccionar un motivo de visita.");
    }
    if (!form.detalleMotivo || form.detalleMotivo.trim().length < 5) {
      errors.push("Debe detallar el motivo con al menos 5 caracteres.");
    }
  }
  

  

  // Validar edad mínima (por ejemplo 12 años)
  const nacimiento = new Date(form.fechaNacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (isNaN(nacimiento) || edad < 0 || edad > 120) {
    errors.push("Fecha de nacimiento inválida.");
  } else if (
    edad < 12 ||
    (edad === 12 && hoy.getMonth() < nacimiento.getMonth()) ||
    (edad === 12 && hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
  ) {
    errors.push("Debe tener al menos 12 años.");
  }

  return errors;
}
//funcion para manejar los formularios
  const handleSubmitForm = (e) => {
  e.preventDefault();

  // 1. Verificar que todos los campos estén completos (no vacíos)
  const allFilled = formData.every((form) => {
    return Object.entries(form).every(([key, value]) => {
    if (typeof value === "string") {
      return value.trim() !== "";
    } else if (value instanceof File) {
      return value && value.size > 0; // archivo presente y con contenido
    }
    return value !== null && value !== undefined;
  });
});

  // 2. Validar cada formulario con validateGuestForm y recopilar errores
  const errorForms = formData
    .map((form, index) => ({ index, errors: validateGuestForm(form,index) }))
    .filter(({ errors }) => errors.length > 0);

  if (errorForms.length > 0) {
    // Crear mensaje con errores detallados
    const errorMessages = errorForms
      .map(
        ({ index, errors }) =>
          `Formulario #${index + 1}:\n- ${errors.join("\n- ")}`
      )
      .join("\n\n");

    alert(`Errores encontrados:\n${errorMessages}`);
    return;
  }

  // 3. Si todo está bien, marcar formulario como completado
  setFormCompleted(true);
  setIsConfirmed(true);
};


//seguridad para los formularios



  if (!suite) return <p className="text-center mt-5">No se encontraron datos de la suite.</p>;

  return (
    <div className="container admin-con mt-5">
      <div className="row g-4">
        {/* Detalle suite */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-lg p-4 h-100">
            <h4 className="fw-bold mb-3 text-center">Detalle de tu reserva</h4>
            <hr className="custom-line3" />
            <p><i className="bi bi-house-fill text-secondary me-2"></i><strong>Suite:</strong> {suite.nombre}</p>
            <p><i className="bi bi-people-fill text-secondary me-2"></i><strong>Personas:</strong> {people}</p>
            <p><i className="bi bi-calendar-event-fill text-secondary me-2"></i><strong>Entrada:</strong> {new Date(startDate).toLocaleDateString()}</p>
            <p><i className="bi bi-calendar-check-fill text-secondary me-2"></i><strong>Salida:</strong> {new Date(endDate).toLocaleDateString()}</p>
            <p><i className="bi bi-clock-fill text-secondary me-2"></i><strong>Check-in:</strong>  3:00 PM  — <strong>Check-out:</strong> 12:00 PM <small>(hora Ecuador)</small></p>
            <p><i className="bi bi-plus-square-fill text-secondary me-2"></i><strong>Colchones extra:</strong> {extraBeds}</p>
             <p className="text-muted mt-3" style={{ fontSize: "0.9rem" }}>
              Ten en cuenta los horarios de check-in y check-out al reservar la suite{""}
  
              .
            </p>
          </div>
        </div>

        {/* Resumen de pago */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-lg p-4 h-100">
            <h4 className="fw-bold mb-3 text-center">Resumen de pago</h4>
            <hr className="custom-line3" />
        
            <p><strong>Días de reserva:</strong> {diasReserva}</p>
            <p><strong>Precio por noche:</strong> ${totalPrice / diasReserva}</p>
            <p><strong>Subtotal:</strong> ${totalPrice.toFixed(2)}</p>

            {diasReserva > 3 && (
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "300px" }}
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Ingresa tu cupón"
                  />
                  <button className="btn new-item btn-outline-primary" onClick={handleApplyCoupon}>
                    Aplicar
                  </button>
                </div>
                {discountMessage && <small className="text-muted">{discountMessage}</small>}
              </div>
            )}

            <hr />
            <h5 className="fw-bold text-end">
              Total: <span className="text-success">
                ${(totalPrice * (1 - discountApplied / 100)).toFixed(2)}
              </span>
            </h5>

            <div className="d-grid mt-3">
            
             {!user ? (
  <p className="text-danger text-center mt-3">
  Debes <button className="btn btn-link p-0" onClick={handleOpenLoginModal}>iniciar sesión</button> para continuar con la reserva.
</p>

) : (
  !showForm && (
    <button
      className="btn btn-lg btn-success shadow-sm"
      onClick={async () => {
        if (!reservationCreated) {
          await createTempReservation();
        }
        const initialData = Array.from({ length: people }, (_, i) => {
  if (i === 0) {
    // Responsable
    return {
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
      cedula: "",
      correo: "",
      telefono: "",
      parentesco: "",
      telefonoEmergencia: "",
      motivo: "",
      detalleMotivo: "",
    };
  } else {
    // Otros huéspedes
    return {
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
      cedula: "",
    };
  }
});
        setFormData(initialData);
        setShowForm(true);
      }}
    >
      <i className="bi bi-credit-card-fill me-2"></i> Proceder al pago
    </button>
  )
)}
            </div>

            <p className="text-muted mt-3" style={{ fontSize: "0.9rem" }}>
              ¿Tienes dudas sobre el precio total de la suite?{" "}
              <a
                href="https://wa.me/593991633631?text=¡Hola! Estoy interesad@ en más información sobre las suites que ofertan."
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#25D366", textDecoration: "underline" }}
              >
                Contáctanos por WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      {showTimeoutModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2 className="mb-3 text-danger">¡Reserva expirada!</h2>
      <p>Tu tiempo de reserva ha terminado. Por favor, vuelve a seleccionar tu suite.</p>
      <button className="btn btn-primary mt-3" onClick={handleTimeoutConfirm}>
        Aceptar
      </button>
    </div>
  </div>
)}



      {/* Formulario */}
{showForm && !isConfirmed && (
  <>
    <hr className="custom-line3" />
    <h5 className="fw-bold mb-3">Datos de los huéspedes</h5>
    {reservationCreated && (
      <p className="text-danger text-center fw-bold">
        Tiempo restante para completar la reserva: {formatTime(timeLeft)}
      </p>
    )}

    <form onSubmit={handleSubmitForm}>
      {formData.map((data, index) => {
        const isResponsable = index === 0;

        // Campos para el responsable
        const fields = isResponsable
          ? [
              ["nombres", "Nombres", "text"],
              ["apellidos", "Apellidos", "text"],
              ["fechaNacimiento", "Fecha de nacimiento", "date"],
              ["cedula", "Documento de identidad", "file"],
              ["correo", "Correo electrónico", "email"],
              ["telefono", "Teléfono", "tel"],
              ["telefonoEmergencia", "Teléfono de emergencia", "tel"],
            ]
          : [
              ["nombres", "Nombres", "text"],
              ["apellidos", "Apellidos", "text"],
              ["fechaNacimiento", "Fecha de nacimiento", "date"],
              ["cedula", "Documento de identidad", "file"],
            ];

        return (
          <div key={index} className="mb-4 border p-3 rounded shadow-sm">
            <h6 className="fw-bold">
              {isResponsable ? `Huésped ${index+1}` : `Huésped ${index + 1}`}
            </h6>

            <div className="row">
              {/* Campos comunes */}
              {fields.map(([name, label, type]) => (
                <div key={name} className="col-md-6 mb-3">
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-control"
                    name={name}
                    value={type === "file" ? undefined : data[name] || ""}
                    onChange={(e) => handleInputChange(index, e)}
                    autoComplete="off"
                    required
                  />
                </div>
              ))}

              {/* Campos extra SOLO para el responsable */}
              {isResponsable && (
                <>
                  {/* form para parentesco*/}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Parentesco</label>
                    <select
                      className="form-control"
                      name="parentesco"
                      value={data.parentesco || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="Padre/Madre">Padre/Madre</option>
                      <option value="Hijo/Hija">Hijo/Hija</option>
                      <option value="Hermano/Hermana">Hermano/Hermana</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                                
                  {/* Motivo */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Motivo de visita</label>
                    <select
                      className="form-control"
                      name="motivo"
                      value={data.motivo || ""}
                      onChange={(e) => handleInputChange(index, e)}
                      required
                    >
                      <option value="">Seleccione...</option>
                      <option value="Vacaciones">Vacaciones</option>
                      <option value="Salud">Salud</option>
                      <option value="Estudios">Estudios</option>
                      <option value="Laboral">Laboral</option>
                    </select>
                  </div>

                  {/* Detalle del motivo (solo si hay motivo) */}
                  {data.motivo && (
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Detalle del motivo</label>
                      <textarea
                        className="form-control"
                        name="detalleMotivo"
                        value={data.detalleMotivo || ""}
                        onChange={(e) => handleInputChange(index, e)}
                        placeholder="Escriba más detalles..."
                        required
                      ></textarea>
                    </div>
                  )}
                </>
              )}
              {isResponsable && includeTransport && (
  <div className="col-md-6 mb-3">
    <label className="form-label">Hora de llegada al aeropuerto</label>
    <input
      type="time"
      className="form-control"
      name="horaLlegada"
      value={data.horaLlegada || ""}
      onChange={(e) => handleInputChange(index, e)}
      required
    />
  </div>
)}
            </div>
          </div>
        );
      })}

      <div className="d-grid mt-3">
        <button type="submit" className="btn btn-primary">
          Confirmar datos
        </button>
      </div>
    </form>
  </>
)}

{showForm && isConfirmed && (
  <div className="mt-4">
    <h5 className="fw-bold mb-3">Datos confirmados</h5>
    <p className="text-muted">Revisa que la información este correcta antes de pagar.</p>
    {formData.map((guest, index)=>(
      <div key={index} className="mb-3 border p-3 rounded bg-light">
        <h6 className="fw-bold">Huésped {index +1}</h6>
        {Object.entries(guest).map(([key,value])=>(
          <p key={key} className="mb-1">
            <strong>{key}:</strong>{""}
            {value instanceof File ? value.name : value}
          </p>
        ))}
        </div>
    ))}
    <div className="d-flex gap-2">
      <button
      className="btn btn-warning"
      onClick={()=>setIsConfirmed(false)}
      >Editar Datos</button>
      {/* <button
      className="btn btn-success"
      onClick={()=>{
        alert("Redirigiendo al flujo de pago ..")
      }}>Completar Pago</button> */}
    </div>
    </div>
)}


      {/* Botón final de pago */}
      {formCompleted && (
        <>
          <hr className="custom-line3" />
          <div className="text-end">
            <h4 className="fw-bold">
              Total: <span className="text-success">${(totalPrice * (1 - discountApplied / 100)).toFixed(2)}</span>
            </h4>
          </div>
          <div className="d-grid mt-3">

            <button className="btn btn-lg btn-success shadow-sm"
  onClick={async () => {
    //evitar multiples clicks
    if(isSubmitting) return;
    //aqui comienza el envio
    const token = localStorage.getItem("token");
    if(!token){
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true)
  try {
    if (!tempReservationId) {
      alert("No hay una reserva temporal activa.");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("reservationId", tempReservationId);
    if (coupon) formPayload.append("coupon", coupon);

    formData.forEach((guest, index) => {
      for (const key in guest) {
        const fieldName = `guests[${index}][${key}]`;
        const value = guest[key];

        if (value instanceof File) {
          if (value.size > 0) {
            formPayload.append(fieldName, value);
          } else {
            alert(`El archivo para el huésped #${index + 1} está vacío.`);
            return;
          }
        } else {
          formPayload.append(fieldName, value);
        }
      }
    });
    formPayload.append("transporte", includeTransport ? "true" : "false");
    const responsable = formData[0];
    if(includeTransport && responsable && responsable.horaLlegada){
      formPayload.append("hora_llegada", responsable.horaLlegada);
    }

    const response = await axios.post("http://localhost:5000/api/clientes/confirmar-reserva", formPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    localStorage.removeItem("tempReservation");
    alert("Reserva confirmada exitosamente. Procede al pago real.");
    navigate("/")
    // Puedes redirigir a la pasarela de pago aquí

  } catch (err) {
    if (err.response) {
      console.error("Respuesta del servidor:", err.response.data);
      if(err.response.status === 401){
        setShowLoginModal(true);
        alert("Tu sesión expiró. Por favor inicia sesión nuevamente.");
      }else{
        alert(`Error del servidor: ${err.response.data.message || "Error al confirmar la reserva."}`);
      }
      
    } else {
      console.error("Error al hacer la solicitud:", err);
      alert("Error al confirmar la reserva.");
    }
  }finally{
    setIsSubmitting(false); // finaliza el envio tenga exito o haya algun error
  }
}}
disabled={isSubmitting}
>
  {isSubmitting ? "Procesando..": (
    <>  
    <i className="bi bi-credit-card-fill me-2"></i> Completar el pago
    </>
  )}
  
            </button>
          </div>
        </>
      )}
      
    <Login show={showLoginModal}
  handleClose={handleCloseLoginModal}
   onLoginSuccess={handleCloseLoginModal} />
 

    </div>
  );
};

export default PurchaseDetail;
