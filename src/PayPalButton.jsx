import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PayPalButton({ reservaId, monto, onSuccess }) {

  const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate()
  const [bloqueado, setBloqueado] = useState(false);

  return (
    <PayPalButtons
      style={{ layout: "vertical" }}
      disabled={bloqueado}
      forceReRender={[monto,reservaId,bloqueado]}

      /** Crear orden en el BACKEND */
      createOrder={async () => {

        if(bloqueado){
          throw new Error("Pago ya en proceso")
        }
        try {
          const res = await axios.post(`${api}/paypal/create-order`, {
            reservaId,
            monto
          });

          return res.data.orderID; // PayPal necesita devolver el orderID
        } catch (error) {
          console.error("Error al crear la orden:", error);
          navigate(`/pago-fallido/${reservaId}`)
          throw error;
        }
      }}

      /** Capturar el pago en el BACKEND */
      onApprove={async (data) => {
        try {
          setBloqueado(true)
          const res = await axios.post(`${api}/paypal/capture-order`, {
            reservaId,
            orderID: data.orderID
          });

          onSuccess(res.data);
          navigate(`/pago-exitoso/${reservaId}`); // Le pasas al componente padre la info del pago
          return res.data;
        } catch (error) {
          console.error("Error al capturar la orden:", error);
          navigate(`/pago-fallido/${reservaId}`)
          throw error;
        }
      }}

      //Usuairo cancela el pago
      onCancel={()=>{
        console.warn("Pago cancelado por el usuario");
        navigate(`/pago-fallido/${reservaId}`)
      }}

      //error general paypal

      onError={(err)=>{
        console.error("Error PayPal:",err)
        navigate(`/pago-fallido/${reservaId}`)
      }}
    />
  );
}
