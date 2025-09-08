import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Lock, 
  Unlock, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users
} from 'lucide-react';

interface EscrowManagerProps {
  className?: string;
}

interface EscrowPosition {
  amount: string;
  timestamp: number;
  releaseTime: number;
  released: boolean;
  slashingRisk: number;
}

interface RewardsInfo {
  totalEarned: string;
  totalClaimed: string;
  lastClaimTime: number;
  pendingRewards: string;
}

export const EscrowManager: React.FC<EscrowManagerProps> = ({ className = '' }) => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escrowPositions, setEscrowPositions] = useState<EscrowPosition[]>([]);
  const [totalEscrowed, setTotalEscrowed] = useState<string>('0');
  const [totalReleased, setTotalReleased] = useState<string>('0');
  const [totalSlashed, setTotalSlashed] = useState<string>('0');
  const [rewardsInfo, setRewardsInfo] = useState<RewardsInfo | null>(null);
  const [escrowAmount, setEscrowAmount] = useState<string>('');
  const [isEscrowing, setIsEscrowing] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Mock data for demonstration
  const mockEscrowPositions: EscrowPosition[] = [
    {
      amount: '1000',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      releaseTime: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4 days from now
      released: false,
      slashingRisk: 10
    },
    {
      amount: '500',
      timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
      releaseTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago (ready for release)
      released: false,
      slashingRisk: 5
    }
  ];
  
  const mockRewardsInfo: RewardsInfo = {
    totalEarned: '25.5',
    totalClaimed: '20.0',
    lastClaimTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    pendingRewards: '5.5'
  };
  
  // Load escrow data
  useEffect(() => {
    const loadEscrowData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, this would call the escrow contract
        // For now, we'll use mock data
        setEscrowPositions(mockEscrowPositions);
        setTotalEscrowed('1500');
        setTotalReleased('0');
        setTotalSlashed('0');
        setRewardsInfo(mockRewardsInfo);
        
      } catch (err) {
        console.error('Error loading escrow data:', err);
        setError('Failed to load escrow information');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isConnected) {
      loadEscrowData();
    }
  }, [isConnected]);
  
  const handleEscrowTokens = async () => {
    if (!escrowAmount || parseFloat(escrowAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      setIsEscrowing(true);
      
      // In a real implementation, this would call the escrow contract
      // For now, we'll just simulate the escrow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPosition: EscrowPosition = {
        amount: escrowAmount,
        timestamp: Date.now(),
        releaseTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        released: false,
        slashingRisk: 10
      };
      
      setEscrowPositions(prev => [...prev, newPosition]);
      setTotalEscrowed(prev => (parseFloat(prev) + parseFloat(escrowAmount)).toString());
      setEscrowAmount('');
      
      alert('Tokens escrowed successfully!');
      
    } catch (err) {
      console.error('Error escrowing tokens:', err);
      alert('Failed to escrow tokens');
    } finally {
      setIsEscrowing(false);
    }
  };
  
  const handleReleaseTokens = async (index: number) => {
    const position = escrowPositions[index];
    if (!position || position.released) {
      return;
    }
    
    if (Date.now() < position.releaseTime) {
      alert('Tokens are not ready for release yet');
      return;
    }
    
    try {
      setIsReleasing(true);
      
      // In a real implementation, this would call the escrow contract
      // For now, we'll just simulate the release
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEscrowPositions(prev => prev.map((pos, i) => 
        i === index ? { ...pos, released: true } : pos
      ));
      
      setTotalReleased(prev => (parseFloat(prev) + parseFloat(position.amount)).toString());
      setTotalEscrowed(prev => (parseFloat(prev) - parseFloat(position.amount)).toString());
      
      alert('Tokens released successfully!');
      
    } catch (err) {
      console.error('Error releasing tokens:', err);
      alert('Failed to release tokens');
    } finally {
      setIsReleasing(false);
    }
  };
  
  const handleClaimRewards = async () => {
    if (!rewardsInfo || parseFloat(rewardsInfo.pendingRewards) <= 0) {
      alert('No rewards to claim');
      return;
    }
    
    try {
      setIsClaiming(true);
      
      // In a real implementation, this would call the escrow contract
      // For now, we'll just simulate the claim
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRewardsInfo(prev => prev ? {
        ...prev,
        totalClaimed: (parseFloat(prev.totalClaimed) + parseFloat(prev.pendingRewards)).toString(),
        pendingRewards: '0',
        lastClaimTime: Date.now()
      } : null);
      
      alert('Rewards claimed successfully!');
      
    } catch (err) {
      console.error('Error claiming rewards:', err);
      alert('Failed to claim rewards');
    } finally {
      setIsClaiming(false);
    }
  };
  
  const formatTime = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return 'Less than 1 hour';
    }
  };
  
  if (!isConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to manage governance escrow</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading escrow information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Governance Escrow</h2>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">7-day escrow period</span>
        </div>
      </div>
      
      {/* Escrow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Lock className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Escrowed</p>
              <p className="text-2xl font-bold text-gray-900">{totalEscrowed} STT</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Unlock className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Released</p>
              <p className="text-2xl font-bold text-gray-900">{totalReleased} STT</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Slashed</p>
              <p className="text-2xl font-bold text-gray-900">{totalSlashed} STT</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Escrow New Tokens */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Tokens</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Escrow (STT)
            </label>
            <input
              type="number"
              value={escrowAmount}
              onChange={(e) => setEscrowAmount(e.target.value)}
              placeholder="Enter amount to escrow"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-900">Escrow Notice</p>
              <p className="text-sm text-yellow-700">
                Tokens will be locked for 7 days and subject to slashing if governance rules are violated
              </p>
            </div>
          </div>
          
          <button
            onClick={handleEscrowTokens}
            disabled={isEscrowing || !escrowAmount}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isEscrowing ? 'Escrowing...' : 'Escrow Tokens'}
          </button>
        </div>
      </div>
      
      {/* Escrow Positions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Escrow Positions</h3>
        
        {escrowPositions.length > 0 ? (
          <div className="space-y-3">
            {escrowPositions.map((position, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {position.released ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                    ) : (
                      <Lock className="w-6 h-6 text-blue-600 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {position.amount} STT
                      </p>
                      <p className="text-sm text-gray-600">
                        Escrowed: {new Date(position.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Slashing Risk: {position.slashingRisk}%
                    </p>
                    {!position.released && (
                      <p className="text-sm text-gray-600">
                        {Date.now() >= position.releaseTime ? 'Ready for release' : `Releases in ${formatTime(position.releaseTime - Date.now())}`}
                      </p>
                    )}
                  </div>
                </div>
                
                {!position.released && Date.now() >= position.releaseTime && (
                  <button
                    onClick={() => handleReleaseTokens(index)}
                    disabled={isReleasing}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isReleasing ? 'Releasing...' : 'Release Tokens'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No escrow positions found</p>
            <p className="text-sm text-gray-500">Escrow tokens to participate in governance</p>
          </div>
        )}
      </div>
      
      {/* Rewards Section */}
      {rewardsInfo && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Governance Rewards</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-xl font-bold text-gray-900">{rewardsInfo.totalEarned} STT</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pending Rewards</p>
                  <p className="text-xl font-bold text-gray-900">{rewardsInfo.pendingRewards} STT</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Claimed</p>
                  <p className="text-xl font-bold text-gray-900">{rewardsInfo.totalClaimed} STT</p>
                </div>
              </div>
            </div>
          </div>
          
          {parseFloat(rewardsInfo.pendingRewards) > 0 && (
            <button
              onClick={handleClaimRewards}
              disabled={isClaiming}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isClaiming ? 'Claiming...' : `Claim ${rewardsInfo.pendingRewards} STT Rewards`}
            </button>
          )}
        </div>
      )}
      
      {/* Security Information */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Information</h3>
        
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-900">Slashing Risk</p>
              <p className="text-sm text-red-700">
                Escrowed tokens can be slashed if you violate governance rules or act maliciously
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Escrow Period</p>
              <p className="text-sm text-blue-700">
                Tokens are locked for 7 days to ensure commitment to governance participation
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-900">Rewards</p>
              <p className="text-sm text-green-700">
                Earn rewards for active governance participation and maintaining good standing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
