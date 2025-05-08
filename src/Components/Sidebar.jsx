import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ currentPage, setPage }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const path = location.pathname.substring(1);
        setPage(path.charAt(0).toUpperCase() + path.slice(1));
    }, [location, setPage]);

    const handleNavigation = (page) => {
        setPage(page);
        navigate(`/${page.toLowerCase()}`);
        setSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        // Clear the sessionStorage
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        // Navigate to the login page
        navigate('/login');
    };

    return (
        <>
            <button
                className="btn btn-secondary d-md-none"
                onClick={toggleSidebar}
                style={{
                    position: 'fixed',
                    top: '10px',
                    left: '10px',
                    zIndex: 1050,
                }}
            >
                ☰
            </button>
            <div className={`d-flex flex-column p-3 text-bg-dark sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button
                    className="btn btn-close btn-close-white d-md-none align-self-end"
                    onClick={toggleSidebar}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                    }}
                ></button>
                <span className="fs-4">Mezbaan</span>
                <hr />
                <ul className="nav nav-pills flex-column">
                    <li className="nav-item nav-hover mb-3">
                        <a
                            onClick={() => handleNavigation("Dashboard")}
                            className={`nav-link text-white ${currentPage === 'Dashboard' ? 'active' : ''}`}
                        >
                            Dashboard
                        </a>
                    </li>
                    <li className="nav-item nav-hover mb-3">
                        <a
                            onClick={() => handleNavigation("Services")}
                            className={`nav-link text-white ${currentPage === 'Services' ? 'active' : ''}`}
                        >
                            Services
                        </a>
                    </li>
                    <li className="nav-hover mb-3">
                        <a
                            onClick={() => handleNavigation("Bookings")}
                            className={`nav-link text-white ${currentPage === 'Bookings' ? 'active' : ''}`}
                        >
                            Bookings
                        </a>
                    </li>
                    <li className="nav-hover mb-3">
                        <a
                            onClick={() => handleNavigation("AddPage")}
                            className={`nav-link text-white ${currentPage === 'AddPage' ? 'active' : ''}`}
                        >
                            Add Service
                        </a>
                    </li>
                </ul>
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="btn btn-danger mt-auto"
                    style={{ position: 'absolute', bottom: '20px', width: '80%' }}
                >
                    Log Out
                </button>
            </div>
        </>
    );
};

export default Sidebar;
