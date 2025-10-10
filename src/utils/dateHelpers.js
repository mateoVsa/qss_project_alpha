// src/utils/dateHelpers.js

// Convierte a objeto Date válido o devuelve null si no se puede
export function toDate(val) {
  if (!val) return null;

  if (val instanceof Date && !isNaN(val)) return val;

  if (typeof val === "number") {
    if (isNaN(val)) return null;
    if (val < 1e11) return new Date(val * 1000);
    return new Date(val);
  }

  const num = Number(val);
  if (!Number.isNaN(num)) {
    if (num < 1e11) return new Date(num * 1000);
    return new Date(num);
  }

  // Manejo de string ISO o con formato raro
  const parsed = Date.parse(val);
  if (!isNaN(parsed)) return new Date(parsed);

  return null;
}

// Ajusta hora a mediodía (para evitar desfases de zona horaria)
export function normalizeToMidday(date) {
  const d = toDate(date);
  if (!d) return null;
  d.setHours(12, 0, 0, 0);
  return d;
}

// 🔥 Nueva función: solo formatea si existe fecha
export function safeFormat(date) {
  const d = toDate(date);
  return d ? d.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" }) : "—";
}
