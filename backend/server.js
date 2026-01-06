const express = require("express");
require("dotenv").config();

const cors = require("cors");
const pool = require("./db");
const path = require("path");
const multer = require("multer")
const requireAdmin = require("./middlewares/adminAuth");
const { error } = require("console");

const adminAuth = require("./routes/adminAuth");
const app = express();
const { eachDayOfInterval, isWithinInterval } = require("date-fns");
const authRoutes = require("./routes/auth");
const paypalRoutes = require("./routes/paypal")
const passport = require("passport")
const clienteRoutes = require("./routes/clienteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const misReservasRoutes = require("./routes/misReservasRoutes")
const pdf = require("./routes/pdf");
const { end } = require("pdfkit");
const { blob } = require("stream/consumers");
require("./config/passport")(passport);


// Middleware
app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

//rutas publicas
app.use("/api/auth", authRoutes);
app.use("/api/admin-auth", adminAuth);
app.use("/api/admin",pdf);
app.use("/api/clientes", clienteRoutes);
app.use("/api/reservations", require("./routes/reservas"))
app.use("/paypal", paypalRoutes)
app.use("/reservas", require("./routes/reservasPublic"));
app.use("/api", misReservasRoutes);

//ruta de prueba protegida
app.get(
  "/admin/suites",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  (req, res) => {
    res.json({ message: "Acceso autorizado", user: req.user });
  }
);

//ruta para obtener reservas en el adminsitrador


//ruta protegida del admin
app.use("/api/admin",passport.authenticate("jwt", {session:false}),requireAdmin ,adminRoutes);
//

//

//archivos estaticsop
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//confuguracion de almacenamiento
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null, path.join(__dirname, "uploads/suites"))
  },
  filename:(req, file, cb)=>{
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random()*1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({storage})
/* ============================
   📦 RUTAS DE SUITES
============================ */

// Obtener todas las suites
app.get("/suites", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.nombre, s.descripcion, s.descripcion_pequena, s.zona_estrategica,
             s.desc_movilidad, s.precio, s.max_capacity, s.habilitada,s.latitud, s.longitud,
             si.id AS image_id, si.image_url
      FROM suites s
      LEFT JOIN suite_images si ON s.id = si.suite_id
    `);

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
          habilitada: row.habilitada, // <-- aquí se agrega
          latitud: parseFloat(row.latitud),
          longitud: parseFloat(row.longitud),
          images: [],
        });
      }
      if (row.image_id && row.image_url) {
        suitesMap.get(row.id).images.push({
          id: row.image_id,
          image_url: row.image_url
        });
      }
    });

    const suites = Array.from(suitesMap.values());
    res.json(suites);
  } catch (error) {
    console.error("Error obteniendo suites:", error);
    res.status(500).json({ error: "Error obteniendo suites" });
  }
});


// Obtener suite por ID
app.get("/suites/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT s.id, s.nombre, s.descripcion, s.descripcion_pequena, s.zona_estrategica,
             s.desc_movilidad, s.precio, s.max_capacity, s.habilitada,
             s.latitud, s.longitud,
             si.id AS image_id, si.image_url,
             c.id AS comodidad_id, c.nombre AS comodidad_nombre, c.icono
      FROM suites s
      LEFT JOIN suite_images si ON s.id = si.suite_id
      LEFT JOIN suites_comodidades sc ON s.id = sc.suite_id
      LEFT JOIN comodidades c ON sc.comodidad_id = c.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Suite no encontrada" });
    }

    // Usamos Map para evitar duplicados
    const suite = {
      id: result.rows[0].id,
      nombre: result.rows[0].nombre,
      descripcion: result.rows[0].descripcion,
      descripcion_pequena: result.rows[0].descripcion_pequena,
      zona_estrategica: result.rows[0].zona_estrategica,
      desc_movilidad: result.rows[0].desc_movilidad,
      max_capacity: result.rows[0].max_capacity,
      precio: result.rows[0].precio,
      habilitada: result.rows[0].habilitada,
      latitud:parseFloat(result.rows[0].latitud),
      longitud: parseFloat(result.rows[0].longitud),
      images: new Map(),
      comodidades: new Map(),
    };

    result.rows.forEach(row => {
      if (row.image_id && row.image_url) {
        suite.images.set(row.image_id, { id: row.image_id, image_url: row.image_url });
      }
      if (row.comodidad_id && row.comodidad_nombre) {
        suite.comodidades.set(row.comodidad_id, { nombre: row.comodidad_nombre, icono: row.icono });
      }
    });

    // Convertimos a arrays
    suite.images = Array.from(suite.images.values());
    suite.comodidades = Array.from(suite.comodidades.values());

    res.json(suite);
  } catch (error) {
    console.error("Error obteniendo la suite:", error);
    res.status(500).json({ error: "Error obteniendo la suite" });
  }
});



// Crear nueva suite
app.post("/suites",passport.authenticate("jwt", {session: false}),requireAdmin,upload.array("images",10), async (req, res) => {
  try {
    const { nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity,habilitada, comodidades, latitud, longitud } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El campo 'nombre' es obligatorio." });
    }

    const result = await pool.query(`
      INSERT INTO suites (nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity, habilitada,latitud, longitud)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity, habilitada,latitud, longitud ?? true]
    );
    const suiteId = result.rows[0].id;

    if(req.files && req.files.length > 0){
      const insertImages = req.files.map(file => pool.query(
        "INSERT INTO suite_images (suite_id, image_url) VALUES ($1, $2)",
        [suiteId, "/uploads/suites/" + file.filename]
      ));
      await Promise.all(insertImages);
    }
     // Guardar comodidades si se enviaron
    if (comodidades && comodidades.length > 0) {
      const comodidadesArray = Array.isArray(comodidades) ? comodidades : [comodidades];
      const insertComodidades = comodidadesArray.map(id =>
        pool.query(
          "INSERT INTO suites_comodidades (suite_id, comodidad_id) VALUES ($1, $2)",
          [suiteId, id]
        )
      );
      await Promise.all(insertComodidades);
    }
    // res.json(result.rows[0]);
    res.json({success: true, message: "Suite creada", id: suiteId});
  } catch (error) {
    console.error("Error agregando suite:", error);
    res.status(500).json({ error: "Error al agregar la suite" });
  }
});

// Actualizar suite
app.put("/suites/:id",passport.authenticate("jwt", {session: false}),requireAdmin,upload.array("images", 10), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity, habilitada, latitud, longitud } = req.body;

  try {
    if (!nombre || nombre.trim() === "") {
  return res.status(400).json({ error: "El campo 'nombre' es obligatorio." });
}
    const result = await pool.query(`
      UPDATE suites SET nombre=$1, descripcion=$2, descripcion_pequena=$3, zona_estrategica=$4, desc_movilidad=$5,
      precio=$6, max_capacity=$7 , habilitada =$8 , latitud=$9, longitud=$10 WHERE id=$11 RETURNING id `,
      [nombre, descripcion, descripcion_pequena, zona_estrategica, desc_movilidad, precio, max_capacity,habilitada,latitud, longitud, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Suite no encontrada" });
    }

    if(req.files && req.files.length > 0){
      const insertImages = req.files.map(file => pool.query(
        "INSERT INTO suite_images (suite_id, image_url) VALUES ($1, $2)",
        [id, "/uploads/suites/"+ file.filename]
      ));
      await Promise.all(insertImages);
    }
    res.json({success: true, message: "Suite actualizada", id});
    // res.json(result.rows[0]);
  } catch (error) {
    console.error("Error actualizando suite:", error);
    res.status(500).json({ error: "Error al actualizar la suite" });
  }
});

// Eliminar suite
app.delete("/suites/:id",passport.authenticate("jwt", {session: false}),requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
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
//eliminar images especificas

app.delete("/suites/:id/images/:imageId",passport.authenticate("jwt", {session: false}),requireAdmin,async(req,res)=>{
  const {imageId} = req.params;
  try{
    const result = await pool.query("DELETE FROM suite_images WHERE id=$1 RETURNING *", [imageId]);
    if(result.rowCount ===0) return res.status(404).json({error: "Imagen no encontrada"});
    res.json({success: true, message: "Imagen eliminada"});
  }catch(error){
    console.error("Error eliminando imagen:", error);
    res.status(500).json({error: "Error eliminando imagen"})
  }
})
//IMAGENES
// Obtener imágenes de una suite
app.get("/suites/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM suite_images WHERE suite_id = $1",
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});

// Agregar imágenes a una suite
app.post("/suites/:id/images",passport.authenticate("jwt", {session: false}),requireAdmin, upload.array("images"), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se subieron imágenes" });
    }

    const values = files.map((file) => `('${id}', '/uploads/${file.filename}')`).join(",");
    await pool.query(
      `INSERT INTO suite_images (suite_id, image_url) VALUES ${values}`
    );

    res.json({ message: "Imágenes agregadas correctamente" });
  } catch (error) {
    console.error("Error al subir imágenes:", error);
    res.status(500).json({ error: "Error al subir imágenes" });
  }
});

// Eliminar una imagen
app.delete("/suites/:suiteId/images/:imageId",passport.authenticate("jwt", {session: false}),requireAdmin, async (req, res) => {
  try {
    const { suiteId, imageId } = req.params;
    await pool.query("DELETE FROM suite_images WHERE id = $1 AND suite_id = $2", [
      imageId,
      suiteId,
    ]);
    res.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando imagen:", error);
    res.status(500).json({ error: "Error eliminando imagen" });
  }
});

//
//
//COMODIDADES
app.get("/comodidades", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, icono FROM comodidades ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo comodidades:", error);
    res.status(500).json({ error: "Error obteniendo comodidades" });
  }
});
//comodidades by id
app.get("/suites/:id/comodidades", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.id, c.nombre, c.icono
       FROM suites_comodidades sc
       JOIN comodidades c ON sc.comodidad_id = c.id
       WHERE sc.suite_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener comodidades:", error);
    res.status(500).json({ error: "Error al obtener comodidades" });
  }
});

//Agregar comodidad
app.post("/suites/:id/comodidades",passport.authenticate("jwt", {session: false}),requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { comodidad_id } = req.body;

    if (!comodidad_id) return res.status(400).json({ error: "Falta comodidad_id" });

    await pool.query(
      `INSERT INTO suites_comodidades (suite_id, comodidad_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, comodidad_id]
    );

    res.json({ message: "Comodidad agregada correctamente" });
  } catch (error) {
    console.error("Error agregando comodidad:", error);
    res.status(500).json({ error: "Error agregando comodidad" });
  }
});
//eliminar comodidad
app.delete("/suites/:suiteId/comodidades/:comodidadId",passport.authenticate("jwt", {session: false}),requireAdmin, async (req, res) => {
  try {
    const { suiteId, comodidadId } = req.params;

    await pool.query(
      `DELETE FROM suites_comodidades 
       WHERE suite_id = $1 AND comodidad_id = $2`,
      [suiteId, comodidadId]
    );

    res.json({ message: "Comodidad eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando comodidad:", error);
    res.status(500).json({ error: "Error eliminando comodidad" });
  }
});

/* ============================
   📅 RUTAS DE RESERVAS
============================ */

// Fechas reservadas (deshabilitadas)
app.get("/api/reservations/disabled_dates/:suiteId", async (req, res) => {
  const { suiteId } = req.params;

  try {
    const now = new Date();
    const result = await pool.query(
      `SELECT id, start_date, end_date
       FROM reservas
       WHERE suite_id = $1
       AND (
         status = 'confirmada'
         OR (status = 'temporal' AND expires_at > $2)
       )
         ORDER BY start_date ASC`,
      [suiteId,now]
    );

    const bloqueos = await pool.query(
      `SELECT start_date, end_date 
       FROM bloqueos 
       WHERE suite_id = $1`,
      [suiteId]
    );
    let disabledDates = []

    result.rows.forEach(({start_date, end_date})=>{
      if(start_date && end_date){
        const days = eachDayOfInterval({
          start: new Date(start_date),
          end: new Date(end_date),
        });
        disabledDates = [...disabledDates, ...days]
      }
    })
    bloqueos.rows.forEach(({ start_date, end_date }) => {
      const days = eachDayOfInterval({
        start: new Date(start_date),
        end: new Date(end_date),
      });
      disabledDates.push(...days);
    });
    res.json(disabledDates);
  } catch (error) {
    console.error("Error obteniendo fechas reservadas:", error);
    res.status(500).json({ error: "Error obteniendo fechas reservadas" });
  }
});

// Crear reserva temporal
app.post("/reservas/temporal", async (req, res) => {
  const { suite_id, start_date, end_date, personas, total_pagado, transporte, nombre_cliente, user_id } = req.body;

  try {
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (start >= end) {
      return res.status(400).json({ error: "La fecha de inicio debe ser anterior a la fecha final." });
    }

    const now = new Date();

    // RESERVAS activas
    const reservas = await pool.query(
      `SELECT start_date, end_date
       FROM reservas
       WHERE suite_id = $1
       AND (status = 'confirmada' OR (status = 'temporal' AND expires_at > $2))
       ORDER BY start_date ASC`,
      [suite_id, now]
    );

    // BLOQUEOS del admin
    const bloqueos = await pool.query(
      `SELECT start_date, end_date 
       FROM bloqueos 
       WHERE suite_id = $1`,
      [suite_id]
    );

    // Construir calendario de ocupación
    let occupiedDates = [];

    reservas.rows.concat(bloqueos.rows).forEach(({ start_date, end_date }) => {
      if (start_date && end_date) {
        const days = eachDayOfInterval({
          start: new Date(start_date),
          end: new Date(end_date),
        });
        occupiedDates = [...occupiedDates, ...days];
      }
    });

    // Rango solicitado
    const requestedDates = eachDayOfInterval({ start, end });

    // Verificar solapamiento
    const isOverlap = requestedDates.some(date =>
      occupiedDates.some(occ => occ.getTime() === date.getTime())
    );

    if (isOverlap) {
      return res.status(400).json({ error: "Las fechas seleccionadas no están disponibles" });
    }

    const expiresAt = new Date(now.getTime() + 10 * 60000);
    const transporteBool = transporte === "true" || transporte === true;

    const insertResult = await pool.query(
      `INSERT INTO reservas 
      (suite_id, start_date, end_date, personas, total_pagado, status, created_at, expires_at, transporte, nombre_cliente, user_id)
       VALUES ($1, $2, $3, $4, $5, 'temporal', NOW(), $6, $7, $8, $9)
       RETURNING *`,
      [suite_id, start, end, personas, total_pagado, expiresAt, transporteBool, nombre_cliente,user_id]
    );

    res.json({
      success: true,
      message: "Reserva temporal creada con éxito",
      reservationId: insertResult.rows[0].id,
      expiresAt: expiresAt.getTime(),
      reservation: insertResult.rows[0],
    });
  } catch (error) {
    console.error("Error creando reserva temporal:", error);
    res.status(500).json({ error: "Error al crear reserva temporal" });
  }
});


//Endpoints para el bloqueo manual de fechas para las suites

app.post(
  "/admin/bloqueos",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  async (req, res) => {
    const { suite_id, start_date, end_date, motivo } = req.body;

    try {
      if (!suite_id || !start_date || !end_date) {
        return res.status(400).json({ error: "Datos incompletos" });
      }

      const result = await pool.query(
        `INSERT INTO bloqueos (suite_id, start_date, end_date, motivo)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [suite_id, start_date, end_date, motivo || null]
      );

      res.json({ success: true, bloqueo: result.rows[0] });
    } catch (err) {
      console.error("Error creando bloqueo:", err);
      res.status(500).json({ error: "Error al crear bloqueo" });
    }
  }
);


app.get("/admin/bloqueos/:suite_id", async (req, res) => {
  const { suite_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM bloqueos WHERE suite_id = $1 ORDER BY start_date ASC",
      [suite_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo bloqueos:", err);
    res.status(500).json({ error: "Error al obtener bloqueos" });
  }
});

// Eliminar bloqueo
app.delete("/admin/bloqueos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM bloqueos WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error eliminando bloqueo:", err);
    res.status(500).json({ error: "Error al eliminar bloqueo" });
  }
});


//Endpoints para la generacion de cupones
//crear cupon
app.post('/api/cupones', async (req, res) => {
  const { discount_percentage } = req.body;
  const code = `QSS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`; // genera un código aleatorio

  try {
    const result = await pool.query(
      `INSERT INTO discount_codes (code, discount_percentage)
       VALUES ($1, $2)
       RETURNING *`,
      [code, discount_percentage]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el cupón' });
  }
});



//validar cupon

app.post('/api/cupones/validar',async (req,res)=>{
  const {code} = req.body;

  try{
    const result = await pool.query(
      `SELECT * FROM discount_codes 
       WHERE code = $1 AND is_used = false`,
       [code]
    );
    if(result.rows.length === 0){
      return res.status(400).json({
        valido: false,
        mensaje: 'Cupon inválido o ya utilizado'
      });
    }

    const cupon = result.rows[0];
    res.json({
      valido: true,
      porcentaje: parseFloat(cupon.discount_percentage),
    })
  }catch(error){
    console.error(error);
    res.status(500).json({error: 'Error al validar el cupón'})
  }
})

//Marcar cupon como usado tras confirmar la reserva

app.post('/api/cupones/usar', async (req,res)=>{
  const {code} = req.body;
  try{
    const result = await pool.query(
       `UPDATE discount_codes
       SET is_used = true
       WHERE code = $1 AND is_used = false
       RETURNING *`,
       [code]
    )
    if(result.rowCount ===0){
      return res.status(400).json({mensaje: 'Cupon no encontrado o ya usado'})
    }
    res.json({mensaje: 'Cupón aplicado correctamente'})
  }catch(error){
    console.error(error);
    res.status(500).json({error: 'Error al usar el cupón'})
  }
});

//mostrar los cupones creados 
app.get('/api/cupones', async (req, res)=>{
  try{
    const result = await pool.query(
      'SELECT * FROM discount_codes ORDER BY created_at DESC'
    );
    res.json(result.rows);

  }catch(error){
    console.error(error);
      res.status(500).json({error: 'No se pudo obtener los cupones'})
  }
})

// Actualizar un cupón
app.put('/api/cupones/:id', async (req, res) => {
  const { id } = req.params;
  const { code, discount_percentage, is_used } = req.body;
  try {
    const result = await pool.query(
      `UPDATE discount_codes
       SET code = $1, discount_percentage = $2, is_used = $3
       WHERE id = $4
       RETURNING *`,
      [code, discount_percentage, is_used || false, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar cupón' });
  }
});

// Eliminar un cupón
app.delete('/api/cupones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM discount_codes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    res.json({ message: 'Cupón eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cupón' });
  }
});



// Limpieza automática de reservas temporales vencidas
setInterval(async () => {
  try {
    const now = new Date();
    await pool.query(`
      DELETE FROM reservas WHERE status = 'temporal' AND expires_at <= $1`,
      [now]
    );
    console.log("Reservas temporales expiradas eliminadas", now);
  } catch (error) {
    console.error("Error limpiando reservas expiradas:", error);
  }
}, 60 * 1000); // cada minuto


/* ============================
   🚀 INICIAR SERVIDOR
============================ */

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
