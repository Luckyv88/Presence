import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import "../styles/home.css";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      {/* Horizontal Navbar */}
      <div className="navbar-horizontal">
        <h2>Presence</h2>
        {user && (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      {/* Vertical Navbar */}
      <div className="navbar-vertical">
        <button title="Home" onClick={() => navigate("/")}>🏠</button>
        <button title="Friends" onClick={() => navigate("/friends/add")}>👥</button>
        <button title="Settings">⚙️</button>
      </div>
    </>
  );
};

export default Navbar;
