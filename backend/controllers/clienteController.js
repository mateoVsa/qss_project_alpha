const qs = require("qs");
const pool = require("../db");

const confirmarReserva = async (req, res) => {
  const client = await pool.connect();
  try {
    const body = qs.parse(req.body);
    const reservationId = body.reservationId;
    const guests = body.guests || [];

    const transporte = body.transporte ==="true" || body.transporte === "true";

    const horaLlegada = body.hora_llegada || body.horaLlegada || null;

    // Asegúrate de que tienes el user_id disponible
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    await client.query("BEGIN")
    const fileMap = {};
    req.files.forEach((file) => {
      fileMap[file.fieldname] = file;
    });

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      const cedulaFile = fileMap[`guests[${i}][cedula]`];

      const nuevoCliente = {
        user_id: userId,
        nombres: guest.nombres,
        apellidos: guest.apellidos,
        fecha_nacimiento: guest.fechaNacimiento,
        correo: guest.correo,
        telefono: guest.telefono,
        telefono_emergencia: guest.telefonoEmergencia,
        parentesco: guest.parentesco,       // nuevo
       motivo: guest.motivo,               // nuevo
       detalle_motivo: guest.detalleMotivo,
        cedula_path: cedulaFile ? cedulaFile.path : null,
        reserva_id: reservationId,
        is_responsable: i === 0,
      };

      await client.query(
        `INSERT INTO clientes 
        (user_id, nombres, apellidos, fecha_nacimiento, correo, telefono, telefono_emergencia, parentesco, motivo, detalle_motivo, cedula_path, reserva_id, is_responsable)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          nuevoCliente.user_id,
          nuevoCliente.nombres,
          nuevoCliente.apellidos,
          nuevoCliente.fecha_nacimiento,
          nuevoCliente.correo,
          nuevoCliente.telefono,
          nuevoCliente.telefono_emergencia,
          nuevoCliente.parentesco,
          nuevoCliente.motivo,
          nuevoCliente.detalle_motivo,
          nuevoCliente.cedula_path,
          nuevoCliente.reserva_id,
          nuevoCliente.is_responsable,
        ]
      );
    }

    await client.query(
      "UPDATE reservas SET status = 'confirmada', transporte =$2, hora_llegada = $3 WHERE id = $1",
      [reservationId, transporte, horaLlegada]
    );
    await client.query("COMMIT")
    res.status(200).json({ message: "Reserva confirmada y huéspedes registrados" });
  } catch (error) {
    await client.query("ROLLBACK").catch(()=>{})
    console.error("Error en confirmarReserva:", error);
    res.status(500).json({ error: "Error al confirmar la reserva" });
  }finally{
    client.release()
  }
};

module.exports = {
  confirmarReserva,
};
