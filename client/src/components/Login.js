import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

        const { token } = response.data;
        
        // Store the token in local storage
        localStorage.setItem('token', token);
  
        // Redirect to the dashboard
        navigate('/dashboard');
      } catch (error) {
        if (error.response) {
          setErrorMessage(error.response.data.message || 'Login failed');
          console.error('Login error:', error.response.data);
        } else {
          setErrorMessage('Login failed');
          console.error('Login error:', error);
        }
      }
      
    };
  
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <form onSubmit={handleLogin} className="p-4 border rounded">
          <h3>Login</h3>
          <br />
          {errorMessage && <p className="text-danger">{errorMessage}</p>}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder='Enter Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                className="form-control"
                placeholder='Enter Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="input-group-append">
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i> {/* Eye icon */}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-3">Login</button>
        </form>
      </div>
    );
};

export default Login;
