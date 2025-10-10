// routes/pdf.js
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const pool = require("../db"); // tu pool de PostgreSQL

router.get("/reserva/:reservaId/pdf", async (req, res) => {
  try {
    const reservaId = parseInt(req.params.reservaId, 10);

    if (isNaN(reservaId)) {
      return res.status(400).json({ error: "ID de reserva inválido" });
    }

    // Obtener reserva con sus clientes
    const reservaResult = await pool.query(
      `SELECT r.*, s.nombre AS suite_nombre
       FROM reservas r
       JOIN suites s ON r.suite_id = s.id
       WHERE r.id = $1`,
      [reservaId]
    );

    if (reservaResult.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reserva = reservaResult.rows[0];

    const clientesResult = await pool.query(
      `SELECT * FROM clientes WHERE reserva_id = $1`,
      [reservaId]
    );
    const clientes = clientesResult.rows;

    // Crear PDF
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    // Encabezado
    doc.image("../src/assets/principal-page/logo.png", 50, 20, { width: 50 }) // si tienes logo
      .fontSize(18)
      .text("Quito Smiles Suites", 110, 30)
      .moveDown(2);

    // Datos de la reserva
    doc.fontSize(14).text(`Reserva #${reserva.id}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12)
      .text(`Cliente Responsable: ${reserva.nombre_cliente}`)
      .text(`Suite: ${reserva.suite_nombre}`)
      .text(`Fecha Inicio: ${new Date(reserva.start_date).toLocaleDateString()}`)
      .text(`Fecha Fin: ${new Date(reserva.end_date).toLocaleDateString()}`)
      .text(`Personas: ${reserva.personas}`)
      .moveDown();

    // Lista de huéspedes
    doc.fontSize(14).text("Huéspedes:", { underline: true });
    clientes.forEach((c, i) => {
      doc.fontSize(12).list([
        `Nombre: ${c.nombres} ${c.apellidos}`,
        `Teléfono: ${c.telefono}`,
        `Teléfono de Emergencia: ${c.telefono_emergencia}`,
        `Parentesco: ${c.parentesco || "-"}`,
        `Motivo: ${c.motivo || "-"} ${c.detalle_motivo ? "- " + c.detalle_motivo : ""}`,
        `Responsable: ${c.is_responsable ? "Sí" : "No"}`,
      ]).moveDown(0.5);
    });

    // Pie de página
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
        .text(`Página ${i + 1} de ${pageCount}`, 50, 780, { align: "center" })
        .text(`Generado: ${new Date().toLocaleString()}`, 50, 795, { align: "center" });
    }

    // Finalizar PDF
    res.setHeader("Content-Disposition", `attachment; filename=reserva_${reservaId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("Error generando PDF:", err);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

module.exports = router;
