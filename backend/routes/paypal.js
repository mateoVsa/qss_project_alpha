const express = require("express");
const axios = require("axios");
const pool = require("../db");

const router = express.Router();

const PAYPAL_API = process.env.PAYPAL_API;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;

const { sendReservationConfirmation, sendAdminReservationNotification } = require("../services/emailService");

console.log("PAYPAL_API:", PAYPAL_API);
console.log("CLIENT_ID:", CLIENT_ID ? "OK" : "MISSING");
console.log("SECRET:", SECRET ? "OK" : "MISSING");


// Obtener token de acceso de PayPal
async function getPayPalAccessToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  const { data } = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    params,
    {
      auth: {
        username: CLIENT_ID,
        password: SECRET
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }
  );

  return data.access_token;
}

// ==========================
//    /paypal/create-order
// ==========================
router.post("/create-order", async (req, res) => {
  try {
    console.log("BODY recibido en /create-order:", req.body);

    const { reservaId, monto } = req.body;

    if (!reservaId || !monto) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const reservaResult = await pool.query(
      "SELECT status FROM reservas WHERE id = $1",
      [reservaId]
    );

    if(!reservaResult.rows.length){
      return res.status(404).json({error: "Reserva no encontrada"})
    }



    const estadoReserva = reservaResult.rows[0].status;
    

    if(estadoReserva ==="confirmada"){
      return res.status(400).json({
        error: "Esta reserva ya fue pagada. No se puede generar otro cobro"
      });
    }

    const pagoPendiente = await pool.query(
       `
      SELECT id FROM pagos
      WHERE reserva_id = $1
      AND estado = 'pendiente'
      `,
      [reservaId]
    );

    if(pagoPendiente.rows.length > 0){
      return res.status(400).json({
        error: "Ya existe un pago pendiente para esta reserva"
      })
    }
    
    const accessToken = await getPayPalAccessToken();
    const amount = Number(monto);
    if(isNaN(monto)){
      return res.status(400).json({error: "El monto es invalido"})
    }
    console.log("Creando orden con amount:", amount);
console.log("Token de PayPal OK");
console.log("URL:", `${PAYPAL_API}/v2/checkout/orders`);

    const { data } = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2)
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const paypalOrderId = data.id;

    await pool.query(
      `INSERT INTO pagos (reserva_id, paypal_order_id, monto, estado)
       VALUES ($1, $2, $3, 'pendiente')`,
      [reservaId, paypalOrderId, monto]
    );

    res.json({ orderID: paypalOrderId });
    console.log("Monto recibido:", monto, typeof monto);

  } catch (error) {
    console.error("ERROR /create-order (detalle backend):");
console.log("Status:", error.response?.status);
console.log("Data:", error.response?.data);
console.log("Message:", error.message);

    res.status(500).json({ error: "Error creando la orden" });
  }
});


// ==========================
//    /paypal/capture-order
// ==========================
router.post("/capture-order", async (req, res) => {
  try {
    const { orderID, reservaId } = req.body;
    
    if (!orderID || !reservaId) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }
    //Consultamos primero en la BD, si ya esta estado = "confirmada"
    const pagoResult = await pool.query(
      `
      SELECT estado, paypal_payment_id
      FROM pagos
      WHERE paypal_order_id = $1
      `,[orderID]
    )
    if(!pagoResult.rows.length){
      return res.status(400).json({
        error:"Orden de pago no encontrada"
      })
    }

    if(pagoResult.rows[0].estado ==="completado"){
      return res.json({
        success: true,
        message: "Pago ya capturado anteriormente",
        paypal_payment_id: pagoResult.rows[0].paypal_payment_id
      })
    }
    const accessToken = await getPayPalAccessToken();

    const { data: captureData } = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (captureData?.status !== "COMPLETED") {
      return res.status(400).json({
        error: "PayPal no confirmó el pago",
        paypalStatus: captureData?.status
      });
    }

    const purchaseUnit = captureData.purchase_units[0];
    const payment = purchaseUnit?.payments?.captures[0];
    const paypalPaymentId = payment?.id;
    const monto = payment?.amount?.value;

    const reservaQuery = await pool.query(
      `
      SELECT 
        r.start_date,
        r.end_date,
        s.id AS suite_id,
        s.nombre AS suite_nombre,
        s.latitud,
        s.longitud
      FROM reservas r
      JOIN suites s ON r.suite_id = s.id
      WHERE r.id = $1
      `,
      [reservaId]
    );

    const reserva = reservaQuery.rows[0];
    
    if(!reservaQuery.rows.length){
      return res.status(404).json({error:"Reserva no encontrada"})
    }

    const imagesQuery = await pool.query(
      `
      SELECT image_url
      FROM suite_images
      WHERE suite_id = $1
      `,
      [reserva.suite_id]
    );

    const snapshot = {
      reserva_id: reservaId,
      numero_reserva: `# ${reservaId}`,
      suite: {
        id: reserva.suite_id,
        nombre: reserva.suite_nombre,
        imagenes: imagesQuery.rows.map(img => img.image_url),
        ubicacion: {
          latitud: reserva.latitud,
          longitud: reserva.longitud
        }
      },
      fechas: {
        check_in: reserva.start_date,
        check_out: reserva.end_date,
        check_in_hora: "15:00",
        check_out_hora: "12:00"
      },
      pago: {
        total: monto,
        moneda: "USD",
        paypal_payment_id: paypalPaymentId,
        fecha_pago: new Date().toISOString()
      }
    };


    await pool.query(
      `
      UPDATE pagos 
      SET estado = 'completado',
          paypal_payment_id = $1,
          raw_response = $2
      WHERE paypal_order_id = $3
      `,
      [paypalPaymentId, JSON.stringify(captureData), orderID]
    );

    await pool.query(
      `
      UPDATE reservas
      SET status = 'confirmada',
          confirmed_at = NOW(),
          total_pagado = $1,
          snapshot = $2
      WHERE id = $3
      `,
      [monto,snapshot, reservaId]
    );

    const emailResult = await pool.query(
  `
  SELECT u.email
  FROM reservas r
  JOIN users u ON r.user_id = u.id
  WHERE r.id = $1
  `,
  [reservaId]
);

const correoCliente = emailResult.rows[0]?.email;

// 📧 Enviar email de confirmación (NO bloqueante)
if (correoCliente) {
  try {
    await sendReservationConfirmation({
      to: correoCliente,
      snapshot
    });
    
    await sendAdminReservationNotification(snapshot);

    console.log("📨 Email de confirmación enviado a:", correoCliente);
  } catch (emailError) {
    console.error("❌ Error enviando email:", emailError.message);
    // NO lanzar error — el pago ya fue exitoso
  }
}


    res.json({
      success: true,
      message: "Pago capturado, reserva confirmada y snapshot guardado", reservaId,
      email: correoCliente,
      paypal: captureData
    });

  } catch (error) {
    console.error("Error en capture-order:", error.response?.data || error);
    res.status(500).json({ error: "Error capturando el pago" });
  }
});

module.exports = router;
