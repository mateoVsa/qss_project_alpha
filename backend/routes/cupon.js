const express = require("express");
const router = express.Router();
const Coupon = require("../models/cupon");

// Crear cupón
router.post("/", async (req, res) => {
  try {
    const { discount } = req.body;
    const code = `DESC${discount}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mes de duración

    const newCoupon = new Coupon({ code, discount, expiresAt });
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el cupón" });
  }
});

// Validar cupón
router.post("/validate", async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = await Coupon.findOne({ code });
    if (!coupon || new Date() > coupon.expiresAt) {
      return res.status(400).json({ valid: false, message: "Cupón inválido o expirado" });
    }
    res.json({ valid: true, discount: coupon.discount });
  } catch (error) {
    res.status(500).json({ error: "Error al validar el cupón" });
  }
});

module.exports = router;
