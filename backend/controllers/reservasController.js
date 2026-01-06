const pool = require("../db");

exports.generateQuote = async (req, res) => {
  try {
    const { 
      suite_id, 
      start_date, 
      end_date, 
      personas,
      includeTransport = false,
      expectedTotal
    } = req.body;

    // ---------------------------------------------
    // 🔍 VALIDACIONES BÁSICAS
    // ---------------------------------------------
    if (!suite_id || !start_date || !end_date || !personas) {
      return res.status(400).json({ ok: false, message: "Datos incompletos para la cotización." });
    }

    const fechaInicio = new Date(start_date);
    const fechaFin = new Date(end_date);

    if (isNaN(fechaInicio) || isNaN(fechaFin) || fechaFin <= fechaInicio) {
      return res.status(400).json({ ok: false, message: "Fechas inválidas." });
    }

    // Calcular noches
    const noches = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
    if (noches <= 0) {
      return res.status(400).json({ ok: false, message: "Las fechas deben generar al menos 1 noche." });
    }

    // ---------------------------------------------
    // 📌 OBTENER DATOS DE LA SUITE
    // ---------------------------------------------
    const query = `
      SELECT 
        nombre,
        max_capacity,
        precio,
        precio_colchon
      FROM suites 
      WHERE id = $1
    `;

    const suiteResult = await pool.query(query, [suite_id]);

    if (suiteResult.rowCount === 0) {
      return res.status(404).json({ ok: false, message: "Suite no encontrada." });
    }

    const suite = suiteResult.rows[0];

    const maxCapacity = Number(suite.max_capacity);
    const precioBase = Number(suite.precio);
    const precioColchon = Number(suite.precio_colchon || 12);

    // ---------------------------------------------
    // 🛏️ COLCHONES EXTRA
    // ---------------------------------------------
    const personasExtra = Math.max(0, personas - maxCapacity);
    const colchonesExtra = personasExtra;

    const costoColchones = colchonesExtra * precioColchon * noches;

    // ---------------------------------------------
    // 👥 OPCIÓN B — 20% DEL TOTAL BASE POR PERSONA EXTRA
    // ---------------------------------------------
    const totalBase = precioBase * noches;
    const incrementoPersonas = totalBase * 0.20 * (personas-1);

    // ---------------------------------------------
    // 🚗 TRANSPORTE
    // ---------------------------------------------
    const costoTransporte = includeTransport ? 20 : 0;

    // ---------------------------------------------
    // 💰 TOTAL FINAL
    // ---------------------------------------------
    const totalCalculado = totalBase + incrementoPersonas + costoColchones + costoTransporte;

    // ---------------------------------------------
    // 🛡️ VALIDACIÓN CONTRA EL FRONTEND
    // ---------------------------------------------
    if (expectedTotal !== undefined && Math.abs(expectedTotal - totalCalculado) > 0.5) {
      return res.status(400).json({
        ok: false,
        message: "El total enviado por el cliente no coincide con el cálculo del servidor.",
        totalServidor: totalCalculado
      });
    }

    // ---------------------------------------------
    // 📤 RESPUESTA FINAL
    // ---------------------------------------------
    return res.json({
      ok: true,
      suite: suite.nombre,
      noches,
      personas,
      colchonesExtra,
      includeTransport,
      desglose: {
        precioBase,
        totalBase,
        incrementoPersonas,
        precioColchon,
        costoColchones,
        costoTransporte
      },
      total: totalCalculado
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error interno del servidor." });
  }
};
