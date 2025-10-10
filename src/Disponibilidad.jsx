import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

const Disponibilidad = ({ startDate, endDate, setStartDate, setEndDate, disabledRanges = [] }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="custom-datepicker-wrapper d-flex justify-content-center">
      <DatePicker
        selected={startDate}
        onChange={(dates) => {
          const [start, end] = dates;
          setStartDate(start);
          setEndDate(end);
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        inline
        monthsShown={2}
        minDate={today}
        excludeDates={disabledRanges}
        calendarClassName="custom-datepicker"
        locale={es}
      />
    </div>
  );
};

export default Disponibilidad;
