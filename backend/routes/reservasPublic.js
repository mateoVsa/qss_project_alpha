const express = require("express");
const router = express.Router();
const { getReservaPublic } = require("../controllers/reservasPublicController");

router.get("/:id", getReservaPublic);

module.exports = router;
