import React from "react";
import Navbar from "./Navbar";
import PosNavbar from "./PosNavbar";
import "../assets/styles/layout.css";

const Layout = ({ children, usePosNavbar = false }) => {
  return (
    <div className="layout">
      {usePosNavbar && (
        <div className="pos-navbar-wrapper">
          <PosNavbar />
        </div>
      )}
      {!usePosNavbar && (
        <div className="main-navbar-wrapper">
          <Navbar />
        </div>
      )}
      <div className="content">{children}</div>
    </div>
  );
};

export default Layout;
