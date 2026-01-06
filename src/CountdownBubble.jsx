// CountdownBubble.jsx
import React from "react";

const CountdownBubble = ({ timeLeft }) => {
  const isLow = timeLeft <= 30; // Menos de 30s se vuelve rojo

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className={`countdown-bubble ${isLow ? "low-time" : ""}`}>
      Tiempo restante: {formatTime(timeLeft)}
    </div>
  );
};

export default CountdownBubble;
