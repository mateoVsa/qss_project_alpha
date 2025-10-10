const { Pool } = require("pg");

let pool;

if (process.env.NODE_ENV === "production") {
  // Conexión para Render (producción)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Conexión local (desarrollo)
  pool = new Pool({
    user: "postgres", // tu usuario local
    host: "localhost",
    database: "qss",
    password: "AdminAmper",
    port: 5432,
  });
}

module.exports = pool;
