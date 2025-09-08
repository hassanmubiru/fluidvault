import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Play,
  X,
  Calendar,
  User
} from 'lucide-react';
import { useGovernance, Proposal, UserVote, PROPOSAL_TYPES } from '../hooks/useGovernance';

interface ProposalCardProps {
  proposal: Proposal;
  onVote?: (proposalId: number, support: boolean) => void;
  onExecute?: (proposalId: number) => void;
  onCancel?: (proposalId: number) => void;
}

export default function ProposalCard({ proposal, onVote, onExecute, onCancel }: ProposalCardProps) {
  const { address } = useAccount();
  const { getUserVote, isProposalActive, canExecuteProposal } = useGovernance();
  
  const [userVote, setUserVote] = useState<UserVote | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's vote for this proposal
  useEffect(() => {
    const loadUserVote = async () => {
      if (address) {
        const vote = await getUserVote(proposal.id);
        setUserVote(vote);
      }
    };
    loadUserVote();
  }, [address, proposal.id, getUserVote]);

  const isActive = isProposalActive(proposal);
  const canExecute = canExecuteProposal(proposal);
  const hasUserVoted = userVote?.hasVoted || false;

  // Calculate vote percentages
  const totalVotes = parseFloat(proposal.forVotes) + parseFloat(proposal.againstVotes);
  const forPercentage = totalVotes > 0 ? (parseFloat(proposal.forVotes) / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (parseFloat(proposal.againstVotes) / totalVotes) * 100 : 0;

  // Format time remaining
  const getTimeRemaining = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = proposal.endTime - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get proposal status
  const getProposalStatus = () => {
    if (proposal.cancelled) return { text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' };
    if (proposal.executed) return { text: 'Executed', color: 'text-green-600', bg: 'bg-green-50' };
    if (isActive) return { text: 'Active', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (canExecute) return { text: 'Ready to Execute', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Ended', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const status = getProposalStatus();

  const handleVote = async (support: boolean) => {
    if (!onVote || hasUserVoted) return;
    
    setIsLoading(true);
    try {
      await onVote(proposal.id, support);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!onExecute) return;
    
    setIsLoading(true);
    try {
      await onExecute(proposal.id);
    } catch (error) {
      console.error('Execute failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    
    setIsLoading(true);
    try {
      await onCancel(proposal.id);
    } catch (error) {
      console.error('Cancel failed:', error);
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
              {status.text}
            </span>
            <span className="text-sm text-gray-500">
              #{proposal.id}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {proposal.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {proposal.description}
          </p>
        </div>
      </div>

      {/* Proposal Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="truncate">{proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(proposal.startTime * 1000).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{getTimeRemaining()}</span>
        </div>
      </div>

      {/* Proposal Type */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {PROPOSAL_TYPES[proposal.proposalType as keyof typeof PROPOSAL_TYPES] || 'Unknown'}
        </span>
      </div>

      {/* Voting Results */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Voting Results</span>
          <span>{totalVotes.toFixed(2)} total votes</span>
        </div>
        
        <div className="space-y-2">
          {/* For Votes */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${forPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">{forPercentage.toFixed(1)}%</span>
            </div>
          </div>
          
          {/* Against Votes */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${againstPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-red-600 font-medium">{againstPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>For: {parseFloat(proposal.forVotes).toFixed(2)}</span>
          <span>Against: {parseFloat(proposal.againstVotes).toFixed(2)}</span>
        </div>
      </div>

      {/* User Vote Status */}
      {hasUserVoted && userVote && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">
              You voted <strong>{userVote.support ? 'FOR' : 'AGAINST'}</strong> with {parseFloat(userVote.weight).toFixed(2)} voting power
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isActive && !hasUserVoted && (
          <>
            <button
              onClick={() => handleVote(true)}
              disabled={isLoading}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Voting...' : 'Vote For'}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={isLoading}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Voting...' : 'Vote Against'}
            </button>
          </>
        )}
        
        {canExecute && (
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isLoading ? 'Executing...' : 'Execute'}
          </button>
        )}
        
        {isActive && proposal.proposer.toLowerCase() === address?.toLowerCase() && (
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
