const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const pool = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

// Registro
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // verificar si ya existe el usuario
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed]
    );

    const payload = { id: result.rows[0].id, email: result.rows[0].email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "Usuario registrado",token ,user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log("Login attempt:", { err, user, info });
    if (err || !user) {
      return res.status(401).json({ message: info?.message || "Login fallido" });
    }

    const payload = { id: user.id,name: user.name , email: user.email,role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ message: "Login exitoso", token });
  })(req, res, next);
});

// Ruta protegida
router.get("/me", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
