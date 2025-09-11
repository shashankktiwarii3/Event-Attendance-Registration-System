import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid #2d3748;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: #e2e8f0;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(102, 126, 234, 0.2);
    color: #667eea;
  }
  
  ${props => props.active && `
    background-color: rgba(102, 126, 234, 0.3);
    color: #667eea;
  `}
`;

const Navbar = () => {
  const location = useLocation();

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">NSCC QR Events</Logo>
        <NavLinks>
          <NavLink to="/" active={location.pathname === '/' ? 1 : 0}>
            Home
          </NavLink>
          <NavLink to="/register" active={location.pathname === '/register' ? 1 : 0}>
            Register
          </NavLink>
          <NavLink to="/scanner" active={location.pathname === '/scanner' ? 1 : 0}>
            Scanner
          </NavLink>
          <NavLink to="/lookup" active={location.pathname === '/lookup' ? 1 : 0}>
            Lookup
          </NavLink>
          <NavLink to="/admin" active={location.pathname === '/admin' ? 1 : 0}>
            Admin
          </NavLink>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;
