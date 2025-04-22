const { Pool } = require("pg");

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",  // Cambia esto si tu BD está en otro servidor
  database: "qss",
  password: "AdminAmper",
  port: 5432,  // Puerto por defecto de PostgreSQL
});

module.exports = pool;
