import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'ethers';

// Cross-Chain Bridge ABI (simplified for key functions)
const CROSS_CHAIN_BRIDGE_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "targetChainId", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "recipient", "type": "address"}
    ],
    "name": "initiateBridge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "bridgeRequests",
    "outputs": [
      {"internalType": "uint256", "name": "requestId", "type": "uint256"},
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "sourceChainId", "type": "uint256"},
      {"internalType": "uint256", "name": "targetChainId", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "bytes32", "name": "txHash", "type": "bytes32"},
      {"internalType": "uint256", "name": "nonce", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "chainId", "type": "uint256"}],
    "name": "getChainInfo",
    "outputs": [
      {"internalType": "uint256", "name": "chainId", "type": "uint256"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "address", "name": "bridgeContract", "type": "address"},
      {"internalType": "uint256", "name": "minTransfer", "type": "uint256"},
      {"internalType": "uint256", "name": "maxTransfer", "type": "uint256"},
      {"internalType": "uint256", "name": "bridgeFee", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSupportedChains",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserBridgeRequests",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "targetChainId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "calculateFees",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface ChainInfo {
  chainId: number;
  name: string;
  isActive: boolean;
  bridgeContract: string;
  minTransfer: string;
  maxTransfer: string;
  bridgeFee: number;
}

export interface BridgeRequest {
  requestId: number;
  user: string;
  sourceChainId: number;
  targetChainId: number;
  token: string;
  amount: string;
  recipient: string;
  timestamp: number;
  status: BridgeStatus;
  txHash: string;
  nonce: string;
}

export enum BridgeStatus {
  Pending = 0,
  Confirmed = 1,
  Executed = 2,
  Failed = 3,
  Cancelled = 4
}

export interface SupportedToken {
  symbol: string;
  decimals: number;
  isActive: boolean;
}

// Supported chains configuration
export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', rpcUrl: 'https://mainnet.infura.io/v3/' },
  137: { name: 'Polygon', symbol: 'MATIC', rpcUrl: 'https://polygon-rpc.com' },
  42161: { name: 'Arbitrum', symbol: 'ETH', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  10: { name: 'Optimism', symbol: 'ETH', rpcUrl: 'https://mainnet.optimism.io' },
  56: { name: 'BSC', symbol: 'BNB', rpcUrl: 'https://bsc-dataseed.binance.org' },
  50312: { name: 'Somnia Testnet', symbol: 'STT', rpcUrl: 'https://testnet.somnia.network' }
};

export function useCrossChain() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  
  const [supportedChains, setSupportedChains] = useState<ChainInfo[]>([]);
  const [userBridgeRequests, setUserBridgeRequests] = useState<BridgeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract address - you'll need to update this with your deployed contract
  const CROSS_CHAIN_BRIDGE_CONTRACT = process.env.NEXT_PUBLIC_CROSS_CHAIN_BRIDGE_CONTRACT || '0x0000000000000000000000000000000000000000';

  // Load supported chains
  const loadSupportedChains = async () => {
    if (!publicClient) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if contract is deployed
      if (CROSS_CHAIN_BRIDGE_CONTRACT === '0x0000000000000000000000000000000000000000') {
        // Use fallback data when contract is not deployed
        const fallbackChains: ChainInfo[] = [
          {
            chainId: 1,
            name: 'Ethereum',
            isActive: true,
            bridgeContract: '0x0000000000000000000000000000000000000000',
            minTransfer: '0.001',
            maxTransfer: '1000',
            bridgeFee: 50 // 0.5%
          },
          {
            chainId: 137,
            name: 'Polygon',
            isActive: true,
            bridgeContract: '0x0000000000000000000000000000000000000000',
            minTransfer: '0.001',
            maxTransfer: '1000',
            bridgeFee: 30 // 0.3%
          },
          {
            chainId: 42161,
            name: 'Arbitrum',
            isActive: true,
            bridgeContract: '0x0000000000000000000000000000000000000000',
            minTransfer: '0.001',
            maxTransfer: '1000',
            bridgeFee: 25 // 0.25%
          },
          {
            chainId: 10,
            name: 'Optimism',
            isActive: true,
            bridgeContract: '0x0000000000000000000000000000000000000000',
            minTransfer: '0.001',
            maxTransfer: '1000',
            bridgeFee: 25 // 0.25%
          },
          {
            chainId: 56,
            name: 'BSC',
            isActive: true,
            bridgeContract: '0x0000000000000000000000000000000000000000',
            minTransfer: '0.001',
            maxTransfer: '1000',
            bridgeFee: 20 // 0.2%
          },
          {
            chainId: 50312,
            name: 'Somnia Testnet',
            isActive: true,
            bridgeContract: '0x0000000000000000000000000000000000000000',
            minTransfer: '0.001',
            maxTransfer: '1000',
            bridgeFee: 10 // 0.1%
          }
        ];
        setSupportedChains(fallbackChains);
        return;
      }
      
      const chainIds = await publicClient.readContract({
        address: CROSS_CHAIN_BRIDGE_CONTRACT as `0x${string}`,
        abi: CROSS_CHAIN_BRIDGE_ABI,
        functionName: 'getSupportedChains'
      }) as bigint[];

      const chainPromises = chainIds.map(chainId => 
        publicClient.readContract({
          address: CROSS_CHAIN_BRIDGE_CONTRACT as `0x${string}`,
          abi: CROSS_CHAIN_BRIDGE_ABI,
          functionName: 'getChainInfo',
          args: [chainId]
        })
      );

      const chainResults = await Promise.all(chainPromises);
      const formattedChains = chainResults.map((chain: any) => ({
        chainId: Number(chain[0]),
        name: chain[1],
        isActive: chain[2],
        bridgeContract: chain[3],
        minTransfer: formatEther(chain[4]),
        maxTransfer: formatEther(chain[5]),
        bridgeFee: Number(chain[6])
      }));

      setSupportedChains(formattedChains);
    } catch (err: any) {
      console.error('Failed to load supported chains:', err);
      
      // Use fallback data on error
      const fallbackChains: ChainInfo[] = [
        {
          chainId: 1,
          name: 'Ethereum',
          isActive: true,
          bridgeContract: '0x0000000000000000000000000000000000000000',
          minTransfer: '0.001',
          maxTransfer: '1000',
          bridgeFee: 50
        },
        {
          chainId: 137,
          name: 'Polygon',
          isActive: true,
          bridgeContract: '0x0000000000000000000000000000000000000000',
          minTransfer: '0.001',
          maxTransfer: '1000',
          bridgeFee: 30
        },
        {
          chainId: 42161,
          name: 'Arbitrum',
          isActive: true,
          bridgeContract: '0x0000000000000000000000000000000000000000',
          minTransfer: '0.001',
          maxTransfer: '1000',
          bridgeFee: 25
        },
        {
          chainId: 10,
          name: 'Optimism',
          isActive: true,
          bridgeContract: '0x0000000000000000000000000000000000000000',
          minTransfer: '0.001',
          maxTransfer: '1000',
          bridgeFee: 25
        },
        {
          chainId: 56,
          name: 'BSC',
          isActive: true,
          bridgeContract: '0x0000000000000000000000000000000000000000',
          minTransfer: '0.001',
          maxTransfer: '1000',
          bridgeFee: 20
        },
        {
          chainId: 50312,
          name: 'Somnia Testnet',
          isActive: true,
          bridgeContract: '0x0000000000000000000000000000000000000000',
          minTransfer: '0.001',
          maxTransfer: '1000',
          bridgeFee: 10
        }
      ];
      setSupportedChains(fallbackChains);
      setError('Using demo data - bridge contract not deployed yet');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user bridge requests
  const loadUserBridgeRequests = async () => {
    if (!publicClient || !address) return;
    
    try {
      const requestIds = await publicClient.readContract({
        address: CROSS_CHAIN_BRIDGE_CONTRACT as `0x${string}`,
        abi: CROSS_CHAIN_BRIDGE_ABI,
        functionName: 'getUserBridgeRequests',
        args: [address]
      }) as bigint[];

      const requestPromises = requestIds.map(requestId => 
        publicClient.readContract({
          address: CROSS_CHAIN_BRIDGE_CONTRACT as `0x${string}`,
          abi: CROSS_CHAIN_BRIDGE_ABI,
          functionName: 'bridgeRequests',
          args: [requestId]
        })
      );

      const requestResults = await Promise.all(requestPromises);
      const formattedRequests = requestResults.map((request: any, index) => ({
        requestId: Number(requestIds[index]),
        user: request[1],
        sourceChainId: Number(request[2]),
        targetChainId: Number(request[3]),
        token: request[4],
        amount: formatEther(request[5]),
        recipient: request[6],
        timestamp: Number(request[7]),
        status: request[8] as BridgeStatus,
        txHash: request[9],
        nonce: request[10].toString()
      }));

      setUserBridgeRequests(formattedRequests);
    } catch (err: any) {
      console.error('Failed to load user bridge requests:', err);
    }
  };

  // Initiate cross-chain bridge
  const initiateBridge = async (
    targetChainId: number,
    token: string,
    amount: string,
    recipient: string
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    // Check if contract is deployed
    if (CROSS_CHAIN_BRIDGE_CONTRACT === '0x0000000000000000000000000000000000000000') {
      throw new Error('Cross-chain bridge contract not deployed yet. This is a demo interface.');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: CROSS_CHAIN_BRIDGE_CONTRACT as `0x${string}`,
        abi: CROSS_CHAIN_BRIDGE_ABI,
        functionName: 'initiateBridge',
        args: [
          BigInt(targetChainId),
          token as `0x${string}`,
          parseEther(amount),
          recipient as `0x${string}`
        ]
      });

      console.log('Bridge transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to initiate bridge:', err);
      setError(err.message || 'Failed to initiate bridge');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate bridge fees
  const calculateBridgeFees = async (targetChainId: number, amount: string) => {
    if (!publicClient) return { bridgeFee: 0, platformFee: 0, totalFee: 0 };

    try {
      const fees = await publicClient.readContract({
        address: CROSS_CHAIN_BRIDGE_CONTRACT as `0x${string}`,
        abi: CROSS_CHAIN_BRIDGE_ABI,
        functionName: 'calculateFees',
        args: [BigInt(targetChainId), parseEther(amount)]
      }) as [bigint, bigint, bigint];

      return {
        bridgeFee: parseFloat(formatEther(fees[0])),
        platformFee: parseFloat(formatEther(fees[1])),
        totalFee: parseFloat(formatEther(fees[2]))
      };
    } catch (err: any) {
      console.error('Failed to calculate fees:', err);
      return { bridgeFee: 0, platformFee: 0, totalFee: 0 };
    }
  };

  // Get bridge status description
  const getBridgeStatusDescription = (status: BridgeStatus): string => {
    const descriptions = {
      [BridgeStatus.Pending]: 'Pending',
      [BridgeStatus.Confirmed]: 'Confirmed',
      [BridgeStatus.Executed]: 'Executed',
      [BridgeStatus.Failed]: 'Failed',
      [BridgeStatus.Cancelled]: 'Cancelled'
    };
    return descriptions[status] || 'Unknown';
  };

  // Get bridge status color
  const getBridgeStatusColor = (status: BridgeStatus): string => {
    const colors = {
      [BridgeStatus.Pending]: 'text-yellow-600 bg-yellow-50',
      [BridgeStatus.Confirmed]: 'text-blue-600 bg-blue-50',
      [BridgeStatus.Executed]: 'text-green-600 bg-green-50',
      [BridgeStatus.Failed]: 'text-red-600 bg-red-50',
      [BridgeStatus.Cancelled]: 'text-gray-600 bg-gray-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  // Get chain name by ID
  const getChainName = (chainId: number): string => {
    return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]?.name || `Chain ${chainId}`;
  };

  // Get chain symbol by ID
  const getChainSymbol = (chainId: number): string => {
    return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]?.symbol || 'TOKEN';
  };

  // Check if chain is supported
  const isChainSupported = (chainId: number): boolean => {
    return supportedChains.some(chain => chain.chainId === chainId && chain.isActive);
  };

  // Get estimated bridge time
  const getEstimatedBridgeTime = (targetChainId: number): string => {
    const times = {
      1: '10-15 minutes', // Ethereum
      137: '5-10 minutes', // Polygon
      42161: '5-10 minutes', // Arbitrum
      10: '5-10 minutes', // Optimism
      56: '5-10 minutes', // BSC
      50312: '1-2 minutes' // Somnia Testnet
    };
    return times[targetChainId as keyof typeof times] || '5-15 minutes';
  };

  // Load all data on mount and when connected
  useEffect(() => {
    if (publicClient) {
      loadSupportedChains();
    }
  }, [publicClient]);

  useEffect(() => {
    if (publicClient && address) {
      loadUserBridgeRequests();
    }
  }, [publicClient, address]);

  return {
    supportedChains,
    userBridgeRequests,
    isLoading,
    error,
    initiateBridge,
    calculateBridgeFees,
    loadSupportedChains,
    loadUserBridgeRequests,
    getBridgeStatusDescription,
    getBridgeStatusColor,
    getChainName,
    getChainSymbol,
    isChainSupported,
    getEstimatedBridgeTime,
    currentChainId: chainId
  };
}
