// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecreto"); // Usa tu misma clave secreta
    req.user = decoded; // Aquí puedes guardar el usuario extraído del token
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = authenticate;
