import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: #1a1a2e;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  border: 1px solid #2d3748;
`;

const LoginTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #e2e8f0;
  font-size: 2rem;
  font-weight: 700;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e2e8f0;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: ${props => props.type === 'password' ? '3rem' : '1rem'};
  border: 2px solid #4a5568;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #2d3748;
  color: #e2e8f0;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const IconButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  
  &:hover {
    color: #e2e8f0;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple authentication - in production, this should be handled by the backend
      const validCredentials = {
        username: 'nscc_admin',
        password: 'secure123'
      };

      if (credentials.username === validCredentials.username && 
          credentials.password === validCredentials.password) {
        // Store authentication in localStorage
        localStorage.setItem('adminAuth', JSON.stringify({
          isAuthenticated: true,
          username: credentials.username,
          loginTime: new Date().toISOString()
        }));
        
        toast.success('Login successful!');
        onLogin(true);
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginTitle>Admin Login</LoginTitle>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">
              <User size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Username
            </Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              placeholder="Enter admin username"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">
              <Lock size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Password
            </Label>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                required
                placeholder="Enter admin password"
              />
              <IconButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </IconButton>
            </InputContainer>
          </FormGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </LoginButton>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#2d3748', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#a0aec0',
          border: '1px solid #4a5568'
        }}>
          <strong>Demo Credentials:</strong><br />
          Username: <code>nscc_admin</code><br />
          Password: <code>secure123</code>
        </div>
      </LoginCard>
    </LoginContainer>
  );
};

export default AdminLogin;
