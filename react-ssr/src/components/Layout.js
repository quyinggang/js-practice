import React from "react";
import NavBar from "./NavBar";
import { renderRoutes } from "react-router-config";

const Layout = ({ route }) => {
  return (
    <div>
      <NavBar />
      {renderRoutes(route.routes)}
    </div>
  );
};

export default Layout;
