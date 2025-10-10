import React from "react";

const WhatsappBubble = () => {
  const phoneNumber = "593991633631";

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-bubble"
    >
      <i className="bi bi-whatsapp"></i>
    </a>
  );
};

export default WhatsappBubble;
