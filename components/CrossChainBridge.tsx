import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  ArrowRightLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Info,
  Zap
} from 'lucide-react';
import { useCrossChain, BridgeRequest, BridgeStatus, SUPPORTED_CHAINS } from '../hooks/useCrossChain';

interface CrossChainBridgeProps {
  onBridgeComplete?: (requestId: number) => void;
}

export default function CrossChainBridge({ onBridgeComplete }: CrossChainBridgeProps) {
  const { address, isConnected } = useAccount();
  const {
    supportedChains,
    userBridgeRequests,
    isLoading,
    error,
    initiateBridge,
    calculateBridgeFees,
    getBridgeStatusDescription,
    getBridgeStatusColor,
    getChainName,
    getChainSymbol,
    isChainSupported,
    getEstimatedBridgeTime,
    currentChainId
  } = useCrossChain();

  const [showBridgeForm, setShowBridgeForm] = useState(false);
  const [targetChainId, setTargetChainId] = useState<number>(137); // Default to Polygon
  const [token, setToken] = useState<string>('0x0000000000000000000000000000000000000000'); // Default token
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [bridgeFees, setBridgeFees] = useState({ bridgeFee: 0, platformFee: 0, totalFee: 0 });
  const [isBridging, setIsBridging] = useState(false);

  // Set default recipient to user's address
  useEffect(() => {
    if (address && !recipient) {
      setRecipient(address);
    }
  }, [address, recipient]);

  // Calculate fees when amount or target chain changes
  useEffect(() => {
    if (amount && targetChainId) {
      calculateBridgeFees(targetChainId, amount).then(setBridgeFees);
    }
  }, [amount, targetChainId, calculateBridgeFees]);

  const handleBridge = async () => {
    if (!amount || !recipient || !targetChainId) return;

    setIsBridging(true);
    try {
      const hash = await initiateBridge(targetChainId, token, amount, recipient);
      console.log('Bridge initiated:', hash);
      
      // Reset form
      setAmount('');
      setShowBridgeForm(false);
      
      if (onBridgeComplete) {
        onBridgeComplete(0); // You might want to get the actual request ID
      }
    } catch (error) {
      console.error('Bridge failed:', error);
    } finally {
      setIsBridging(false);
    }
  };

  const getStatusIcon = (status: BridgeStatus) => {
    switch (status) {
      case BridgeStatus.Pending:
        return <Clock className="w-4 h-4" />;
      case BridgeStatus.Confirmed:
        return <CheckCircle className="w-4 h-4" />;
      case BridgeStatus.Executed:
        return <CheckCircle className="w-4 h-4" />;
      case BridgeStatus.Failed:
        return <XCircle className="w-4 h-4" />;
      case BridgeStatus.Cancelled:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <ArrowRightLeft className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cross-Chain Bridge
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transfer your assets seamlessly between supported blockchain networks. 
          Access yield strategies across multiple chains with our secure bridge.
        </p>
      </div>

      {/* Bridge Form */}
      {showBridgeForm ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Initiate Bridge Transfer</h3>
            <button
              onClick={() => setShowBridgeForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Target Chain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Chain
              </label>
              <select
                value={targetChainId}
                onChange={(e) => setTargetChainId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {supportedChains
                  .filter(chain => chain.chainId !== currentChainId)
                  .map(chain => (
                    <option key={chain.chainId} value={chain.chainId}>
                      {chain.name} ({getChainSymbol(chain.chainId)})
                    </option>
                  ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {getChainSymbol(currentChainId)}
                </div>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fee Breakdown */}
            {amount && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Fee Breakdown</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bridge Fee:</span>
                    <span className="font-medium">{bridgeFees.bridgeFee.toFixed(4)} {getChainSymbol(currentChainId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee:</span>
                    <span className="font-medium">{bridgeFees.platformFee.toFixed(4)} {getChainSymbol(currentChainId)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1">
                    <span className="text-gray-900 font-medium">Total Fee:</span>
                    <span className="font-bold">{bridgeFees.totalFee.toFixed(4)} {getChainSymbol(currentChainId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">You'll Receive:</span>
                    <span className="font-medium">{(parseFloat(amount) - bridgeFees.totalFee).toFixed(4)} {getChainSymbol(targetChainId)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Estimated time: {getEstimatedBridgeTime(targetChainId)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBridge}
                disabled={!amount || !recipient || isBridging || !isConnected}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isBridging ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Bridging...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-4 h-4" />
                    Initiate Bridge
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBridgeForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setShowBridgeForm(true)}
            disabled={!isConnected}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <ArrowRightLeft className="w-5 h-5" />
            Start Bridge Transfer
          </button>
        </div>
      )}

      {/* Supported Chains */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Networks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedChains.map(chain => (
            <div key={chain.chainId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{chain.name}</h4>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  chain.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {chain.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Min: {parseFloat(chain.minTransfer).toFixed(4)} {getChainSymbol(chain.chainId)}</div>
                <div>Max: {parseFloat(chain.maxTransfer).toFixed(4)} {getChainSymbol(chain.chainId)}</div>
                <div>Fee: {(chain.bridgeFee / 100).toFixed(2)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bridge History */}
      {userBridgeRequests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bridge History</h3>
          <div className="space-y-3">
            {userBridgeRequests.map(request => (
              <div key={request.requestId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      #{request.requestId}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getBridgeStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {getBridgeStatusDescription(request.status)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatTime(request.timestamp)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">From:</span>
                    <span className="ml-2 font-medium">{getChainName(request.sourceChainId)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">To:</span>
                    <span className="ml-2 font-medium">{getChainName(request.targetChainId)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">{parseFloat(request.amount).toFixed(4)}</span>
                  </div>
                </div>
                {request.txHash && (
                  <div className="mt-2">
                    <a
                      href={`https://etherscan.io/tx/${request.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Transaction
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-1">How Cross-Chain Bridge Works</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Your tokens are locked on the source chain</li>
              <li>• Equivalent tokens are minted on the target chain</li>
              <li>• Bridge fees cover network costs and security</li>
              <li>• Transactions are secured by our validator network</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
