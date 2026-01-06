const pool = require("../db");

exports.getMisReservas = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
    r.id,
    r.start_date,
    r.end_date,
    r.personas,
    r.status,
    r.created_at,
    r.total_pagado,

    s.id AS suite_id,
    s.nombre AS suite_nombre,
    s.latitud,
    s.longitud

  FROM reservas r
  JOIN suites s ON s.id = r.suite_id
  WHERE r.user_id = $1
  ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);

  } catch (error) {
    console.error("❌ Error al obtener mis reservas:", error);
    res.status(500).json({ error: "Error al obtener mis reservas" });
  }
};
