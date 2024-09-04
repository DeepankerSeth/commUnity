import { useState } from 'react';

interface ErrorState {
  message: string;
  code?: number;
}

const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = (err: any) => {
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      setError({
        message: err.response.data.error.message || 'An error occurred',
        code: err.response.status,
      });
    } else if (err.request) {
      // The request was made but no response was received
      setError({ message: 'No response from server' });
    } else {
      // Something happened in setting up the request that triggered an Error
      setError({ message: err.message || 'An error occurred' });
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};

export default useErrorHandler;