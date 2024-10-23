import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Import axios here
import Sidebar from './Sidebar';
import './../styles/Sidebar.css';

const Dashboard = () => {
  const [rules, setRules] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch rules function
  const fetchRules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rules/all');
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect to login if no token found
    }
    fetchRules(); // Fetch rules when the component mounts
  }, [navigate]);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/create-rule');
    }
  }, [location, navigate]);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Outlet context={{ fetchRules }} /> {/* Pass fetchRules to the Outlet */}
      </div>
    </div>
  );
};

export default Dashboard;
