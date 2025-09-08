import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause,
  Calendar,
  Timer,
  Shield
} from 'lucide-react';

interface TimelockDisplayProps {
  proposalId: number;
  className?: string;
}

interface QueuedProposal {
  proposalId: number;
  eta: number;
  executed: boolean;
  cancelled: boolean;
  description: string;
  proposer: string;
  timestamp: number;
}

export const TimelockDisplay: React.FC<TimelockDisplayProps> = ({ 
  proposalId, 
  className = '' 
}) => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedProposal, setQueuedProposal] = useState<QueuedProposal | null>(null);
  const [timeUntilExecution, setTimeUntilExecution] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Mock data for demonstration
  const mockQueuedProposal: QueuedProposal = {
    proposalId: proposalId,
    eta: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
    executed: false,
    cancelled: false,
    description: 'Update protocol parameters and fee structure',
    proposer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    timestamp: Date.now() - 24 * 60 * 60 * 1000 // 1 day ago
  };
  
  // Update time until execution every second
  useEffect(() => {
    if (queuedProposal && !queuedProposal.executed && !queuedProposal.cancelled) {
      const updateTime = () => {
        const now = Date.now();
        const timeLeft = Math.max(0, queuedProposal.eta - now);
        setTimeUntilExecution(timeLeft);
      };
      
      updateTime();
      const interval = setInterval(updateTime, 1000);
      
      return () => clearInterval(interval);
    }
  }, [queuedProposal]);
  
  // Load queued proposal data
  useEffect(() => {
    const loadQueuedProposal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, this would call the timelock contract
        // For now, we'll use mock data
        setQueuedProposal(mockQueuedProposal);
        
      } catch (err) {
        console.error('Error loading queued proposal:', err);
        setError('Failed to load timelock information');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQueuedProposal();
  }, [proposalId]);
  
  const handleExecute = async () => {
    if (!queuedProposal || queuedProposal.executed || queuedProposal.cancelled) {
      return;
    }
    
    if (timeUntilExecution > 0) {
      alert('Proposal is not ready for execution yet');
      return;
    }
    
    try {
      setIsExecuting(true);
      
      // In a real implementation, this would call the timelock contract
      // For now, we'll just simulate the execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setQueuedProposal(prev => prev ? { ...prev, executed: true } : null);
      alert('Proposal executed successfully!');
      
    } catch (err) {
      console.error('Error executing proposal:', err);
      alert('Failed to execute proposal');
    } finally {
      setIsExecuting(false);
    }
  };
  
  const formatTime = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  const getStatusColor = () => {
    if (!queuedProposal) return 'gray';
    if (queuedProposal.executed) return 'green';
    if (queuedProposal.cancelled) return 'red';
    if (timeUntilExecution === 0) return 'blue';
    return 'yellow';
  };
  
  const getStatusText = () => {
    if (!queuedProposal) return 'Not Found';
    if (queuedProposal.executed) return 'Executed';
    if (queuedProposal.cancelled) return 'Cancelled';
    if (timeUntilExecution === 0) return 'Ready for Execution';
    return 'Waiting for Execution';
  };
  
  const getStatusIcon = () => {
    if (!queuedProposal) return <AlertCircle className="w-5 h-5" />;
    if (queuedProposal.executed) return <CheckCircle className="w-5 h-5" />;
    if (queuedProposal.cancelled) return <XCircle className="w-5 h-5" />;
    if (timeUntilExecution === 0) return <Play className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };
  
  if (!isConnected) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to view timelock information</p>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timelock information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!queuedProposal) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timelock</h3>
          <p className="text-gray-600">This proposal is not queued for execution</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Timelock Status</h2>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          getStatusColor() === 'green' ? 'bg-green-100 text-green-800' :
          getStatusColor() === 'red' ? 'bg-red-100 text-red-800' :
          getStatusColor() === 'blue' ? 'bg-blue-100 text-blue-800' :
          getStatusColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
        </div>
      </div>
      
      {/* Proposal Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Proposal #{queuedProposal.proposalId}</h3>
        <p className="text-gray-700 mb-4">{queuedProposal.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Queued: {new Date(queuedProposal.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Timer className="w-4 h-4 mr-2" />
            <span>ETA: {new Date(queuedProposal.eta).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {/* Timelock Information */}
      {!queuedProposal.executed && !queuedProposal.cancelled && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Timeline</h3>
          
          <div className="space-y-4">
            {/* Time Until Execution */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">Time Until Execution</p>
                  <p className="text-sm text-blue-700">
                    {timeUntilExecution > 0 ? formatTime(timeUntilExecution) : 'Ready now'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  {timeUntilExecution > 0 ? formatTime(timeUntilExecution) : '0s'}
                </p>
              </div>
            </div>
            
            {/* Execution Progress */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Execution Progress</span>
                <span className="text-sm text-gray-600">
                  {Math.min(100, Math.max(0, ((Date.now() - queuedProposal.timestamp) / (queuedProposal.eta - queuedProposal.timestamp)) * 100)).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, ((Date.now() - queuedProposal.timestamp) / (queuedProposal.eta - queuedProposal.timestamp)) * 100))}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Execution Actions */}
      {!queuedProposal.executed && !queuedProposal.cancelled && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          
          <div className="space-y-3">
            {timeUntilExecution === 0 ? (
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Execute Proposal
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Pause className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Waiting for Execution</p>
                    <p className="text-sm text-yellow-700">
                      This proposal will be ready for execution in {formatTime(timeUntilExecution)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Security Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Information</h3>
        
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <Shield className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-900">Timelock Protection</p>
              <p className="text-sm text-green-700">
                This proposal is protected by a 2-day timelock to prevent malicious execution
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Execution Window</p>
              <p className="text-sm text-blue-700">
                Once the timelock expires, this proposal can be executed by anyone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
