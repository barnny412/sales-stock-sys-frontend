import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const showError = useCallback((message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  }, []);
  
  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  }, []);
  
  const clearError = useCallback(() => setError(''), []);
  const clearSuccess = useCallback(() => setSuccessMessage(''), []);
  
  return { error, successMessage, showError, showSuccess, clearError, clearSuccess };
};