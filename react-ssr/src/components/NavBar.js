import React from "react";
import { NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <div>
      <NavLink to="/home">Home</NavLink>&nbsp;
      <NavLink to="/content">Content</NavLink>
    </div>
  );
}

export default NavBar;
