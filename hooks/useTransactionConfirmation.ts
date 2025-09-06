import { useState, useEffect } from 'react';

export function useTransactionConfirmation(txHash: string | null) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (txHash) {
      setIsConfirming(true);
      setIsConfirmed(false);
      setError(null);

      // Simulate transaction confirmation for mock transactions
      // In a real implementation, you would use useWaitForTransaction
      const timer = setTimeout(() => {
        setIsConfirming(false);
        setIsConfirmed(true);
        setError(null);
      }, 3000); // 3 second simulation

      return () => clearTimeout(timer);
    } else {
      setIsConfirming(false);
      setIsConfirmed(false);
      setError(null);
    }
  }, [txHash]);

  return {
    isConfirming,
    isConfirmed,
    error,
    receipt: isConfirmed ? { status: 'success' } : null,
    isLoading: isConfirming,
  };
}
