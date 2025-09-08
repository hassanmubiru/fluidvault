import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Clock, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Star,
  Scissors,
  Plus,
  Minus
} from 'lucide-react';
import { useYieldStrategies, Strategy, UserPosition } from '../hooks/useYieldStrategies';

interface StrategyCardProps {
  strategy: Strategy;
  userPosition?: UserPosition;
  onDeposit?: (strategyId: number, amount: string, token: string) => void;
  onWithdraw?: (strategyId: number, shares: string, token: string) => void;
  onHarvest?: (strategyId: number) => void;
}

export default function StrategyCard({ 
  strategy, 
  userPosition, 
  onDeposit, 
  onWithdraw, 
  onHarvest 
}: StrategyCardProps) {
  const { address, isConnected } = useAccount();
  const { getRiskLevelDescription, getRiskLevelColor } = useYieldStrategies();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasPosition = userPosition && parseFloat(userPosition.shares) > 0;
  const riskColor = getRiskLevelColor(strategy.riskLevel);
  const riskDescription = getRiskLevelDescription(strategy.riskLevel);

  // Calculate performance metrics (simplified)
  const totalDeposits = parseFloat(strategy.totalDeposits);
  const totalWithdrawals = parseFloat(strategy.totalWithdrawals);
  const totalFees = parseFloat(strategy.totalFeesEarned);
  const netValue = totalDeposits - totalWithdrawals;
  const performance = netValue > 0 ? ((totalFees / netValue) * 100) : 0;

  const handleDeposit = async () => {
    if (!onDeposit || !depositAmount || !strategy.inputTokens[0]) return;
    
    setIsLoading(true);
    try {
      await onDeposit(strategy.id, depositAmount, strategy.inputTokens[0]);
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!onWithdraw || !withdrawAmount || !strategy.inputTokens[0]) return;
    
    setIsLoading(true);
    try {
      await onWithdraw(strategy.id, withdrawAmount, strategy.inputTokens[0]);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdraw failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHarvest = async () => {
    if (!onHarvest) return;
    
    setIsLoading(true);
    try {
      await onHarvest(strategy.id);
    } catch (error) {
      console.error('Harvest failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
              {riskDescription}
            </span>
            {strategy.isVerified && (
              <div className="flex items-center gap-1 text-blue-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              #{strategy.id}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {strategy.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {strategy.description}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {/* Strategy Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {performance.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Performance</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {strategy.riskLevel}/10
          </div>
          <div className="text-xs text-gray-500">Risk Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {parseFloat(strategy.totalDeposits).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Total Deposits</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {strategy.performanceFee / 100}%
          </div>
          <div className="text-xs text-gray-500">Performance Fee</div>
        </div>
      </div>

      {/* User Position */}
      {hasPosition && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900">Your Position</div>
              <div className="text-sm text-blue-700">
                {parseFloat(userPosition.amount).toFixed(4)} tokens
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700">
                {parseFloat(userPosition.shares).toFixed(4)} shares
              </div>
              <div className="text-xs text-blue-600">
                {parseFloat(userPosition.accumulatedFees).toFixed(4)} fees
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        {isConnected && (
          <>
            <button
              onClick={handleDeposit}
              disabled={isLoading || !strategy.isActive}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isLoading ? 'Depositing...' : 'Deposit'}
            </button>
            {hasPosition && (
              <>
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Minus className="w-4 h-4" />
                  {isLoading ? 'Withdrawing...' : 'Withdraw'}
                </button>
                <button
                  onClick={handleHarvest}
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  {isLoading ? 'Harvesting...' : 'Harvest'}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Strategy Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Strategy Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Creator:</span>
                <span className="ml-2 font-mono text-xs">
                  {strategy.creator.slice(0, 6)}...{strategy.creator.slice(-4)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Protocol:</span>
                <span className="ml-2 font-mono text-xs">
                  {strategy.targetProtocol.slice(0, 6)}...{strategy.targetProtocol.slice(-4)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Min Deposit:</span>
                <span className="ml-2">{parseFloat(strategy.minDeposit).toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-600">Max Deposit:</span>
                <span className="ml-2">{parseFloat(strategy.maxDeposit).toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-600">Management Fee:</span>
                <span className="ml-2">{(strategy.managementFee / 100).toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">
                  {new Date(strategy.createdAt * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Input/Output Tokens */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Tokens</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Input Tokens</div>
                <div className="flex flex-wrap gap-1">
                  {strategy.inputTokens.map((token, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {token.slice(0, 6)}...{token.slice(-4)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Output Tokens</div>
                <div className="flex flex-wrap gap-1">
                  {strategy.outputTokens.map((token, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {token.slice(0, 6)}...{token.slice(-4)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">
                  {parseFloat(strategy.totalDeposits).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Total Deposits</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">
                  {parseFloat(strategy.totalWithdrawals).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Total Withdrawals</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">
                  {parseFloat(strategy.totalFeesEarned).toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Fees Earned</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-semibold text-gray-900">
                  {strategy.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-gray-600">Status</div>
              </div>
            </div>
          </div>

          {/* Deposit/Withdraw Forms */}
          {isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={isLoading || !depositAmount || !strategy.isActive}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Deposit
                  </button>
                </div>
              </div>
              
              {hasPosition && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdraw Shares
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      max={userPosition.shares}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleWithdraw}
                      disabled={isLoading || !withdrawAmount}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
