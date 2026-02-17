import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Wallet.css';

const Wallet = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWalletData();
  }, [isAuthenticated, navigate]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // TODO: создать эндпоинты для кошелька
      // Пока используем заглушку
      setBalance(1500);
      setTransactions([
        { id: 1, date: '2026-02-17', type: 'deposit', amount: 500, description: 'Пополнение с карты' },
        { id: 2, date: '2026-02-16', type: 'payment', amount: -350, description: 'Оплата заказа №123' },
        { id: 3, date: '2026-02-15', type: 'deposit', amount: 1000, description: 'Пополнение' },
        { id: 4, date: '2026-02-14', type: 'payment', amount: -150, description: 'Оплата заказа №120' },
      ]);
    } catch (err) {
      console.error('Ошибка загрузки кошелька:', err);
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
    try {
      // TODO: реальный запрос к API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBalance(prev => prev + amount);
      setTransactions(prev => [
        {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          type: 'deposit',
          amount: amount,
          description: 'Пополнение'
        },
        ...prev
      ]);
      
      setDepositAmount('');
      alert('Кошелёк пополнен!');
    } catch (err) {
      console.error('Ошибка пополнения:', err);
      alert('Не удалось пополнить кошелёк');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
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
            <span className="balance-amount">{balance} ₽</span>
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
        </div>
        
        <div className="wallet-transactions-card">
          <h2>История операций</h2>
          
          {transactions.length === 0 ? (
            <p className="no-transactions">Нет операций</p>
          ) : (
            <div className="transactions-list">
              {transactions.map(transaction => (
                <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-date">{transaction.date}</div>
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