// src/PurchaseDetail.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Form, Row, Col, Button } from "react-bootstrap";

import { useAuth } from "./AuthContext";
import Login from "./login";
import CountdownBubble from "./CountdownBubble";

import Step1Responsible from "./steps/Step1Responsible";
import Step2Guests from "./steps/Step2Guests";
import Step3Billing from "./steps/Step3Billing";
import Step4Summary from "./steps/Step4Summary";

import ConfirmBeforePayModal from "./modals/ConfirmBeforePayModal";
import API_URL from "./config/api";
export default function PurchaseDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { suite, people = 1, startDate, endDate, colchonesExtra, totalPrice = 0, includeTransport } =
    location.state || {};

  const { user } = useAuth();

  // UI / resumen / cupones
  const [codigoCupon, setCodigoCupon] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState("");
  const [cuponValido, setCuponValido] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reserva temporal + contador
  const [tempReservationId, setTempReservationId] = useState(null);
  const [reservationCreated, setReservationCreated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Multi-step state
  const [step, setStep] = useState(1);
  const [showMultistep, setShowMultistep] = useState(false);

  //Factura manual
  const[wantsInvoice, setWantsInvoice] = useState(null);

  //
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  // Responsable + guests
  const [responsible, setResponsible] = useState({
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    cedula: "", // campo textual (opcional), pero permitimos archivo también
    cedulaFile: null,
    correo: "",
    ciudad: "",
    telefono: "",
    parentesco: "",
    telefonoEmergencia: "",
    motivo: "",
    detalleMotivo: "",
    horaLlegada: "",
  });

  const guestsCount = Math.max(0, (people || 1) - 1);
  const [guests, setGuests] = useState(() =>
    Array.from({ length: guestsCount }, () => ({
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
      cedula: "",
      cedulaFile: null,
    }))
  );

  // Facturación
 const [billingData, setBillingData] = useState({
  nombre: "",
  cedula: "",
  direccion: "",
  telefono: "",
  correo: "",
});

  const [showBillingForm, setShowBillingForm] = useState(false);

  // Documents + other
  const [documents, setDocuments] = useState({}); // opcional por guest si quieres
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login modal
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Utility: dias reserva
  const getDifferenceInDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const diasReserva = getDifferenceInDays(startDate, endDate);


  // ----- Effects: recuperar reserva temporal si existe -----
  useEffect(() => {
    const stored = localStorage.getItem("tempReservation");
    if (!stored) return;
    try {
      const { id, expireAt } = JSON.parse(stored);
      const expireTime = new Date(expireAt).getTime();
      const now = Date.now();
      const diff = Math.floor((expireTime - now) / 1000);
      if (diff > 0) {
        setTempReservationId(id);
        setReservationCreated(true);
        setTimeLeft(diff);
      } else {
        localStorage.removeItem("tempReservation");
      }
    } catch (err) {
      console.warn("tempReservation corrupted", err);
      localStorage.removeItem("tempReservation");
    }
  }, []);

  useEffect(() => {
    if (!reservationCreated) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowTimeoutModal(true);
          localStorage.removeItem("tempReservation");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [reservationCreated]);

  // ----- API helpers -----
  const createTempReservation = async () => {
    try {
      const res = await axios.post(`${API_URL}/reservas/temporal`, {
        suite_id: suite.id,
        start_date: startDate,
        end_date: endDate,
        personas: people,
        total_pagado: totalPrice * (1 - descuento / 100),
        transporte: includeTransport,
        nombre_cliente: user?.name,
        user_id: user.id,
      });
      if (res.data?.success) {
        setTempReservationId(res.data.reservationId);
        localStorage.setItem(
          "tempReservation",
          JSON.stringify({ id: res.data.reservationId, expireAt: res.data.reservation.expires_at })
        );
        setReservationCreated(true);
      } else {
        throw new Error(res.data?.message || "No se pudo crear reserva temporal");
      }
    } catch (err) {
      console.error("createTempReservation error:", err);
      alert("No se pudo crear la reserva temporal. Intenta de nuevo.");
    }
  };

  const validarCupon = async () => {
    if (!codigoCupon.trim()) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/cupones/validar`, { code: codigoCupon });
      if (data.valido) {
        setDescuento(data.porcentaje);
        setCuponValido(true);
        setMensajeCupon(`Cupón aplicado: ${data.porcentaje}% de descuento`);
      } else {
        setDescuento(0);
        setCuponValido(false);
        setMensajeCupon(data.mensaje || "Cupón inválido");
      }
    } catch (err) {
      console.error(err);
      setDescuento(0);
      setCuponValido(false);
      setMensajeCupon("Cupón inválido o ya usado");
    } finally {
      setLoading(false);
    }
  };

  // ----- Validaciones -----
  const validateResponsible = () => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
    if (!nameRegex.test(responsible.nombres || "")) return "Nombre del responsable inválido.";
    if (!nameRegex.test(responsible.apellidos || "")) 
  return "Apellido del responsable inválido.";

    if (!responsible.cedula && !responsible.cedulaFile) return "Documento del responsable requerido (texto o archivo).";
    if (!responsible.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsible.correo || ""))
      return "Correo del responsable inválido.";
    if (includeTransport && !responsible.horaLlegada) return "Si solicitaste transporte debes indicar hora de llegada.";
    // más reglas si las necesitas...
    return null;
  };

  const validateGuests = () => {
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.nombres || g.nombres.trim().length < 2) return `Nombre inválido para huésped #${i + 1}`;
      if (!g.cedula && !g.cedulaFile) return `Documento requerido para huésped #${i + 1}`;
    }
    return null;
  };

  // ----- Start multi-step (llamado por "Confirmar y pagar") -----
  const handleStartMultistep = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!reservationCreated) {
      await createTempReservation();
      // si createTempReservation falla, no abrimos el formulario
      if (!tempReservationId && !localStorage.getItem("tempReservation")) {
        return;
      }
      const stored = localStorage.getItem("tempReservation");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTempReservationId(parsed.id);
      }
    }

    // inicializar responsable con datos del user
    setResponsible((prev) => ({
      ...prev,
      nombres: prev.nombres || user?.name || "",
      correo: prev.correo || user?.email || "",
    }));

    // inicializar guests en caso de que people cambió
    const count = Math.max(0, (people || 1) - 1);
    setGuests((prev) => {
      if (prev.length === count) return prev;
      return Array.from({ length: count }, (_, i) => prev[i] || { nombres: "", apellidos: "", fechaNacimiento: "", cedula: "", cedulaFile: null });
    });

    setShowMultistep(true);
    setStep(1);
  };

  // ----- Handlers de cambio (forms) -----
  const handleResponsibleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setResponsible((p) => ({ ...p, cedulaFile: files?.[0] ?? null }));
      return;
    }
    setResponsible((p) => ({ ...p, [name]: value }));
  };

  const handleGuestChange = (index, e) => {
    const { name, value, files, type } = e.target;
    setGuests((prev) => {
      const updated = [...prev];
      if (!updated[index]) updated[index] = { nombres: "", apellidos: "", fechaNacimiento: "", cedula: "", cedulaFile: null };
      if (type === "file") updated[index].cedulaFile = files?.[0] ?? null;
      else updated[index][name] = value;
      return updated;
    });
  };

  const handleSaveBilling = (b) => {
    setBillingData(b);
    setShowBillingForm(false);
  };

  // ----- Envío final -----
  const handleFinalSubmit = async () => {
    // validaciones
    const respErr = validateResponsible();
    if (respErr) {
      alert(respErr);
      setStep(1);
      return;
    }
    const guestsErr = validateGuests();
    if (guestsErr) {
      alert(guestsErr);
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!tempReservationId) {
        alert("No hay una reserva temporal activa.");
        setIsSubmitting(false);
        return;
      }

      const formPayload = new FormData();
      formPayload.append("reservationId", tempReservationId);
      formPayload.append("codigo_cupon", codigoCupon || "");

      // Montamos los huéspedes como antes: guests[0] = responsable, luego los demás
      const mergedGuests = [responsible, ...guests];

      mergedGuests.forEach((g, index) => {
        for (const key of Object.keys(g)) {
          // tratamos archivos
          const value = g[key];
          // si es cedulaFile manejamos específicamente
          if (key === "cedulaFile") {
            if (value instanceof File && value.size > 0) {
              formPayload.append(`guests[${index}][cedula]`, value);
            }
            continue;
          }
          // omitir campos auxiliares si no queremos enviarlo
          // normal fields
          formPayload.append(`guests[${index}][${key}]`, value ?? "");
        }
      });

      // Billing
      // Billing
if (billingData) {
  formPayload.append("billing_data[nombre]", billingData.nombre || responsible.nombres);
  formPayload.append("billing_data[cedula_ruc]", billingData.cedula || responsible.cedula);
  formPayload.append("billing_data[direccion]", billingData.direccion || responsible.ciudad);
  formPayload.append("billing_data[telefono]", billingData.telefono || responsible.telefono);
  formPayload.append("billing_data[correo]", billingData.correo || responsible.correo);
}


      // Transporte y hora de llegada si aplica
      formPayload.append("transporte", includeTransport ? "true" : "false");
      if (responsible.horaLlegada) formPayload.append("hora_llegada", responsible.horaLlegada);

      // Si cupón válido, marcarlo en backend como usado (igual que hacías)
      if (cuponValido) {
        try {
          await axios.post(`${API_URL}/api/cupones/usar`, { code: codigoCupon });
        } catch (e) {
          console.warn("No se pudo marcar cupón como usado (no crítico)", e);
        }
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/api/clientes/confirmar-reserva`, formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // éxito
      localStorage.removeItem("tempReservation");
     setStep(4);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setShowLoginModal(true);
        alert("Tu sesión expiró. Por favor inicia sesión nuevamente.");
      } else {
        alert(err.response?.data?.message || "Error al confirmar la reserva.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // pequenos helpers de UI
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const iva = (suite.precio *15)/100;
  

  // ------------------------------------
  // ---- Render principal
  // ------------------------------------
  if (!suite) return <p className="text-center mt-5">No se encontraron datos de la suite.</p>;
  if (!people) return <p className="text-center mt-5">Información incompleta de reserva (personas).</p>;

  return (
    <div className="container admin-con mt-5">
      <div className="row g-4">
        {/* Detalle de la suite */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-lg p-4 h-100">
            <h4 className="fw-bold mb-3 text-center">Detalle de tu reserva</h4>
            <hr className="custom-line3" />
            <p><i className="bi bi-house-fill text-secondary me-2"></i><strong>Suite:</strong> {suite.nombre}</p>
            <p><i className="bi bi-people-fill text-secondary me-2"></i><strong>Huéspedes:</strong> {people} personas</p>
            <p><i className="bi bi-calendar-event-fill text-secondary me-2"></i><strong>Entrada:</strong> {new Date(startDate).toLocaleDateString()}</p>
            <p><i className="bi bi-calendar-check-fill text-secondary me-2"></i><strong>Salida:</strong> {new Date(endDate).toLocaleDateString()}</p>
            <p><i className="bi bi-clock-fill text-secondary me-2"></i><strong>Check-in:</strong> 3:00 PM — <strong>Check-out:</strong> 12:00 PM</p>
            <p><i className="bi bi-plus-square-fill text-secondary me-2"></i><strong>Colchones extra:</strong> {colchonesExtra}</p>
            <p className="text-muted mt-3" style={{ fontSize: "0.9rem" }}>Ten en cuenta los horarios de check-in y check-out al reservar la suite.</p>
          </div>
        </div>

        {/* Resumen de pago */}
        <div className="col-12 col-lg-6">
  <div className="card shadow-lg p-4 h-100 rounded-4">

    <h4 className="fw-bold text-center mb-3">Resumen de pago</h4>
    <hr />

    {/* Detalle */}
    <div className="d-flex justify-content-between mb-2">
      <span className="text-muted">Días de estadía</span>
      <strong>{diasReserva}</strong>
    </div>

    <div className="d-flex justify-content-between mb-2">
      <span className="text-muted">Precio por noche</span>
      <span>
        $
        {diasReserva
          ? (((totalPrice) / diasReserva)-iva).toFixed(2)
          : (totalPrice - iva).toFixed(2)}
      </span>
    </div>

    <div className="d-flex justify-content-between mb-2">
      <span className="text-muted">Impuesto local</span>
      <span>${iva.toFixed(2)}</span>
    </div>

    <hr />

    <div className="d-flex justify-content-between mb-2">
      <span className="text-muted">Subtotal</span>
      <span>${totalPrice.toFixed(2)}</span>
    </div>

    {/* CUPÓN */}
    {diasReserva > 3 && (
      <div className="mt-3">
        <label className="form-label fw-semibold">Código promocional</label>
        <div className="d-flex gap-2">
          <input
            className="form-control qss-input"
            value={codigoCupon}
            onChange={(e) => setCodigoCupon(e.target.value)}
            placeholder="Ingresa tu cupón"
            disabled={cuponValido || loading}
          />
          <button
            className="btn btn-outline-primary qss-input"
            onClick={validarCupon}
            disabled={loading || cuponValido}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm qss-input" />
            ) : cuponValido ? "Aplicado" : "Aplicar"}
          </button>
        </div>
        {mensajeCupon && (
          <small className={`d-block mt-1 ${cuponValido ? "text-success" : "text-danger"}`}>
            {mensajeCupon}
          </small>
        )}
      </div>
    )}

    {descuento > 0 && (
      <>
        <hr />
        <div className="d-flex justify-content-between">
          <span className="text-muted">Descuento</span>
          <span className="qss-input">
            - ${(totalPrice * (descuento / 100)).toFixed(2)}
          </span>
        </div>
      </>
    )}

    {/* TOTAL */}
    <div className="bg-light rounded-3 p-3 mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <span className="fw-bold fs-5">Total</span>
        <span className="fw-bold fs-4 text-success">
          ${(totalPrice * (1 - descuento / 100)).toFixed(2)}
        </span>
      </div>
    </div>

    {/* CTA */}
    <div className="d-grid mt-4">
      {!showMultistep && (
        <>
          {!user ? (
            <p className="text-danger text-center">
              Debes{" "}
              <button className="btn btn-link p-0" onClick={() => setShowLoginModal(true)}>
                iniciar sesión
              </button>{" "}
              para continuar con la reservación.
            </p>
          ) : (
            <button
              className="btn btn-success btn-lg rounded-pill"
              onClick={() => setShowConfirmModal(true)}
            >
              <i className="bi bi-lock-fill me-2"></i>
              Confirmar y pagar
            </button>
          )}
        </>
      )}
    </div>

    <p className="text-muted text-center mt-3" style={{ fontSize: "0.85rem" }}>
      ¿Tienes dudas sobre el precio?
      <br />
      <a
        href="https://wa.me/593991633631"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#25D366" }}
      >
        Contáctanos por WhatsApp
      </a>
    </p>
  </div>
</div>

      </div>

      {/* Timeout modal */}
      {showTimeoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-3 text-danger">¡Reserva expirada!</h2>
            <p>Tu tiempo de reserva ha terminado. Por favor, vuelve a seleccionar tu suite.</p>
            <button className="btn btn-primary mt-3" onClick={() => { setShowTimeoutModal(false); navigate("/"); }}>Aceptar</button>
          </div>
        </div>
      )}

      {/* Multi-step area (debajo del resumen) */}
      {showMultistep && (
        <div className="card p-4 mt-4 shadow-sm">
            <div className="progress-wrapper mb-3">
  <div
    className="progress-inner"
    style={{ width: `${(step - 1) / 3 * 100}%` }}
  ></div>
</div>
          <div className="stepper mb-4">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <span className="number">1</span>
          <span>Responsable</span>
        </div>

        <div className="line"></div>

        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <span className="number">2</span>
          <span>Huéspedes</span>
        </div>

        <div className="line"></div>

        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <span className="number">3</span>
          <span>
            Facturación <small className="optional">Opcional</small>
          </span>
        </div>

        <div className="line"></div>

        <div className={`step ${step >= 4 ? "active" : ""}`}>
          <span className="number">4</span>
          <span>Confirmación</span>
        </div>
      </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
           {step === 1 && (
            <div className="step-card">
<Step1Responsible
    data={responsible}
    includeTransport = {includeTransport}
    onChange={(updated) => setResponsible(updated)}
    onNext={() => setStep(2)}
  />
            </div>
  
)}


            {step === 2 && (
              <div className="step-card">
                  <Step2Guests
    data={{
      totalGuests: people,
      guests: guests
    }}
    setData={(newData) => {
      if (newData.totalGuests !== undefined) {
        // si actualizas totalGuests
        setPeople(newData.totalGuests);
      }
      if (newData.guests !== undefined) {
        // si actualizas huéspedes
        setGuests(newData.guests);
      }
    }}
    onNext={() => {
      setStep(3);
    }}
    onBack={() => setStep(1)}
  />
              </div>
  
)}

 {step === 3 && (wantsInvoice === null || wantsInvoice === false) && (
        <div className="step-card">
          <h4>
            ¿Deseas solicitar factura?{" "}
            <span className="optional">(Opcional)</span>
          </h4>
          <p>
            Si necesitas otros datos para la factura ingresa los datos aqui manualmente, de lo 
            contrario, omitiendo la factura sera emitida con los datos del responsable de la reserva.
          </p>

          <div className="button-row mt-3">
            <button
              className="btn btn-primary-stepper"
              onClick={() => setWantsInvoice(true)}
            >
              Sí, ingresar datos de facturación
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setWantsInvoice(false);
                setStep(4);
              }}
            >
              Omitir
            </button>
          </div>
        </div>
      )}
           {step === 3 && wantsInvoice === true && (
            <div className="step-card">
<Step3Billing
    data={billingData}
    setData={setBillingData}
    onNext={() => setStep(4)}
    onBack={() => setStep(2)}
  />
            </div>
  
)}



          {step === 4 && (
            <div className="step-card">
                <Step4Summary
    data={{
      responsible,
      guests,
      billing: billingData,
      totalPrice:totalPrice * (1 - descuento / 100),
      includeTransport,
      reservationId: tempReservationId,
    }}
    suite={suite}
    onBack={() => setStep(3)}
    onConfirm={handleFinalSubmit}
    loading={isSubmitting}
  />
            </div>
  
)}


          </motion.div>
        </div>
      )}

{tempReservationId && (
        <div className="mt-4 d-flex justify-content-center">
          <CountdownBubble timeLeft={timeLeft} />
        </div>
      )}

      {/* Login Modal */}
      <Login
        show={showLoginModal}
        handleClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
      <ConfirmBeforePayModal
  show={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  onConfirm={() => {
    setShowConfirmModal(false);
    handleStartMultistep(); 
  }}
/>

    </div>
  );
}
