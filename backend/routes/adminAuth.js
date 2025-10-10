const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // tu conexión a Postgres
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";
// POST login admin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, email, password, is_admin FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // ⚠️ Aquí deberías usar bcrypt.compare(password, user.password)
    if (password !== user.password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!user.is_admin) {
      return res.status(403).json({ message: "No tienes acceso de administrador" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error en login admin:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

module.exports = router;
