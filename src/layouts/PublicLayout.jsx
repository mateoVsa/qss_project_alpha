import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import WhatsappBubble from "../WhatsappBubble";

const PublicLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      
        {children}
      

      <WhatsappBubble />
      <Footer />
    </div>
  );
};

export default PublicLayout;
