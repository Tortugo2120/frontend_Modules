import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-white shadow-md">
      <div>
          {isAuthenticated && user ? (
            <>
              <button onClick={onLogout} className="border  px-4 py-1 bg-red-500 text-white rounded-md font-medium hover:bg-red-600">Salir</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
      </div>
    </nav>
  );
};

export default Navbar;
