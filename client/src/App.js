import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateRule from './components/CreateRule';
import CombineRules from './components/CombineRules';
import EvaluateRule from './components/EvaluateRule';
import 'bootstrap/dist/css/bootstrap.min.css';

// A function to check if the user is authenticated
const isAuthenticated = () => !!localStorage.getItem('token');

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/*"
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />}
        >
          {/* Redirect dashboard root to /dashboard/create-rule */}
          <Route path="" element={<Navigate to="create-rule" />} />
          <Route path="create-rule" element={<CreateRule />} />
          <Route path="combine-rules" element={<CombineRules />} />
          <Route path="evaluate-rule" element={<EvaluateRule />} />
        </Route>
        {/* Default route */}
        <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
