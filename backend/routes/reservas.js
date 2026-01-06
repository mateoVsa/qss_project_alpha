const express = require("express");
const router = express.Router();
const reservasController = require("../controllers/reservasController");

router.post("/calcular-precio", reservasController.generateQuote);

module.exports = router;