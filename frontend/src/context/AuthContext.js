import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { apiForm } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Устанавливаем токен для запросов
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        
        // Получаем список пользователей
        const response = await api.get('users/');
        console.log('Users response:', response.data);
        
        // Извлекаем массив пользователей (с учётом пагинации)
        const users = response.data.results || response.data;
        console.log('Extracted users:', users);
        
        // Для теста берём первого пользователя
        if (users && users.length > 0) {
          console.log('Setting user:', users[0]);
          setUser(users[0]);
        } else {
          console.log('No users found');
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('login/', { username, password });
      const { token, user_id, username: userName, email, role } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Создаём объект пользователя из ответа логина
      const userData = {
        id: user_id,
        username: userName,
        email: email || '',
        role: role || 'buyer',
        phone: ''
      };
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Ошибка входа' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('register/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data || 'Ошибка регистрации' 
      };
    }
  };

  const updateProfile = async (formData) => {
    try {
      const response = await apiForm.patch('profile/', formData);
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update profile error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data || 'Ошибка обновления профиля' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    login,
    register,
    updateProfile,
    logout,
    loading,
    isAuthenticated: !!user,
    isSeller: user?.role === 'seller',
    isBuyer: user?.role === 'buyer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};