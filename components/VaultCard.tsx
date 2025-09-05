import { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ArrowRight,
  Plus,
  Minus
} from 'lucide-react';

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

  const handleDeposit = async () => {
    if (!isConnected || !depositAmount) return;
    
    setIsLoading(true);
    try {
      // TODO: Implement deposit logic
      console.log('Depositing:', depositAmount, token);
      // await depositToVault(address, depositAmount);
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !withdrawAmount) return;
    
    setIsLoading(true);
    try {
      // TODO: Implement withdraw logic
      console.log('Withdrawing:', withdrawAmount, token);
      // await withdrawFromVault(address, withdrawAmount);
    } catch (error) {
      console.error('Withdrawal failed:', error);
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleDeposit}
                disabled={!isConnected || !depositAmount || isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Deposit
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleWithdraw}
                disabled={!isConnected || !withdrawAmount || isLoading}
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
                <span className="font-medium">0.00 {token}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Accrued Interest:</span>
                <span className="font-medium text-green-600">0.00 {token}</span>
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
