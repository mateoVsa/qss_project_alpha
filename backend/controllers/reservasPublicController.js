const pool = require("../db");

exports.getReservaPublic = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.id,
        r.suite_id,
        r.start_date,
        r.end_date,
        r.personas,
        r.colchones_extra,
        r.total_pagado,
        r.status,
        s.nombre AS suite_nombre
      FROM reservas r
      JOIN suites s ON s.id = r.suite_id
      WHERE r.id = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("❌ Error al obtener reserva:", err);
    res.status(500).json({ error: "Error al obtener reserva" });
  }
};
