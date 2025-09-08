import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Analytics Engine ABI
const ANALYTICS_ENGINE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getPortfolioMetrics",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "totalValue", "type": "uint256"},
          {"internalType": "uint256", "name": "totalDeposits", "type": "uint256"},
          {"internalType": "uint256", "name": "totalWithdrawals", "type": "uint256"},
          {"internalType": "uint256", "name": "totalYield", "type": "uint256"},
          {"internalType": "uint256", "name": "activeStrategies", "type": "uint256"},
          {"internalType": "uint256", "name": "crossChainPositions", "type": "uint256"},
          {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
        ],
        "internalType": "struct AnalyticsEngine.PortfolioMetrics",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "strategyId", "type": "uint256"}
    ],
    "name": "getStrategyPerformance",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "strategyId", "type": "uint256"},
          {"internalType": "uint256", "name": "totalDeposits", "type": "uint256"},
          {"internalType": "uint256", "name": "totalWithdrawals", "type": "uint256"},
          {"internalType": "uint256", "name": "totalYield", "type": "uint256"},
          {"internalType": "uint256", "name": "currentAPY", "type": "uint256"},
          {"internalType": "uint256", "name": "riskScore", "type": "uint256"},
          {"internalType": "uint256", "name": "sharpeRatio", "type": "uint256"},
          {"internalType": "uint256", "name": "maxDrawdown", "type": "uint256"},
          {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
        ],
        "internalType": "struct AnalyticsEngine.StrategyPerformance",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getRiskMetrics",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "portfolioRisk", "type": "uint256"},
          {"internalType": "uint256", "name": "concentrationRisk", "type": "uint256"},
          {"internalType": "uint256", "name": "liquidityRisk", "type": "uint256"},
          {"internalType": "uint256", "name": "smartContractRisk", "type": "uint256"},
          {"internalType": "uint256", "name": "marketRisk", "type": "uint256"},
          {"internalType": "uint256", "name": "lastCalculated", "type": "uint256"}
        ],
        "internalType": "struct AnalyticsEngine.RiskMetrics",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getYieldAnalytics",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "dailyYield", "type": "uint256"},
          {"internalType": "uint256", "name": "weeklyYield", "type": "uint256"},
          {"internalType": "uint256", "name": "monthlyYield", "type": "uint256"},
          {"internalType": "uint256", "name": "yearlyYield", "type": "uint256"},
          {"internalType": "uint256", "name": "averageAPY", "type": "uint256"},
          {"internalType": "uint256", "name": "bestPerformingStrategy", "type": "uint256"},
          {"internalType": "uint256", "name": "worstPerformingStrategy", "type": "uint256"},
          {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
        ],
        "internalType": "struct AnalyticsEngine.YieldAnalytics",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getCrossChainAnalytics",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "totalChains", "type": "uint256"},
          {"internalType": "uint256", "name": "totalBridges", "type": "uint256"},
          {"internalType": "uint256", "name": "totalBridgeVolume", "type": "uint256"},
          {"internalType": "uint256", "name": "averageBridgeTime", "type": "uint256"},
          {"internalType": "uint256", "name": "bridgeSuccessRate", "type": "uint256"},
          {"internalType": "uint256", "name": "gasOptimization", "type": "uint256"},
          {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
        ],
        "internalType": "struct AnalyticsEngine.CrossChainAnalytics",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// AI Strategy Engine ABI
const AI_STRATEGY_ENGINE_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "strategyId", "type": "uint256"}
    ],
    "name": "getAIStrategy",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "strategyId", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "targetAPY", "type": "uint256"},
          {"internalType": "uint256", "name": "riskLevel", "type": "uint256"},
          {"internalType": "uint256", "name": "minDeposit", "type": "uint256"},
          {"internalType": "uint256", "name": "maxDeposit", "type": "uint256"},
          {"internalType": "uint256[]", "name": "supportedTokens", "type": "uint256[]"},
          {"internalType": "uint256[]", "name": "supportedChains", "type": "uint256[]"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "lastOptimized", "type": "uint256"}
        ],
        "internalType": "struct AIStrategyEngine.AIStrategy",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveAIStrategies",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "strategyId", "type": "uint256"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "targetAPY", "type": "uint256"},
          {"internalType": "uint256", "name": "riskLevel", "type": "uint256"},
          {"internalType": "uint256", "name": "minDeposit", "type": "uint256"},
          {"internalType": "uint256", "name": "maxDeposit", "type": "uint256"},
          {"internalType": "uint256[]", "name": "supportedTokens", "type": "uint256[]"},
          {"internalType": "uint256[]", "name": "supportedChains", "type": "uint256[]"},
          {"internalType": "bool", "name": "isActive", "type": "bool"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "lastOptimized", "type": "uint256"}
        ],
        "internalType": "struct AIStrategyEngine.AIStrategy[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getUserProfile",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "riskTolerance", "type": "uint256"},
          {"internalType": "uint256", "name": "investmentHorizon", "type": "uint256"},
          {"internalType": "uint256", "name": "preferredChains", "type": "uint256"},
          {"internalType": "uint256", "name": "preferredTokens", "type": "uint256"},
          {"internalType": "uint256", "name": "totalPortfolioValue", "type": "uint256"},
          {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
        ],
        "internalType": "struct AIStrategyEngine.UserProfile",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getLatestRecommendation",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "strategyId", "type": "uint256"},
          {"internalType": "uint256", "name": "confidence", "type": "uint256"},
          {"internalType": "uint256", "name": "expectedAPY", "type": "uint256"},
          {"internalType": "uint256", "name": "riskScore", "type": "uint256"},
          {"internalType": "uint256", "name": "recommendedAmount", "type": "uint256"},
          {"internalType": "string", "name": "reasoning", "type": "string"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "internalType": "struct AIStrategyEngine.StrategyRecommendation",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMarketConditions",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "marketVolatility", "type": "uint256"},
          {"internalType": "uint256", "name": "yieldEnvironment", "type": "uint256"},
          {"internalType": "uint256", "name": "liquidityConditions", "type": "uint256"},
          {"internalType": "uint256", "name": "gasPrices", "type": "uint256"},
          {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
        ],
        "internalType": "struct AIStrategyEngine.MarketConditions",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Types
export interface PortfolioMetrics {
  totalValue: bigint;
  totalDeposits: bigint;
  totalWithdrawals: bigint;
  totalYield: bigint;
  activeStrategies: bigint;
  crossChainPositions: bigint;
  lastUpdated: bigint;
}

export interface StrategyPerformance {
  strategyId: bigint;
  totalDeposits: bigint;
  totalWithdrawals: bigint;
  totalYield: bigint;
  currentAPY: bigint;
  riskScore: bigint;
  sharpeRatio: bigint;
  maxDrawdown: bigint;
  lastUpdated: bigint;
}

export interface RiskMetrics {
  portfolioRisk: bigint;
  concentrationRisk: bigint;
  liquidityRisk: bigint;
  smartContractRisk: bigint;
  marketRisk: bigint;
  lastCalculated: bigint;
}

export interface YieldAnalytics {
  dailyYield: bigint;
  weeklyYield: bigint;
  monthlyYield: bigint;
  yearlyYield: bigint;
  averageAPY: bigint;
  bestPerformingStrategy: bigint;
  worstPerformingStrategy: bigint;
  lastUpdated: bigint;
}

export interface CrossChainAnalytics {
  totalChains: bigint;
  totalBridges: bigint;
  totalBridgeVolume: bigint;
  averageBridgeTime: bigint;
  bridgeSuccessRate: bigint;
  gasOptimization: bigint;
  lastUpdated: bigint;
}

export interface AIStrategy {
  strategyId: bigint;
  name: string;
  description: string;
  targetAPY: bigint;
  riskLevel: bigint;
  minDeposit: bigint;
  maxDeposit: bigint;
  supportedTokens: bigint[];
  supportedChains: bigint[];
  isActive: boolean;
  createdAt: bigint;
  lastOptimized: bigint;
}

export interface UserProfile {
  riskTolerance: bigint;
  investmentHorizon: bigint;
  preferredChains: bigint;
  preferredTokens: bigint;
  totalPortfolioValue: bigint;
  lastUpdated: bigint;
}

export interface StrategyRecommendation {
  strategyId: bigint;
  confidence: bigint;
  expectedAPY: bigint;
  riskScore: bigint;
  recommendedAmount: bigint;
  reasoning: string;
  timestamp: bigint;
}

export interface MarketConditions {
  marketVolatility: bigint;
  yieldEnvironment: bigint;
  liquidityConditions: bigint;
  gasPrices: bigint;
  lastUpdated: bigint;
}

// Contract addresses
const ANALYTICS_ENGINE_CONTRACT = process.env.NEXT_PUBLIC_ANALYTICS_ENGINE_CONTRACT || '0x0000000000000000000000000000000000000000';
const AI_STRATEGY_ENGINE_CONTRACT = process.env.NEXT_PUBLIC_AI_STRATEGY_ENGINE_CONTRACT || '0x0000000000000000000000000000000000000000';

export function useAnalytics() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portfolio Metrics
  const { data: portfolioMetrics, refetch: refetchPortfolio } = useContractRead({
    address: ANALYTICS_ENGINE_CONTRACT as `0x${string}`,
    abi: ANALYTICS_ENGINE_ABI,
    functionName: 'getPortfolioMetrics',
    args: address ? [address] : undefined,
    enabled: isConnected && address !== undefined,
  });

  // Risk Metrics
  const { data: riskMetrics, refetch: refetchRisk } = useContractRead({
    address: ANALYTICS_ENGINE_CONTRACT as `0x${string}`,
    abi: ANALYTICS_ENGINE_ABI,
    functionName: 'getRiskMetrics',
    args: address ? [address] : undefined,
    enabled: isConnected && address !== undefined,
  });

  // Yield Analytics
  const { data: yieldAnalytics, refetch: refetchYield } = useContractRead({
    address: ANALYTICS_ENGINE_CONTRACT as `0x${string}`,
    abi: ANALYTICS_ENGINE_ABI,
    functionName: 'getYieldAnalytics',
    args: address ? [address] : undefined,
    enabled: isConnected && address !== undefined,
  });

  // Cross-Chain Analytics
  const { data: crossChainAnalytics, refetch: refetchCrossChain } = useContractRead({
    address: ANALYTICS_ENGINE_CONTRACT as `0x${string}`,
    abi: ANALYTICS_ENGINE_ABI,
    functionName: 'getCrossChainAnalytics',
    args: address ? [address] : undefined,
    enabled: isConnected && address !== undefined,
  });

  // AI Strategies
  const { data: aiStrategies, refetch: refetchAIStrategies } = useContractRead({
    address: AI_STRATEGY_ENGINE_CONTRACT as `0x${string}`,
    abi: AI_STRATEGY_ENGINE_ABI,
    functionName: 'getActiveAIStrategies',
    enabled: true,
  });

  // User Profile
  const { data: userProfile, refetch: refetchUserProfile } = useContractRead({
    address: AI_STRATEGY_ENGINE_CONTRACT as `0x${string}`,
    abi: AI_STRATEGY_ENGINE_ABI,
    functionName: 'getUserProfile',
    args: address ? [address] : undefined,
    enabled: isConnected && address !== undefined,
  });

  // Latest Recommendation
  const { data: latestRecommendation, refetch: refetchRecommendation } = useContractRead({
    address: AI_STRATEGY_ENGINE_CONTRACT as `0x${string}`,
    abi: AI_STRATEGY_ENGINE_ABI,
    functionName: 'getLatestRecommendation',
    args: address ? [address] : undefined,
    enabled: isConnected && address !== undefined,
  });

  // Market Conditions
  const { data: marketConditions, refetch: refetchMarketConditions } = useContractRead({
    address: AI_STRATEGY_ENGINE_CONTRACT as `0x${string}`,
    abi: AI_STRATEGY_ENGINE_ABI,
    functionName: 'getMarketConditions',
    enabled: true,
  });

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!isConnected || !address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        refetchPortfolio(),
        refetchRisk(),
        refetchYield(),
        refetchCrossChain(),
        refetchAIStrategies(),
        refetchUserProfile(),
        refetchRecommendation(),
        refetchMarketConditions(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics data');
    } finally {
      setLoading(false);
    }
  }, [
    isConnected,
    address,
    refetchPortfolio,
    refetchRisk,
    refetchYield,
    refetchCrossChain,
    refetchAIStrategies,
    refetchUserProfile,
    refetchRecommendation,
    refetchMarketConditions,
  ]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected || !address) return;
    
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address, refreshAll]);

  // Check if contracts are deployed
  const isAnalyticsDeployed = ANALYTICS_ENGINE_CONTRACT !== '0x0000000000000000000000000000000000000000';
  const isAIEngineDeployed = AI_STRATEGY_ENGINE_CONTRACT !== '0x0000000000000000000000000000000000000000';

  return {
    // Data
    portfolioMetrics: portfolioMetrics as PortfolioMetrics | undefined,
    riskMetrics: riskMetrics as RiskMetrics | undefined,
    yieldAnalytics: yieldAnalytics as YieldAnalytics | undefined,
    crossChainAnalytics: crossChainAnalytics as CrossChainAnalytics | undefined,
    aiStrategies: aiStrategies as AIStrategy[] | undefined,
    userProfile: userProfile as UserProfile | undefined,
    latestRecommendation: latestRecommendation as StrategyRecommendation | undefined,
    marketConditions: marketConditions as MarketConditions | undefined,
    
    // State
    loading,
    error,
    isConnected,
    isAnalyticsDeployed,
    isAIEngineDeployed,
    
    // Actions
    refreshAll,
    refetchPortfolio,
    refetchRisk,
    refetchYield,
    refetchCrossChain,
    refetchAIStrategies,
    refetchUserProfile,
    refetchRecommendation,
    refetchMarketConditions,
  };
}

// Utility functions
export function formatAPY(apy: bigint): string {
  return (Number(apy) / 100).toFixed(2) + '%';
}

export function formatRiskScore(riskScore: bigint): string {
  return Number(riskScore).toString();
}

export function formatYield(yieldAmount: bigint): string {
  return formatEther(yieldAmount);
}

export function formatValue(value: bigint): string {
  return formatEther(value);
}

export function getRiskLevel(riskScore: bigint): 'Low' | 'Medium' | 'High' {
  const score = Number(riskScore);
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
}

export function getRiskColor(riskScore: bigint): string {
  const score = Number(riskScore);
  if (score <= 33) return 'text-green-600';
  if (score <= 66) return 'text-yellow-600';
  return 'text-red-600';
}
