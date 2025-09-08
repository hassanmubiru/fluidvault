import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useGovernance } from '../hooks/useGovernance';
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  BarChart3,
  Target
} from 'lucide-react';

interface AdvancedVotingInterfaceProps {
  proposalId: number;
  className?: string;
}

export const AdvancedVotingInterface: React.FC<AdvancedVotingInterfaceProps> = ({ 
  proposalId, 
  className = '' 
}) => {
  const { address, isConnected } = useAccount();
  const {
    isLoading,
    error,
    proposals,
    userVotingPower,
    vote,
    loadProposals
  } = useGovernance();
  
  const chainId = useChainId();
  const isCorrectNetwork = chainId === 50312; // Somnia testnet
  
  const [votingType, setVotingType] = useState<'standard' | 'quadratic' | 'weighted' | 'ranked'>('standard');
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [optionWeights, setOptionWeights] = useState<number[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const proposal = proposals.find(p => p.id === proposalId);
  
  // Initialize weights array when options change
  useEffect(() => {
    if (selectedOptions.length > 0) {
      setOptionWeights(new Array(selectedOptions.length).fill(1));
    }
  }, [selectedOptions]);
  
  const handleOptionSelect = (option: number) => {
    if (votingType === 'standard') {
      setSelectedOptions([option]);
    } else {
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter(o => o !== option));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    }
  };
  
  const handleWeightChange = (index: number, weight: number) => {
    const newWeights = [...optionWeights];
    newWeights[index] = weight;
    setOptionWeights(newWeights);
  };
  
  const handleVote = async () => {
    if (!proposal || selectedOptions.length === 0) {
      alert('Please select at least one option');
      return;
    }
    
    if (votingType === 'quadratic' || votingType === 'weighted') {
      const totalWeight = optionWeights.reduce((sum, weight) => sum + weight, 0);
      if (totalWeight > parseFloat(userVotingPower)) {
        alert('Total weight cannot exceed your voting power');
        return;
      }
    }
    
    try {
      setIsVoting(true);
      
      // For now, we'll use the standard vote function
      // In a real implementation, you'd have separate functions for each voting type
      const option = selectedOptions[0]; // Use first selected option for standard vote
      await vote(proposalId, option === 1); // Convert to boolean for standard vote
      
      alert('Vote cast successfully!');
      setSelectedOptions([]);
      setOptionWeights([]);
      
      // Reload proposals to get updated results
      await loadProposals();
      
    } catch (err) {
      console.error('Voting failed:', err);
      alert('Voting failed. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };
  
  const getVotingTypeDescription = (type: string) => {
    switch (type) {
      case 'standard':
        return 'Simple yes/no vote with equal weight';
      case 'quadratic':
        return 'Vote with quadratic weighting - more expensive to vote heavily for one option';
      case 'weighted':
        return 'Distribute your voting power across multiple options';
      case 'ranked':
        return 'Rank options in order of preference';
      default:
        return '';
    }
  };
  
  const getVotingTypeIcon = (type: string) => {
    switch (type) {
      case 'standard':
        return <CheckCircle className="w-5 h-5" />;
      case 'quadratic':
        return <TrendingUp className="w-5 h-5" />;
      case 'weighted':
        return <BarChart3 className="w-5 h-5" />;
      case 'ranked':
        return <Target className="w-5 h-5" />;
      default:
        return <Vote className="w-5 h-5" />;
    }
  };
  
  if (!isConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to vote on proposals</p>
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
          <p className="text-gray-600">Please switch to Somnia Testnet to vote on proposals</p>
        </div>
      </div>
    );
  }
  
  if (!proposal) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Proposal Not Found</h3>
          <p className="text-gray-600">The requested proposal could not be found</p>
        </div>
      </div>
    );
  }
  
  const now = Math.floor(Date.now() / 1000);
  const isVotingActive = now >= proposal.startTime && now <= proposal.endTime && !proposal.executed && !proposal.cancelled;
  const hasVoted = false; // This would need to be determined from the governance contract
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Voting</h2>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600">
            {parseFloat(userVotingPower).toFixed(2)} STT
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      {/* Proposal Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{proposal.title}</h3>
        <p className="text-gray-700 mb-4">{proposal.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Ends: {new Date(proposal.endTime * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{(parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes)).toFixed(0)} votes</span>
          </div>
        </div>
      </div>
      
      {/* Voting Type Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { type: 'standard', label: 'Standard Vote', icon: getVotingTypeIcon('standard') },
            { type: 'quadratic', label: 'Quadratic Vote', icon: getVotingTypeIcon('quadratic') },
            { type: 'weighted', label: 'Weighted Vote', icon: getVotingTypeIcon('weighted') },
            { type: 'ranked', label: 'Ranked Vote', icon: getVotingTypeIcon('ranked') }
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setVotingType(type as any)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                votingType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                {icon}
                <span className="ml-2 font-medium text-gray-900">{label}</span>
              </div>
              <p className="text-sm text-gray-600">{getVotingTypeDescription(type)}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Voting Options */}
      {isVotingActive && !hasVoted && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cast Your Vote</h3>
          
          <div className="space-y-3">
            {[
              { value: 0, label: 'Against', icon: <XCircle className="w-5 h-5 text-red-600" /> },
              { value: 1, label: 'For', icon: <CheckCircle className="w-5 h-5 text-green-600" /> }
            ].map((option) => (
              <div key={option.value} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  {option.icon}
                  <span className="ml-3 font-medium text-gray-900">{option.label}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {(votingType === 'quadratic' || votingType === 'weighted') && selectedOptions.includes(option.value) && (
                    <input
                      type="number"
                      min="0"
                      max={parseFloat(userVotingPower)}
                      value={optionWeights[selectedOptions.indexOf(option.value)] || 0}
                      onChange={(e) => handleWeightChange(selectedOptions.indexOf(option.value), parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Weight"
                    />
                  )}
                  
                  <button
                    onClick={() => handleOptionSelect(option.value)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedOptions.includes(option.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {selectedOptions.includes(option.value) ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Advanced Options */}
          {(votingType === 'quadratic' || votingType === 'weighted') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                {votingType === 'quadratic' ? 'Quadratic Voting' : 'Weighted Voting'}
              </h4>
              <p className="text-sm text-blue-800">
                {votingType === 'quadratic' 
                  ? 'The cost of voting increases quadratically with the weight. Use your voting power efficiently.'
                  : 'Distribute your voting power across multiple options. Total weight cannot exceed your voting power.'
                }
              </p>
            </div>
          )}
          
          <button
            onClick={handleVote}
            disabled={isVoting || selectedOptions.length === 0}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isVoting ? 'Casting Vote...' : 'Cast Vote'}
          </button>
        </div>
      )}
      
      {/* Voting Status */}
      {hasVoted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-900">Vote Cast Successfully</p>
              <p className="text-sm text-green-700">
                You voted: For
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Voting Results */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Results</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-3" />
              <span className="font-medium text-gray-900">Against</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{proposal.againstVotes}</p>
              <p className="text-sm text-gray-600">
                {parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) > 0 
                  ? ((parseFloat(proposal.againstVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))) * 100).toFixed(1)
                  : 0
                }%
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">For</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{proposal.forVotes}</p>
              <p className="text-sm text-gray-600">
                {parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes) > 0 
                  ? ((parseFloat(proposal.forVotes) / (parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes))) * 100).toFixed(1)
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Votes:</span>
            <span className="font-medium text-gray-900">
              {(parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes)).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Quorum:</span>
            <span className="font-medium text-gray-900">
              20% required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
