import React from "react";
import Navbar from "../Navbar";
import Header from "../Header";
import Footer from "../Footer";
import WhatsappBubble from "../WhatsappBubble";

const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <WhatsappBubble />
      <Footer />
    </>
  );
};

export default PublicLayout;
