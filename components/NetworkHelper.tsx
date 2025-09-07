import { useState } from 'react';
import { useAccount, useSwitchNetwork, useChainId } from 'wagmi';

export default function NetworkHelper() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchNetwork } = useSwitchNetwork();
  const [showInstructions, setShowInstructions] = useState(false);

  const isSomniaTestnet = chainId === 50312;
  const isUnsupportedNetwork = isConnected && ![1, 11155111, 31337, 50312].includes(chainId);

  if (isSomniaTestnet) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Connected to Somnia Testnet
            </p>
            <p className="text-sm text-green-700">
              You're ready to use FluidVault on Somnia Network!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUnsupportedNetwork) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Unsupported Network
              </p>
              <p className="text-sm text-yellow-700">
                Please switch to Somnia Testnet to use FluidVault
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => switchNetwork?.(50312)}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              Switch to Somnia
            </button>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              {showInstructions ? 'Hide' : 'Show'} Instructions
            </button>
          </div>
        </div>
        
        {showInstructions && (
          <div className="mt-4 pt-4 border-t border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">How to add Somnia Testnet to MetaMask:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Open MetaMask and click the network dropdown</li>
              <li>Click "Add Network" or "Custom RPC"</li>
              <li>Enter these details:
                <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                  <li><strong>Network Name:</strong> Somnia Testnet</li>
                  <li><strong>RPC URL:</strong> https://dream-rpc.somnia.network/</li>
                  <li><strong>Chain ID:</strong> 50312</li>
                  <li><strong>Currency Symbol:</strong> STT</li>
                  <li><strong>Block Explorer:</strong> https://shannon-explorer.somnia.network/</li>
                </ul>
              </li>
              <li>Click "Save" and switch to the network</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
              <p className="text-sm text-yellow-800">
                <strong>Need test tokens?</strong> Join the{' '}
                <a href="https://discord.com/invite/somnia" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">
                  Somnia Discord
                </a>{' '}
                and request STT tokens from the dev team.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
