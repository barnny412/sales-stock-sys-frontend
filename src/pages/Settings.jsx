import React, { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { fetchCashflowOpeningBalances, saveCashflowOpeningBalance, resetDatabase, resetProductsTable, resetCashflowTable } from '../api/cashFlowAPI'; // Updated imports
import '../assets/styles/Settings.css';

const Settings = () => {
  const [cigarettesBalance, setCigarettesBalance] = useState('');
  const [breadTomatoBalance, setBreadTomatoBalance] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBalances = async () => {
      try {
        const balances = await fetchCashflowOpeningBalances();
        setCigarettesBalance(balances.cigarette || '');
        setBreadTomatoBalance(balances.bread_tomato || '');
      } catch (error) {
        setError(error.message || 'Failed to load opening balances');
      }
    };
    loadBalances();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const balances = [
      { category: 'cigarette', value: cigarettesBalance },
      { category: 'bread_tomato', value: breadTomatoBalance },
    ];

    for (const { category, value } of balances) {
      if (value === '' || isNaN(value) || Number(value) < 0) {
        setError(`Please enter a valid non-negative number for ${category === 'cigarette' ? 'Cigarettes' : 'Bread/Tomato'}`);
        return;
      }
    }

    try {
      for (const { category, value } of balances) {
        await saveCashflowOpeningBalance(category, Number(value));
      }
      setMessage('Opening balances saved successfully');
    } catch (error) {
      setError(error.message || 'Failed to save opening balances');
    }
  };

  // Reset entire database
  const handleResetDatabase = async () => {
    if (!window.confirm('Are you sure you want to reset the entire database? This will delete all data and cannot be undone.')) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await resetDatabase();
      setMessage('Database reset successfully');
    } catch (error) {
      setError(error.message || 'Failed to reset database');
    }
  };

  // Reset products table
  const handleResetProductsTable = async () => {
    if (!window.confirm('Are you sure you want to reset the products table? This will delete all product data and cannot be undone.')) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await resetProductsTable();
      setMessage('Products table reset successfully');
    } catch (error) {
      setError(error.message || 'Failed to reset products table');
    }
  };

  // Reset cashflow table
  const handleResetCashflowTable = async () => {
    if (!window.confirm('Are you sure you want to reset the cashflow table? This will delete all cashflow data and cannot be undone.')) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await resetCashflowTable();
      setMessage('Cashflow table reset successfully');
    } catch (error) {
      setError(error.message || 'Failed to reset cashflow table');
    }
  };

  return (
    <Container className="settings-container">
      <h1 className="settings-title">Settings</h1>

      {/* Cashflow Opening Balances Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Cashflow Opening Balances</h2>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="cigarettesBalance">Cigarettes Opening Balance (K)</label>
            <input
              type="number"
              id="cigarettesBalance"
              value={cigarettesBalance}
              onChange={(e) => setCigarettesBalance(e.target.value)}
              placeholder="Enter amount"
              className="form-input"
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="breadTomatoBalance">Bread/Tomato Opening Balance (K)</label>
            <input
              type="number"
              id="breadTomatoBalance"
              value={breadTomatoBalance}
              onChange={(e) => setBreadTomatoBalance(e.target.value)}
              placeholder="Enter amount"
              className="form-input"
              step="0.01"
              min="0"
            />
          </div>
          <button type="submit" className="save-btn">Save Balances</button>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>

      {/* Database Reset Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Reset Database</h2>
        <div className="settings-form">
          <button onClick={handleResetDatabase} className="reset-btn reset-all-btn">
            Reset Entire Database
          </button>
          <button onClick={handleResetProductsTable} className="reset-btn reset-products-btn">
            Reset Products Table
          </button>
          <button onClick={handleResetCashflowTable} className="reset-btn reset-cashflow-btn">
            Reset Cashflow Table
          </button>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </Container>
  );
};

export default Settings;