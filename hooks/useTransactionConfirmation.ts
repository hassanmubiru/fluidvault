import { useState, useEffect } from 'react';
import { useWaitForTransaction } from 'wagmi';

export function useTransactionConfirmation(txHash: string | null) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: receipt, isLoading, error: txError } = useWaitForTransaction({
    hash: txHash as `0x${string}`,
    enabled: !!txHash,
  });

  useEffect(() => {
    if (txHash) {
      setIsConfirming(true);
      setIsConfirmed(false);
      setError(null);
    }
  }, [txHash]);

  useEffect(() => {
    if (receipt) {
      setIsConfirming(false);
      setIsConfirmed(true);
    }
  }, [receipt]);

  useEffect(() => {
    if (txError) {
      setIsConfirming(false);
      setError(txError.message || 'Transaction failed');
    }
  }, [txError]);

  return {
    isConfirming,
    isConfirmed,
    error,
    receipt,
    isLoading,
  };
}
