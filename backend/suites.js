const express = require("express");
const pool = require("./db"); // Importamos la conexión a PostgreSQL
const router = express.Router();

router.get("/suites", async (req, res) => {
  try {
    const suitesQuery = `
      SELECT s.id, s.nombre, s.descripcion, s.precio, 
        COALESCE(json_agg(si.image_url) FILTER (WHERE si.image_url IS NOT NULL), '[]') AS imagenes
      FROM suites s
      LEFT JOIN suite_images si ON s.id = si.suite_id
      GROUP BY s.id
    `;

    const result = await pool.query(suitesQuery);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo suites:", error);
    res.status(500).json({ error: "Error obteniendo suites" });
  }
});

module.exports = router;
