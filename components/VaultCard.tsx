import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseEther, formatEther } from 'ethers';
import {
  TrendingUp,
  DollarSign,
  Users,
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';
import { useFluidVault } from '../hooks/useFluidVault';
import { useTransactionConfirmation } from '../hooks/useTransactionConfirmation';
import { useTokenApproval } from '../hooks/useTokenApproval';

interface VaultCardProps {
  name: string;
  apy: number;
  tvl: string;
  token: string;
  address: string;
}

export default function VaultCard({ name, apy, tvl, token, address }: VaultCardProps) {
  const { address: userAddress, isConnected } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState('0.00');
  const [accruedInterest, setAccruedInterest] = useState('0.00');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use the transaction confirmation hook
  const { isConfirming, isConfirmed, error: txError } = useTransactionConfirmation(txHash);
  
  // Use the token approval hook
  const { approveToken, isApproving, approvalError } = useTokenApproval();
  
  const { 
    deposit, 
    withdraw, 
    getCurrentInterest, 
    getUserDeposit,
    isLoading: hookLoading,
    contractAddress
  } = useFluidVault();

  // Load user data when connected
  useEffect(() => {
    if (isConnected && userAddress) {
      loadUserData();
    }
  }, [isConnected, userAddress, address]);

  // Reload user data when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      loadUserData();
    }
  }, [isConfirmed]);

  const loadUserData = async () => {
    try {
      const depositInfo = await getUserDeposit(address);
      const interest = await getCurrentInterest(address);
      
      if (depositInfo) {
        setUserBalance(depositInfo.amount);
        setAccruedInterest(interest);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleDeposit = async () => {
    if (!isConnected || !depositAmount || !contractAddress) return;
    
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    
    try {
      console.log('Depositing:', depositAmount, token, 'to vault:', address);
      
      // Step 1: Approve token spending (if needed)
      // Note: In a real implementation, you would check the current allowance first
      // For demo purposes, we'll always approve
      console.log('Approving token spending...');
      const approvalHash = await approveToken(address, contractAddress, depositAmount);
      console.log('Token approval submitted:', approvalHash);
      
      // Step 2: Wait for approval confirmation (simplified for demo)
      // In production, you would wait for the approval transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Call the deposit function
      const hash = await deposit(address, depositAmount);
      setTxHash(hash);
      
      console.log('Deposit transaction submitted:', hash);
      
      // Clear the form immediately
      setDepositAmount('');
      
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setError(error.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !withdrawAmount) return;
    
    setIsLoading(true);
    setError(null);
    setTxHash(null);
    
    try {
      console.log('Withdrawing:', withdrawAmount, token, 'from vault:', address);
      
      // Call the real withdraw function
      const hash = await withdraw(address, withdrawAmount);
      setTxHash(hash);
      
      console.log('Withdraw transaction submitted:', hash);
      
      // Clear the form immediately
      setWithdrawAmount('');
      
      // Reload user data when transaction is confirmed
      if (isConfirmed) {
        loadUserData();
      }
      
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      setError(error.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">{token}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{token} Vault</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs text-green-600 font-medium">Live Somnia Testnet</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <Minus className="w-4 h-4 text-gray-600" />
          ) : (
            <Plus className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">APY</span>
          </div>
          <p className="text-lg font-bold text-green-700">{apy}%</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-sm font-medium text-blue-600">TVL</span>
          </div>
          <p className="text-lg font-bold text-blue-700">{tvl}</p>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Deposit Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit {token}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setDepositAmount('100')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Max
              </button>
                     <button
                       onClick={handleDeposit}
                       disabled={!isConnected || !depositAmount || isLoading || isApproving || parseFloat(depositAmount) <= 0}
                       className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                     >
                       {(isLoading || isApproving) ? (
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       ) : (
                         <>
                           <Plus className="w-4 h-4 mr-1" />
                           {isApproving ? 'Approving...' : 'Deposit'}
                         </>
                       )}
                     </button>
            </div>
          </div>

          {/* Withdraw Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdraw {token}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={userBalance}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setWithdrawAmount(userBalance)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Max
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!isConnected || !withdrawAmount || isLoading || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(userBalance)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Minus className="w-4 h-4 mr-1" />
                    Withdraw
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Balance */}
          {isConnected && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your Balance:</span>
                <span className="font-medium">{userBalance} {token}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Accrued Interest:</span>
                <span className="font-medium text-green-600">{accruedInterest} {token}</span>
              </div>
            </div>
          )}

          {/* Transaction Status */}
          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="text-sm text-green-700">
                    {isConfirming ? 'Confirming on Somnia testnet...' : isConfirmed ? 'Transaction confirmed on Somnia!' : 'Transaction submitted to Somnia testnet'}
                  </span>
                </div>
                <a 
                  href={`https://shannon-explorer.somnia.network/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 text-sm underline flex items-center"
                >
                  View on Somnia Explorer
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <div className="mt-2 text-xs text-green-600">
                <strong>Real Somnia Testnet Transaction:</strong> This transaction is processed on the live Somnia network (Chain ID: 50312)
              </div>
            </div>
          )}

                 {/* Error Message */}
                 {(error || txError || approvalError) && (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                     <div className="flex items-center">
                       <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                       </svg>
                       <span className="text-sm text-red-700">{error || txError || approvalError}</span>
                     </div>
                   </div>
                 )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center">
              View Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!isExpanded && (
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Deposit
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
          >
            <Minus className="w-4 h-4 mr-1" />
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
}
