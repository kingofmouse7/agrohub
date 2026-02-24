import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Wallet.css';

const Wallet = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [isAuthenticated, navigate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('wallet/transactions/');
      setTransactions(response.data);
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
      setError('Не удалось загрузить историю операций');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    setProcessing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Сессия истекла. Войдите снова.');
        navigate('/login');
        return;
      }

      console.log('💰 Отправляем запрос на пополнение:', amount);
      
      // Отправляем запрос
      const response = await api.post('wallet/deposit/', { amount });
      
      console.log('✅ Ответ сервера:', response.data);
      console.log('Статус:', response.status);
      
      // Даже если статус не 200, но данные пришли
      if (response.data && response.data.balance !== undefined) {
        // Обновляем пользователя в контексте
        const updatedUser = {
          ...user,
          balance: response.data.balance
        };
        
        // Сохраняем в localStorage и обновляем контекст
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser);
        
        // Обновляем историю транзакций
        await fetchTransactions();
        
        setDepositAmount('');
        alert(`✅ Кошелёк пополнен на ${amount} ₽!`);
      } else {
        throw new Error('Неверный формат ответа');
      }
      
    } catch (err) {
      console.error('❌ Ошибка пополнения:', err);
      console.error('Детали:', err.response?.data);
      console.error('Статус ошибки:', err.response?.status);
      
      // Если ошибка, но деньги могли начислиться
      if (err.response?.status === 500) {
        alert('⚠️ Сервер вернул ошибку, но возможно деньги начислились. Проверьте баланс через минуту.');
        
        // Пробуем получить актуальный баланс
        try {
          const userResponse = await api.get('users/me/');
          const updatedUser = userResponse.data;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          updateUser(updatedUser);
          await fetchTransactions();
        } catch (e) {
          console.error('Не удалось получить актуальный баланс');
        }
      } else if (err.response?.status === 401) {
        alert('Сессия истекла. Войдите снова.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.response?.data?.error) {
        alert(`Ошибка: ${err.response.data.error}`);
      } else if (err.code === 'ERR_NETWORK') {
        alert('Сервер не отвечает. Проверьте подключение.');
      } else {
        alert('Не удалось пополнить кошелёк. Попробуйте позже.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  if (!user) {
    return (
      <div className="wallet-loading">
        <div className="loader"></div>
        <p>Загружаем кошелёк...</p>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <h1 className="wallet-title">💰 Мой кошелёк</h1>
      
      <div className="wallet-container">
        <div className="wallet-balance-card">
          <div className="balance-icon">💰</div>
          <div className="balance-info">
            <span className="balance-label">Текущий баланс</span>
            <span className="balance-amount">
              {user.balance ? Number(user.balance).toFixed(2) : '0'} ₽
            </span>
          </div>
        </div>
        
        <div className="wallet-deposit-card">
          <h2>Пополнить кошелёк</h2>
          <form onSubmit={handleDeposit} className="deposit-form">
            <div className="deposit-input-group">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Сумма"
                min="1"
                step="1"
                required
                disabled={processing}
                className="deposit-input"
              />
              <span className="deposit-currency">₽</span>
            </div>
            <button 
              type="submit" 
              className="deposit-btn"
              disabled={processing}
            >
              {processing ? 'Обработка...' : 'Пополнить'}
            </button>
          </form>
          <p className="deposit-note">* Средства списываются с тестовой карты</p>
        </div>
        
        <div className="wallet-transactions-card">
          <h2>История операций</h2>
          
          {loading ? (
            <div className="transactions-loading">
              <div className="loader-small"></div>
              <p>Загрузка истории...</p>
            </div>
          ) : error ? (
            <div className="transactions-error">
              <p>{error}</p>
              <button onClick={fetchTransactions} className="retry-btn">
                Повторить
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <p className="no-transactions">Нет операций</p>
          ) : (
            <div className="transactions-list">
              {transactions.map(transaction => (
                <div key={transaction.id} className={`transaction-item ${transaction.transaction_type}`}>
                  <div className="transaction-date">{formatDate(transaction.created_at)}</div>
                  <div className="transaction-description">{transaction.description}</div>
                  <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} ₽
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="wallet-actions">
          <Link to="/profile" className="wallet-action-btn">
            👤 В профиль
          </Link>
          <Link to="/categories" className="wallet-action-btn">
            🛒 К покупкам
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wallet;