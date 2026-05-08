import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import User from '../models/User';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const userData = await User.getCurrentUser();
        if (userData) {
          setUser({
            id: userData.getId(),
            email: userData.getEmail(),
            fullName: userData.getFullName(),
            role: userData.getRole(),
            grade: userData.getGrade?.()
          });
        } else {
          localStorage.removeItem('accessToken');
        }
      } catch (err) {
        console.error('Init auth error:', err);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await User.login(email, password);
    const token = response.accessToken;
    
    if (token) {
      localStorage.setItem('accessToken', token);
      setUser({
        id: response.userId,
        email: email,
        fullName: response.fullName,
        role: response.role,
        grade: response.grade
      });
      return response;
    }
    throw new Error('Ошибка входа');
  };

  const register = async (email, password, fullName, role, grade) => {
    const response = await User.register(email, password, fullName, role, grade);
    
    const token = response.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
      setUser({
        id: response.userId,
        email,
        fullName,
        role,
        grade
      });
      return response;
    }
    throw new Error('Ошибка регистрации');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};