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
        
        // Пытаемся получить данные текущего пользователя
        // Сначала пробуем специальный эндпоинт /users/me/
        try {
          const response = await api.get('users/me/');
          console.log('Current user data:', response.data);
          setUser(response.data);
          setLoading(false);
          return;
        } catch (meError) {
          console.log('Endpoint /users/me/ not available, trying alternative...');
        }
        
        // Если /users/me/ нет, пробуем получить пользователя по id из токена
        // Для этого нужно расшифровать токен или использовать другой подход
        // Пока как запасной вариант - берём из localStorage сохранённого пользователя
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing saved user:', e);
          }
        }
        
        // Если ничего не помогло - пробуем получить список и найти пользователя по email
        // (не идеально, но как временное решение)
        const response = await api.get('users/');
        console.log('Users response:', response.data);
        
        const users = response.data.results || response.data;
        console.log('Extracted users:', users);
        
        // Пытаемся найти пользователя по email из токена (не надёжно, лучше использовать /me/)
        if (users && users.length > 0) {
          // Просто берём первого (для разработки)
          console.log('Setting user (fallback):', users[0]);
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
      const { token, user_id, username: userName, email, role, balance } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Пытаемся получить полные данные пользователя
      let userData;
      try {
        // Сначала пробуем /users/me/
        const userResponse = await api.get('users/me/');
        userData = userResponse.data;
      } catch (meError) {
        // Если нет /me/, получаем по id
        try {
          const userResponse = await api.get(`users/${user_id}/`);
          userData = userResponse.data;
        } catch (idError) {
          // Если ничего не работает, создаём объект из ответа логина
          userData = {
            id: user_id,
            username: userName,
            email: email,
            role: role,
            balance: balance || 0,
            phone: '',
            avatar: null
          };
        }
      }
      
      // Сохраняем пользователя в localStorage для восстановления при перезагрузке
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
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
      const updatedUser = response.data;
      
      // Обновляем в state и localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, data: updatedUser };
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
    localStorage.removeItem('user');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

    const updateBalance = (newBalance) => {
  const updatedUser = { ...user, balance: newBalance };
  setUser(updatedUser);
  localStorage.setItem('user', JSON.stringify(updatedUser));
};

const refreshUser = async () => {
  try {
    const response = await api.get('users/me/');
    setUser(response.data);
    localStorage.setItem('user', JSON.stringify(response.data));
  } catch (error) {
    console.error('Error refreshing user:', error);
  }
};

const updateUser = (userData) => {
  setUser(userData);
  localStorage.setItem('user', JSON.stringify(userData));
};

  const value = {
    user,
    login,
    register,
    updateProfile,
    updateUser,
    logout,
    loading,
    updateBalance,
    refreshUser,
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