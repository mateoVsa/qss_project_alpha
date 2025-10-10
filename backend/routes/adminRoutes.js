const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const passport = require("passport");

// Ruta protegida: obtener reservas + clientes
router.get(
  "/reservas",
  passport.authenticate("jwt", { session: false }),
  adminController.getReservasConClientes
);

// Ruta para descargar cédula
router.get(
  "/cedula/:filename",
  passport.authenticate("jwt", { session: false }),
  adminController.downloadCedula
);

module.exports = router;
