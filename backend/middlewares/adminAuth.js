module.exports = function requireAdmin(req, res, next) {
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Acceso denegado: solo administradores" });
    }
    next();
};