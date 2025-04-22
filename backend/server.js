const express = require("express");
const cors = require("cors");
const pool = require("./db"); // Importa la configuración de PostgreSQL

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔹 Ruta para obtener todas las suites
app.get("/suites", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.nombre, s.descripcion, s.descripcion_pequena, s.zona_estrategica, 
            s.desc_movilidad, s.precio, s.max_capacity, si.image_url
      FROM suites s
      LEFT JOIN suite_images si ON s.id = si.suite_id
    `);

    // Agrupar suites correctamente
    const suitesMap = new Map();
    result.rows.forEach(row => {
      if (!suitesMap.has(row.id)) {
        suitesMap.set(row.id, {
          id: row.id,
          nombre: row.nombre,
          descripcion: row.descripcion,
          descripcion_pequena: row.descripcion_pequena,
          zona_estrategica: row.zona_estrategica,
          desc_movilidad: row.desc_movilidad,
          precio: row.precio,
          max_capacity: row.max_capacity,
          images: new Set(), // Usar un Set para evitar duplicados
        });
      }
      if (row.image_url) {
        suitesMap.get(row.id).images.add(row.image_url);
      }
    });

    // Convertir Set a Array
    const suites = Array.from(suitesMap.values()).map(suite => ({
      ...suite,
      images: Array.from(suite.images),
    }));

    res.json(suites);
  } catch (error) {
    console.error("Error obteniendo suites:", error);
    res.status(500).json({ error: "Error obteniendo suites" });
  }
});

// 🔹 Ruta para obtener una suite específica por ID
app.get("/suites/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id, s.nombre, s.descripcion, s.descripcion_pequena, s.zona_estrategica, 
              s.desc_movilidad, s.precio, s.max_capacity, si.image_url,
              c.nombre AS comodidad_nombre, c.icono
      FROM suites s
      LEFT JOIN suite_images si ON s.id = si.suite_id
      LEFT JOIN suites_comodidades sc ON s.id = sc.suite_id
      LEFT JOIN comodidades c ON sc.comodidad_id = c.id
      WHERE s.id = $1`, 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Suite no encontrada" });
    }

    // Agrupar datos correctamente
    const suite = {
      id: result.rows[0].id,
      nombre: result.rows[0].nombre,
      descripcion: result.rows[0].descripcion,
      descripcion_pequena: result.rows[0].descripcion_pequena,
      zona_estrategica: result.rows[0].zona_estrategica,
      desc_movilidad: result.rows[0].desc_movilidad,
      max_capacity: result.rows[0].max_capacity,
      precio: result.rows[0].precio,
      images: new Set(),
      comodidades: new Set(),
    };

    result.rows.forEach(row => {
      if (row.image_url) {
        suite.images.add(row.image_url);
      }
      if (row.comodidad_nombre) {
        suite.comodidades.add(JSON.stringify({ nombre: row.comodidad_nombre, icono: row.icono }));
      }
    });

    // Convertir Sets a Arrays
    suite.images = Array.from(suite.images);
    suite.comodidades = Array.from(suite.comodidades).map(c => JSON.parse(c));

    res.json(suite);
  } catch (error) {
    console.error("Error obteniendo la suite:", error);
    res.status(500).json({ error: "Error obteniendo la suite" });
  }
});

// 🔹 Ruta para agregar una nueva suite
app.post("/suites", async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    const { nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El campo 'nombre' es obligatorio." });
    }

    const result = await pool.query(
      `INSERT INTO suites (nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error agregando suite:", error);
    res.status(500).json({ error: "Error al agregar la suite" });
  }
});

// 🔹 Ruta para editar una suite
app.put("/suites/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity } = req.body;

    const result = await pool.query(
      `UPDATE suites SET nombre=$1, descripcion=$2, descripcion_pequena=$3, zona_estrategica=$4, desc_movilidad=$5, 
      precio=$6, max_capacity=$7 WHERE id=$8 RETURNING *`,
      [nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Suite no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error actualizando suite:", error);
    res.status(500).json({ error: "Error al actualizar la suite" });
  }
});

// 🔹 Ruta para eliminar una suite
app.delete("/suites/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM suites WHERE id=$1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Suite no encontrada" });
    }

    res.json({ message: "Suite eliminada exitosamente" });
  } catch (error) {
    console.error("Error eliminando suite:", error);
    res.status(500).json({ error: "Error al eliminar la suite" });
  }
});

// Iniciar servidor en el puerto 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
