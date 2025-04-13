import React from "react";
import Navbar from "./Navbar";
import "../assets/styles/layout.css"; // Import CSS

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="content">{children}</div>
    </div>
  );
};

export default Layout;
