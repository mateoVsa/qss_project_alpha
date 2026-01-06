const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

const formatDate = (date) =>
  new Date(date).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

async function sendReservationConfirmation({ to, snapshot }) {
  const { numero_reserva, suite, fechas, pago } = snapshot;

  const imageUrl = suite.imagenes?.[0]
    ? `${process.env.BACKEND_PUBLIC_URL}${suite.imagenes[0]}`
    : null;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color:#2e7d32;">✅ Pago confirmado</h2>

    <p>Tu reserva <strong>${numero_reserva}</strong> ha sido confirmada.</p>

    <hr />

    <h3>${suite.nombre}</h3>

    ${imageUrl ? `
      <img 
        src="${imageUrl}" 
        style="width:100%; border-radius:10px; margin-bottom:10px;"
      />
    ` : ""}

    <p><strong>Check-in:</strong> ${formatDate(fechas.check_in)} a las ${fechas.check_in_hora}</p>
    <p><strong>Check-out:</strong> ${formatDate(fechas.check_out)} a las ${fechas.check_out_hora}</p>

    <p><strong>Total pagado:</strong> $${pago.total} USD</p>

    <hr />

    <p style="font-size:14px;color:#555;">
      Si tienes algún inconveniente, contáctanos por WhatsApp.
    </p>

    <a href="https://wa.me/593999999999"
       style="
         display:inline-block;
         margin-top:10px;
         padding:10px 16px;
         background:#25D366;
         color:white;
         text-decoration:none;
         border-radius:20px;
       ">
       📲 Contactar por WhatsApp
    </a>
  </div>
  `;

  await transporter.sendMail({
    from: `"Quito Smiles Suites" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reserva confirmada • ${numero_reserva}`,
    html
  });
}

async function sendAdminReservationNotification(snapshot) {
  
  const {numero_reserva, suite, fechas, pago} = snapshot;

  const imageUrl = suite.imagenes?.[0]
    ? `${process.env.BACKEND_PUBLIC_URL}${suite.imagenes[0]}`
    : null;

    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2 style="color:#0d47a1;">📢 Nueva reserva confirmada</h2>

    <p><strong>Reserva:</strong> ${numero_reserva}</p>

    <hr />

    <h3>${suite.nombre}</h3>

    ${imageUrl ? `
      <img 
        src="${imageUrl}" 
        style="width:100%; border-radius:10px; margin-bottom:10px;"
      />
    ` : ""}

    <p><strong>Cliente:</strong> Información disponible en el sistema de administración</p>
    <p><strong>Email:</strong> Ver detalles en el panel de administración</p>

    <p><strong>Check-in:</strong> ${formatDate(fechas.check_in)} a las ${fechas.check_in_hora}</p>
    <p><strong>Check-out:</strong> ${formatDate(fechas.check_out)} a las ${fechas.check_out_hora}</p>

    <p><strong>Total pagado:</strong> $${Number(pago.total).toFixed(2)} USD</p>

    <hr />

    <p style="font-size:14px;color:#555;">
      Notificación automática del sistema de reservas.
    </p>
  </div>
  `;

  await transporter.sendMail({
    from: `"Quito Smiles Suites" <${process.env.EMAIL_USER}>`,
    to: "tommyhilfredo@gmail.com",
    subject: `Nueva reserva confirmada • ${numero_reserva}`,
    html
  })
}

module.exports = {
  sendReservationConfirmation,
  sendAdminReservationNotification
};
