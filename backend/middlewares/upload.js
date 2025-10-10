const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/documentos';
    // Asegurar que el directorio exista
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Evitar caracteres peligrosos en el nombre del archivo
    const cleanField = file.fieldname.replace(/[^a-zA-Z0-9_\[\]]/g, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${cleanField}-${uniqueSuffix}${ext}`);
  }
});

// Middleware exportado para usar con .any(), .fields() u otros
module.exports = multer({ storage });
