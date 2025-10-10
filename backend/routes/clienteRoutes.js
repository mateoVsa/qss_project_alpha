const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const clienteController = require('../controllers/clienteController');
const authenticate = require('../middlewares/auth'); // 👈 agrega esto


// Esta ruta usará el middleware de subida de archivos y luego confirmará la reserva
router.post('/confirmar-reserva',authenticate, upload.any(), clienteController.confirmarReserva);

module.exports = router;
