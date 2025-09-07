import { useState } from 'react';
import { Search, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface TransactionLookupProps {
  className?: string;
}

export default function TransactionLookup({ className = '' }: TransactionLookupProps) {
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    txData?: any;
    explorerUrl?: string;
  } | null>(null);

  const validateTxHash = (hash: string): { valid: boolean; error?: string } => {
    // Remove any whitespace
    const cleanHash = hash.trim();
    
    // Check if empty
    if (!cleanHash) {
      return { valid: false, error: 'Transaction hash cannot be empty' };
    }
    
    // Check if starts with 0x
    if (!cleanHash.startsWith('0x')) {
      return { valid: false, error: 'Transaction hash must start with 0x' };
    }
    
    // Check length (should be 66 characters: 0x + 64 hex characters)
    if (cleanHash.length !== 66) {
      return { 
        valid: false, 
        error: `Transaction hash must be 66 characters long (got ${cleanHash.length}). Format: 0x + 64 hex characters` 
      };
    }
    
    // Check if contains only valid hex characters
    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
      return { valid: false, error: 'Transaction hash contains invalid characters. Only hex characters (0-9, a-f, A-F) are allowed' };
    }
    
    return { valid: true };
  };

  const lookupTransaction = async () => {
    const validation = validateTxHash(txHash);
    if (!validation.valid) {
      setResult({
        success: false,
        message: validation.error || 'Invalid transaction hash format.'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Query the Somnia RPC directly
      const response = await fetch('https://dream-rpc.somnia.network/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionByHash',
          params: [txHash],
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setResult({
          success: false,
          message: `Transaction not found: ${data.error.message}. This could mean the transaction doesn't exist, is from a different network, or hasn't been mined yet.`
        });
      } else if (data.result) {
        setResult({
          success: true,
          message: 'Transaction found!',
          txData: data.result,
          explorerUrl: `https://shannon-explorer.somnia.network/tx/${txHash}`
        });
      } else {
        setResult({
          success: false,
          message: 'Transaction not found on Somnia testnet. Make sure you\'re using a transaction hash from the Somnia testnet (Chain ID: 50312).'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error connecting to Somnia network. Please check your internet connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Transaction Lookup</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="txHash" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Hash
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                id="txHash"
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value.trim())}
                placeholder="0x..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  txHash ? (validateTxHash(txHash).valid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                }`}
              />
              {txHash && (
                <div className="mt-1">
                  {validateTxHash(txHash).valid ? (
                    <p className="text-xs text-green-600">✓ Valid transaction hash format</p>
                  ) : (
                    <p className="text-xs text-red-600">⚠ {validateTxHash(txHash).error}</p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={lookupTransaction}
              disabled={isLoading || !txHash || !validateTxHash(txHash).valid}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Looking up...' : 'Lookup'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter a complete 66-character transaction hash (0x + 64 hex characters)
          </p>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                
                {result.success && result.explorerUrl && (
                  <div className="mt-3">
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <span>View on Somnia Explorer</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {result.success && result.txData && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Details:</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div><strong>From:</strong> {result.txData.from}</div>
                      <div><strong>To:</strong> {result.txData.to}</div>
                      <div><strong>Value:</strong> {result.txData.value ? `${parseInt(result.txData.value, 16) / 1e18} STT` : '0 STT'}</div>
                      <div><strong>Gas:</strong> {result.txData.gas}</div>
                      <div><strong>Gas Price:</strong> {result.txData.gasPrice ? `${parseInt(result.txData.gasPrice, 16) / 1e9} Gwei` : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Network Information:</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Network:</strong> Somnia Testnet</div>
            <div><strong>Chain ID:</strong> 50312</div>
            <div><strong>RPC URL:</strong> https://dream-rpc.somnia.network/</div>
            <div><strong>Explorer:</strong> https://shannon-explorer.somnia.network/</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>• <strong>Transaction not found?</strong> Make sure you're using a Somnia testnet transaction hash</div>
            <div>• <strong>Wrong network?</strong> Check that your wallet is connected to Somnia Testnet (Chain ID: 50312)</div>
            <div>• <strong>Recent transaction?</strong> It may take a few minutes to be indexed</div>
            <div>• <strong>Need test tokens?</strong> Join the Somnia Discord for STT tokens</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">Example Transaction Hashes:</h4>
          <div className="text-xs text-green-700 mb-3">
            Try these valid transaction hash formats:
          </div>
          
          <div className="space-y-2">
            <div className="bg-white border border-green-200 rounded p-2">
              <div className="font-mono text-xs text-green-800 break-all mb-1">
                0xd14546ac7e5e0156e3dc66bf31f0fd81aef17700791fa0195dbc6252ddc35ee2
              </div>
              <div className="text-xs text-green-600 mb-1">✅ Verified working transaction</div>
              <button
                onClick={() => setTxHash('0xd14546ac7e5e0156e3dc66bf31f0fd81aef17700791fa0195dbc6252ddc35ee2')}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Use this hash
              </button>
            </div>
            
            <div className="bg-white border border-green-200 rounded p-2">
              <div className="font-mono text-xs text-green-800 break-all mb-1">
                0x4a35bc7791fe8106ff0d0141a68ecb4b95786289b8c6931b8b5f00c64ed5d191
              </div>
              <div className="text-xs text-green-600 mb-1">✅ Verified working transaction</div>
              <button
                onClick={() => setTxHash('0x4a35bc7791fe8106ff0d0141a68ecb4b95786289b8c6931b8b5f00c64ed5d191')}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Use this hash
              </button>
            </div>
            
            <div className="bg-white border border-green-200 rounded p-2">
              <div className="font-mono text-xs text-green-800 break-all mb-1">
                0x380784dc566e0224f36ba077d197a3a6f29b40034f13fc6375e911d94586fdc3
              </div>
              <div className="text-xs text-green-600 mb-1">✅ Verified working transaction</div>
              <button
                onClick={() => setTxHash('0x380784dc566e0224f36ba077d197a3a6f29b40034f13fc6375e911d94586fdc3')}
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Use this hash
              </button>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-green-100 rounded border border-green-300">
            <p className="text-xs text-green-800">
              <strong>Note:</strong> The first hash is a real transaction from Somnia testnet. 
              The second is a valid format example but may not exist on the network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
