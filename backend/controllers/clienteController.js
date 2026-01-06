const qs = require("qs");
const pool = require("../db");

const confirmarReserva = async (req, res) => {
  const client = await pool.connect();

  try {
    // ---------------------------
    // 1. Parse multipart + nested data
    // ---------------------------
    const body = qs.parse(req.body);

    const reservationId = body.reservationId;
    const billingData = body.billing_data || body.facturacion || {};


    // guests puede venir como array o como objeto {"0":{...}}
    const guestsRaw = body.guests || [];
    const guests = Array.isArray(guestsRaw)
      ? guestsRaw
      : Object.values(guestsRaw);

    // Transporte puede venir como boolean, string o número
    const transporte =
      body.transporte === "true" ||
      body.transporte === true ||
      body.transporte === 1;

    const horaLlegada = body.hora_llegada || body.horaLlegada || null;

    // ---------------------------
    // 2. Validar usuario autenticado
    // ---------------------------
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    await client.query("BEGIN");

    // ---------------------------
    // 3. Procesar archivos subidos
    // ---------------------------
    const fileMap = {};
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        fileMap[file.fieldname] = file;
      });
    }

    // ---------------------------
    // 4. Insertar huéspedes
    // ---------------------------
    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];

      const cedulaFile = fileMap[`guests[${i}][cedula]`];

      await client.query(
        `
        INSERT INTO clientes (
          user_id, nombres, apellidos, fecha_nacimiento, correo, telefono, 
          telefono_emergencia, parentesco, motivo, detalle_motivo, ciudad, 
          cedula_path, reserva_id, is_responsable
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
        )
      `,
        [
          userId,
          g.nombres,
          g.apellidos,
          g.fechaNacimiento,
          g.correo,
          g.telefono,
          g.telefonoEmergencia,
          g.parentesco,
          g.motivo,
          g.detalleMotivo,
          g.ciudad,
          cedulaFile ? cedulaFile.path : null,
          reservationId,
          i === 0, // Responsable = primer huésped
        ]
      );
    }

    // ---------------------------
    // 5. Validación de facturación
    // ---------------------------
    const debeInsertarFacturacion =
      billingData && Object.keys(billingData).length > 0;

    if (debeInsertarFacturacion) {
      const camposObligatorios = [
        "nombre",
        "cedula_ruc",
        "correo",
        "telefono",
        "direccion",
      ];

      const faltantes = camposObligatorios.filter(
        (campo) =>
          !billingData[campo] || billingData[campo].toString().trim() === ""
      );

      if (faltantes.length > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Datos de facturación incompletos",
          faltantes,
        });
      }

      await client.query(
        `
        INSERT INTO facturacion (
          reserva_id, nombre, cedula_ruc, direccion, telefono, correo
        ) VALUES ($1,$2,$3,$4,$5,$6)
      `,
        [
          reservationId,
          billingData.nombre,
          billingData.cedula_ruc,
          billingData.direccion,
          billingData.telefono, // <-- ESTE FALTABA EN TU CÓDIGO ORIGINAL
          billingData.correo,
        ]
      );
    }

    // ---------------------------
    // 6. Actualizar reserva
    // ---------------------------
    await client.query(
      `
      UPDATE reservas
      SET status = 'confirmada',
          transporte = $2,
          hora_llegada = $3
      WHERE id = $1
    `,
      [reservationId, transporte, horaLlegada]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Reserva confirmada y huéspedes registrados correctamente",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Error en confirmarReserva:", error);
    return res.status(500).json({
      error: "Error interno al confirmar la reserva",
      detalle: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = { confirmarReserva };
