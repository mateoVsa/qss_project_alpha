import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toDate, normalizeToMidday } from "./utils/dateHelpers";
import "./assets/datepicker-modern.css"
import { es } from "date-fns/locale";

const ReservaCard = ({
  pricePerNight,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  nights,
  disabledRanges = [],
}) => {
  const sDate = startDate ? toDate(startDate) : null;
  const eDate = endDate ? toDate(endDate) : null;

  const onChangeStart = (date) => {
    const normalized = normalizeToMidday(date);
    setStartDate(normalized);
    if (!eDate || normalized >= eDate) {
      const newEnd = new Date(normalized);
      newEnd.setDate(newEnd.getDate() + 1);
      setEndDate(normalizeToMidday(newEnd));
    }
  };

  const onChangeEnd = (date) => {
    const normalized = normalizeToMidday(date);
    setEndDate(normalized);
    if (!sDate || normalized <= sDate) {
      const newStart = new Date(normalized);
      newStart.setDate(newStart.getDate() - 1);
      setStartDate(normalizeToMidday(newStart));
    }
  };

  // Convertir disabledRanges en objetos Date válidos
  const excludedIntervals = (disabledRanges || [])
    .map((r) => {
      if (r && r.start && r.end) {
        return { start: toDate(r.start), end: toDate(r.end) };
      }
      const d = toDate(r);
      if (d) {
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        return { start: d, end };
      }
      return null;
    })
    .filter(Boolean);

  const excludeDatesArray = excludedIntervals.flatMap(({ start, end }) => {
    const arr = [];
    let cur = new Date(start);
    while (cur <= end) {
      arr.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return arr;
  });

  return (
    <div>
      <p className="precio-noche">
        <strong>${pricePerNight}</strong> por {nights} noches
      </p>

      <div className="campo-fecha">
        <label htmlFor="entrada"><strong>Entrada</strong></label>
        <div className="datepicker-wrapper">
          <DatePicker
          id="entrada"
          selected={sDate}
          onChange={onChangeStart}
          selectsStart
          startDate={sDate}
          endDate={eDate}
          minDate={new Date()}
          excludeDates={excludeDatesArray}
          className="input-fecha"
          calendarClassName="calendario-popup"
          locale={es}
          dateFormat="dd 'de' MMMM, yyyy"
        />
        
        </div>
        
      </div>

      <div className="campo-fecha">
        <label htmlFor="salida"><strong>Salida</strong></label>
        
        <DatePicker
          id="salida"
          selected={eDate}
          onChange={onChangeEnd}
          selectsEnd
          startDate={sDate}
          endDate={eDate}
          minDate={sDate || new Date()}
          excludeDates={excludeDatesArray}
          className="input-fecha"
          calendarClassName="calendario-popup"
          locale={es}
          dateFormat="dd 'de' MMMM, yyyy"
        />
      </div>
    </div>
  );
};

export default ReservaCard;
