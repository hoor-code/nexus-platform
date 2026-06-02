import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserRole } from '../types'; // Adjust if your types path differs

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Direct target URL to your working local backend port
const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // On initial load, verify if a session persistent token exists
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role') as UserRole;
    const savedName = localStorage.getItem('name');

    if (savedToken && savedRole && savedName) {
      setToken(savedToken);
      setUser({ name: savedName, email: '', role: savedRole });
    }
  } , []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // Send matching body keys directly to our express auth controller endpoint
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      const { token: receivedToken, role: receivedRole, name } = response.data;

      // Safety check: verify user is signing into the context profile they selected on screen
      if (receivedRole !== role) {
        throw new Error(`Account found, but it is not registered as an ${role}.`);
      }

      // Persist values to localStorage so refresh doesn't break state
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('role', receivedRole);
      localStorage.setItem('name', name);

      setToken(receivedToken);
      setUser({ name, email, role: receivedRole });
    } catch (error: any) {
      // Intercept express server messages or fallback to default
      const serverMessage = error.response?.data?.message || 'Failed to authenticate with server.';
      throw new Error(serverMessage);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be nested within an AuthProvider');
  return context;
};