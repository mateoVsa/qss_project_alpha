const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { Pool } = require("pg");

// Configurar variables de entorno
dotenv.config();

// Crear servidor Express
const app = express();
const PORT = process.env.PORT || 5000;

// Configurar base de datos PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "AdminAmper",
  port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(express.json());

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Ajusta esto según la URL de tu frontend en producción
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use('/images', express.static('/images'));


// Ruta de prueba para obtener suites desde la base de datos
app.get("/suites", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM suites");
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo suites:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
