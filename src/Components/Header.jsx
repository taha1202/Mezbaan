import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = ({ setSuccessfulLogin }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current route
  const user = JSON.parse(sessionStorage.getItem("user"));
  const username = user?.name || "Guest";
  const profilePic =
    user?.image ||
    "https://images.squarespace-cdn.com/content/v1/5936fbebcd0f68f67d5916ff/ba2c0779-5487-494a-b93b-f3bf288d40c6/person-placeholder-300x300.jpeg";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    sessionStorage.clear();
    setSuccessfulLogin(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <header className="mb-5 border-bottom nav-bar">
      <div className="head-container">
        <div className="header-cont">
          <h2 className="text-white husername">{username}</h2>
          <div>
            <ul className="nav nav-pills flex-row h6 mt-3">
              <li className="nav-item nav-hover mb-3">
                <a
                  onClick={() => navigate("/displayall")}
                  className={`nav-link text-white ${
                    location.pathname === "/displayall" ? "active" : ""
                  }`}
                >
                  Dashboard
                </a>
              </li>
              <li className="nav-item nav-hover mb-3">
                <a
                  onClick={() => navigate("/bookings")}
                  className={`nav-link text-white ${
                    location.pathname === "/bookings" ? "active" : ""
                  }`}
                >
                  My Bookings
                </a>
              </li>
            </ul>
          </div>
          <div className="header-profile">
            <div
              className="header-avatar-container"
              data-bs-toggle="dropdown"
              aria-expanded={isDropdownOpen}
              onClick={toggleDropdown}
            >
              <img src={profilePic} alt={username} className="header-avatar" />
            </div>
            <ul
              className={`header-dropdown-menu ${
                isDropdownOpen ? "show" : ""
              }`}
            >
              <li>
                <button
                  className="header-dropdown-item"
                  onClick={handleProfileClick}
                >
                  Profile
                </button>
              </li>
              <li>
                <hr className="header-dropdown-divider" />
              </li>
              <li>
                <button
                  className="header-dropdown-item"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;