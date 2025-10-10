const pool = require("../db");
const path = require("path");
const fs = require("fs");

exports.getReservasConClientes = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id AS reserva_id,
        r.nombre_cliente,
        r.start_date,
        r.end_date,
        r.personas,
        r.colchones_extra,
        r.total_pagado,
        r.status,
        r.created_at,
        s.nombre AS suite_nombre,
        json_agg(
          json_build_object(
            'id', c.id,
            'nombres', c.nombres,
            'apellidos', c.apellidos,
            'fecha_nacimiento', c.fecha_nacimiento,
            'correo', c.correo,
            'telefono', c.telefono,
            'telefono_emergencia', c.telefono_emergencia,
            'parentesco', c.parentesco,
            'motivo', c.motivo,
            'detalle_motivo', c.detalle_motivo,
            'cedula_path', c.cedula_path,
            'is_responsable', c.is_responsable
          )
        ) AS clientes
      FROM reservas r
      JOIN suites s ON s.id = r.suite_id
      LEFT JOIN clientes c ON c.reserva_id = r.id
      GROUP BY r.id, s.nombre
      ORDER BY r.created_at DESC
    `;
    const baseURL = process.env.BASE_URL || "http://localhost:5000";

    const result = await pool.query(query);
    const reservas = result.rows.map((reserva) => {
      reserva.clientes = reserva.clientes.map((cliente) => {
        if (cliente.cedula_path) {
          cliente.cedula_url = `${baseURL}/uploads/${cliente.cedula_path}`;
        } else {
          cliente.cedula_url = null;
        }
        return cliente;
      });
      return reserva;
    });
    res.json(reservas);
  } catch (err) {
    console.error("❌ Error al obtener reservas:", err);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

exports.downloadCedula = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "uploads", "documentos", filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: "Archivo no encontrado" });
  }
};
