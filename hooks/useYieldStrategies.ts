import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'ethers';

// Yield Strategy Manager ABI (simplified for key functions)
const YIELD_STRATEGY_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "address", "name": "targetProtocol", "type": "address"},
      {"internalType": "address[]", "name": "inputTokens", "type": "address[]"},
      {"internalType": "address[]", "name": "outputTokens", "type": "address[]"},
      {"internalType": "uint256", "name": "riskLevel", "type": "uint256"},
      {"internalType": "uint256", "name": "minDeposit", "type": "uint256"},
      {"internalType": "uint256", "name": "maxDeposit", "type": "uint256"},
      {"internalType": "uint256", "name": "performanceFee", "type": "uint256"},
      {"internalType": "uint256", "name": "managementFee", "type": "uint256"}
    ],
    "name": "createStrategy",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "strategyId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "strategyId", "type": "uint256"},
      {"internalType": "uint256", "name": "shares", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "strategyId", "type": "uint256"}],
    "name": "harvest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "strategies",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "address", "name": "targetProtocol", "type": "address"},
      {"internalType": "address[]", "name": "inputTokens", "type": "address[]"},
      {"internalType": "address[]", "name": "outputTokens", "type": "address[]"},
      {"internalType": "uint256", "name": "riskLevel", "type": "uint256"},
      {"internalType": "uint256", "name": "minDeposit", "type": "uint256"},
      {"internalType": "uint256", "name": "maxDeposit", "type": "uint256"},
      {"internalType": "uint256", "name": "performanceFee", "type": "uint256"},
      {"internalType": "uint256", "name": "managementFee", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"},
      {"internalType": "uint256", "name": "totalDeposits", "type": "uint256"},
      {"internalType": "uint256", "name": "totalWithdrawals", "type": "uint256"},
      {"internalType": "uint256", "name": "totalFeesEarned", "type": "uint256"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "strategyCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "userPositions",
    "outputs": [
      {"internalType": "uint256", "name": "strategyId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "shares", "type": "uint256"},
      {"internalType": "uint256", "name": "entryTime", "type": "uint256"},
      {"internalType": "uint256", "name": "lastHarvest", "type": "uint256"},
      {"internalType": "uint256", "name": "accumulatedFees", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface Strategy {
  id: number;
  creator: string;
  name: string;
  description: string;
  targetProtocol: string;
  inputTokens: string[];
  outputTokens: string[];
  riskLevel: number;
  minDeposit: string;
  maxDeposit: string;
  performanceFee: number;
  managementFee: number;
  isActive: boolean;
  isVerified: boolean;
  totalDeposits: string;
  totalWithdrawals: string;
  totalFeesEarned: string;
  createdAt: number;
  lastUpdated: number;
}

export interface UserPosition {
  strategyId: number;
  amount: string;
  shares: string;
  entryTime: number;
  lastHarvest: number;
  accumulatedFees: string;
}

export interface StrategyPerformance {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  lastUpdate: number;
}

export function useYieldStrategies() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [userPositions, setUserPositions] = useState<Map<number, UserPosition>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract address - you'll need to update this with your deployed contract
  const YIELD_STRATEGY_CONTRACT = process.env.NEXT_PUBLIC_YIELD_STRATEGY_CONTRACT || '0x0000000000000000000000000000000000000000';

  // Load all strategies
  const loadStrategies = async () => {
    if (!publicClient) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const strategyCount = await publicClient.readContract({
        address: YIELD_STRATEGY_CONTRACT as `0x${string}`,
        abi: YIELD_STRATEGY_ABI,
        functionName: 'strategyCount'
      }) as bigint;

      const strategyPromises = [];
      for (let i = 0; i < Number(strategyCount); i++) {
        strategyPromises.push(
          publicClient.readContract({
            address: YIELD_STRATEGY_CONTRACT as `0x${string}`,
            abi: YIELD_STRATEGY_ABI,
            functionName: 'strategies',
            args: [BigInt(i)]
          })
        );
      }

      const strategyResults = await Promise.all(strategyPromises);
      const formattedStrategies = strategyResults.map((strategy: any, index) => ({
        id: index,
        creator: strategy[1],
        name: strategy[2],
        description: strategy[3],
        targetProtocol: strategy[4],
        inputTokens: strategy[5],
        outputTokens: strategy[6],
        riskLevel: Number(strategy[7]),
        minDeposit: formatEther(strategy[8]),
        maxDeposit: formatEther(strategy[9]),
        performanceFee: Number(strategy[10]),
        managementFee: Number(strategy[11]),
        isActive: strategy[12],
        isVerified: strategy[13],
        totalDeposits: formatEther(strategy[14]),
        totalWithdrawals: formatEther(strategy[15]),
        totalFeesEarned: formatEther(strategy[16]),
        createdAt: Number(strategy[17]),
        lastUpdated: Number(strategy[18])
      }));

      setStrategies(formattedStrategies);
    } catch (err: any) {
      console.error('Failed to load strategies:', err);
      setError('Failed to load strategies');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user positions
  const loadUserPositions = async () => {
    if (!publicClient || !address) return;
    
    try {
      const positions = new Map<number, UserPosition>();
      
      for (const strategy of strategies) {
        try {
          const position = await publicClient.readContract({
            address: YIELD_STRATEGY_CONTRACT as `0x${string}`,
            abi: YIELD_STRATEGY_ABI,
            functionName: 'userPositions',
            args: [address, BigInt(strategy.id)]
          }) as [bigint, bigint, bigint, bigint, bigint, bigint];

          if (position[2] > 0) { // If shares > 0
            positions.set(strategy.id, {
              strategyId: Number(position[0]),
              amount: formatEther(position[1]),
              shares: formatEther(position[2]),
              entryTime: Number(position[3]),
              lastHarvest: Number(position[4]),
              accumulatedFees: formatEther(position[5])
            });
          }
        } catch (err) {
          // Position doesn't exist or error reading
          continue;
        }
      }
      
      setUserPositions(positions);
    } catch (err: any) {
      console.error('Failed to load user positions:', err);
    }
  };

  // Create a new strategy
  const createStrategy = async (
    name: string,
    description: string,
    targetProtocol: string,
    inputTokens: string[],
    outputTokens: string[],
    riskLevel: number,
    minDeposit: string,
    maxDeposit: string,
    performanceFee: number,
    managementFee: number
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: YIELD_STRATEGY_CONTRACT as `0x${string}`,
        abi: YIELD_STRATEGY_ABI,
        functionName: 'createStrategy',
        args: [
          name,
          description,
          targetProtocol as `0x${string}`,
          inputTokens as `0x${string}`[],
          outputTokens as `0x${string}`[],
          BigInt(riskLevel),
          parseEther(minDeposit),
          parseEther(maxDeposit),
          BigInt(performanceFee),
          BigInt(managementFee)
        ]
      });

      console.log('Strategy creation transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to create strategy:', err);
      setError(err.message || 'Failed to create strategy');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Deposit into a strategy
  const deposit = async (strategyId: number, amount: string, token: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: YIELD_STRATEGY_CONTRACT as `0x${string}`,
        abi: YIELD_STRATEGY_ABI,
        functionName: 'deposit',
        args: [BigInt(strategyId), parseEther(amount), token as `0x${string}`]
      });

      console.log('Deposit transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to deposit:', err);
      setError(err.message || 'Failed to deposit');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw from a strategy
  const withdraw = async (strategyId: number, shares: string, token: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: YIELD_STRATEGY_CONTRACT as `0x${string}`,
        abi: YIELD_STRATEGY_ABI,
        functionName: 'withdraw',
        args: [BigInt(strategyId), parseEther(shares), token as `0x${string}`]
      });

      console.log('Withdraw transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to withdraw:', err);
      setError(err.message || 'Failed to withdraw');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Harvest yield from a strategy
  const harvest = async (strategyId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: YIELD_STRATEGY_CONTRACT as `0x${string}`,
        abi: YIELD_STRATEGY_ABI,
        functionName: 'harvest',
        args: [BigInt(strategyId)]
      });

      console.log('Harvest transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to harvest:', err);
      setError(err.message || 'Failed to harvest');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get risk level description
  const getRiskLevelDescription = (riskLevel: number): string => {
    const descriptions = [
      'Very Low Risk',
      'Low Risk',
      'Low-Medium Risk',
      'Medium Risk',
      'Medium-High Risk',
      'High Risk',
      'Very High Risk',
      'Extremely High Risk',
      'Maximum Risk',
      'Ultra High Risk'
    ];
    return descriptions[Math.min(riskLevel - 1, descriptions.length - 1)] || 'Unknown Risk';
  };

  // Get risk level color
  const getRiskLevelColor = (riskLevel: number): string => {
    if (riskLevel <= 2) return 'text-green-600 bg-green-50';
    if (riskLevel <= 4) return 'text-yellow-600 bg-yellow-50';
    if (riskLevel <= 6) return 'text-orange-600 bg-orange-50';
    if (riskLevel <= 8) return 'text-red-600 bg-red-50';
    return 'text-red-800 bg-red-100';
  };

  // Load all data on mount and when connected
  useEffect(() => {
    if (publicClient) {
      loadStrategies();
    }
  }, [publicClient]);

  useEffect(() => {
    if (publicClient && address && strategies.length > 0) {
      loadUserPositions();
    }
  }, [publicClient, address, strategies]);

  return {
    strategies,
    userPositions,
    isLoading,
    error,
    createStrategy,
    deposit,
    withdraw,
    harvest,
    loadStrategies,
    loadUserPositions,
    getRiskLevelDescription,
    getRiskLevelColor
  };
}
