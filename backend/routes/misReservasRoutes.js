const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth");
const { getMisReservas } = require("../controllers/misReservasController");

router.get("/mis-reservas", authenticate, getMisReservas);

module.exports = router;
