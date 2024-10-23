import React from 'react';
import { FaSignOutAlt, FaRegFileAlt, FaRegHandshake, FaRegListAlt } from 'react-icons/fa'; // Importing additional icons
import 'bootstrap/dist/css/bootstrap.min.css';
import './../styles/Sidebar.css';  // Make sure the CSS file is correctly referenced
import { useLocation, Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    navigate('/login'); // Navigate to login page
  };

  return (
    <div className="sidebar bg-dark text-white">
      <div className="sidebar-header p-3">
        <h6 className="sidebar-title">Rule Engine with AST</h6>
      </div>
      <ul className="list-unstyled">
        <li className={`sidebar-item ${location.pathname.includes('/dashboard/create-rule') ? 'active' : ''}`}>
          <Link to="/dashboard/create-rule" className="sidebar-link">
            <FaRegFileAlt className="sidebar-icon" /> Create Rule
          </Link>
        </li>
        <div className="divider"></div>
        <li className={`sidebar-item ${location.pathname.includes('/dashboard/combine-rules') ? 'active' : ''}`}>
          <Link to="/dashboard/combine-rules" className="sidebar-link">
            <FaRegHandshake className="sidebar-icon" /> Combine Rules
          </Link>
        </li>
        <div className="divider"></div>
        <li className={`sidebar-item ${location.pathname.includes('/dashboard/evaluate-rule') ? 'active' : ''}`}>
          <Link to="/dashboard/evaluate-rule" className="sidebar-link">
            <FaRegListAlt className="sidebar-icon" /> Evaluate Rule
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link logout">
          <FaSignOutAlt className="sidebar-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
