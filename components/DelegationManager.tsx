import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useGovernanceDelegation, DelegateInfo } from '../hooks/useGovernanceDelegation';
import { User, Users, TrendingUp, Clock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface DelegationManagerProps {
  className?: string;
}

export const DelegationManager: React.FC<DelegationManagerProps> = ({ className = '' }) => {
  const { address, isConnected } = useAccount();
  const {
    isLoading,
    error,
    delegation,
    votingPower,
    registeredDelegates,
    delegationStats,
    delegate,
    undelegate,
    registerDelegate,
    getDelegateInfo,
    isCorrectNetwork
  } = useGovernanceDelegation();
  
  const [selectedDelegate, setSelectedDelegate] = useState<string>('');
  const [delegationAmount, setDelegationAmount] = useState<string>('');
  const [delegateInfo, setDelegateInfo] = useState<DelegateInfo | null>(null);
  const [isDelegating, setIsDelegating] = useState(false);
  const [isUndelegating, setIsUndelegating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerName, setRegisterName] = useState<string>('');
  const [registerDescription, setRegisterDescription] = useState<string>('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  
  // Load delegate info when selected delegate changes
  useEffect(() => {
    if (selectedDelegate) {
      getDelegateInfo(selectedDelegate).then(setDelegateInfo);
    } else {
      setDelegateInfo(null);
    }
  }, [selectedDelegate, getDelegateInfo]);
  
  const handleDelegate = async () => {
    if (!selectedDelegate || !delegationAmount) {
      alert('Please select a delegate and enter an amount');
      return;
    }
    
    try {
      setIsDelegating(true);
      await delegate(selectedDelegate, delegationAmount);
      alert('Delegation successful!');
      setSelectedDelegate('');
      setDelegationAmount('');
    } catch (err) {
      console.error('Delegation failed:', err);
      alert('Delegation failed. Please try again.');
    } finally {
      setIsDelegating(false);
    }
  };
  
  const handleUndelegate = async () => {
    if (!delegation?.active) {
      alert('No active delegation to remove');
      return;
    }
    
    if (!confirm('Are you sure you want to remove your delegation?')) {
      return;
    }
    
    try {
      setIsUndelegating(true);
      await undelegate();
      alert('Undelegation successful!');
    } catch (err) {
      console.error('Undelegation failed:', err);
      alert('Undelegation failed. Please try again.');
    } finally {
      setIsUndelegating(false);
    }
  };
  
  const handleRegisterDelegate = async () => {
    if (!registerName || !registerDescription) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      setIsRegistering(true);
      await registerDelegate(registerName, registerDescription);
      alert('Delegate registration successful!');
      setRegisterName('');
      setRegisterDescription('');
      setShowRegisterForm(false);
    } catch (err) {
      console.error('Delegate registration failed:', err);
      alert('Delegate registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to manage governance delegation</p>
        </div>
      </div>
    );
  }
  
  if (!isCorrectNetwork) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wrong Network</h3>
          <p className="text-gray-600">Please switch to Somnia Testnet to use governance delegation</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Governance Delegation</h2>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Register as Delegate
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}
      
      {/* Delegation Statistics */}
      {delegationStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Delegations</p>
                <p className="text-2xl font-bold text-gray-900">{delegationStats.totalDelegations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Delegated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {parseFloat(delegationStats.totalDelegated).toFixed(2)} STT
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Registered Delegates</p>
                <p className="text-2xl font-bold text-gray-900">{delegationStats.registeredDelegateCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Current Delegation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Delegation</h3>
        
        {delegation?.active ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">Delegated to: {delegation.delegate}</p>
                  <p className="text-sm text-green-700">
                    Amount: {parseFloat(delegation.amount).toFixed(2)} STT
                  </p>
                  <p className="text-sm text-green-700">
                    Since: {new Date(delegation.timestamp * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUndelegate}
                disabled={isUndelegating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isUndelegating ? 'Removing...' : 'Remove Delegation'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-6 h-6 text-gray-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">No active delegation</p>
                <p className="text-sm text-gray-600">Delegate your voting power to participate in governance</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Your Voting Power: <span className="font-medium">{parseFloat(votingPower).toFixed(2)} STT</span>
          </p>
        </div>
      </div>
      
      {/* Delegate Selection */}
      {!delegation?.active && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delegate Your Vote</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Delegate
              </label>
              <select
                value={selectedDelegate}
                onChange={(e) => setSelectedDelegate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a delegate...</option>
                {registeredDelegates.map((delegate) => (
                  <option key={delegate} value={delegate}>
                    {delegate}
                  </option>
                ))}
              </select>
            </div>
            
            {delegateInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">{delegateInfo.name}</h4>
                <p className="text-sm text-blue-800 mb-2">{delegateInfo.description}</p>
                <div className="flex items-center text-sm text-blue-700">
                  <span className="mr-4">
                    Total Delegated: {parseFloat(delegateInfo.totalDelegated).toFixed(2)} STT
                  </span>
                  <span>
                    Delegators: {delegateInfo.delegatorCount}
                  </span>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Delegate (STT)
              </label>
              <input
                type="number"
                value={delegationAmount}
                onChange={(e) => setDelegationAmount(e.target.value)}
                placeholder="Enter amount to delegate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleDelegate}
              disabled={isDelegating || !selectedDelegate || !delegationAmount}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isDelegating ? 'Delegating...' : 'Delegate Voting Power'}
            </button>
          </div>
        </div>
      )}
      
      {/* Register as Delegate Form */}
      {showRegisterForm && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Register as Delegate</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delegate Name
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Enter your delegate name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={registerDescription}
                onChange={(e) => setRegisterDescription(e.target.value)}
                placeholder="Describe your governance philosophy and experience"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRegisterDelegate}
                disabled={isRegistering || !registerName || !registerDescription}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isRegistering ? 'Registering...' : 'Register as Delegate'}
              </button>
              <button
                onClick={() => setShowRegisterForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Available Delegates */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Delegates</h3>
        
        {registeredDelegates.length > 0 ? (
          <div className="space-y-3">
            {registeredDelegates.slice(0, 5).map((delegate) => (
              <div key={delegate} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{delegate}</p>
                    <p className="text-sm text-gray-600">Click to view details</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDelegate(delegate)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No registered delegates found</p>
            <p className="text-sm text-gray-500">Be the first to register as a delegate!</p>
          </div>
        )}
      </div>
    </div>
  );
};
