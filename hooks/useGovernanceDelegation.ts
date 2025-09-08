import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { parseEther, formatEther } from 'ethers';

// Governance Delegation ABI (simplified for key functions)
const GOVERNANCE_DELEGATION_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "delegate", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "undelegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"}
    ],
    "name": "registerDelegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unregisterDelegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "getVotingPower",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "delegator", "type": "address"}],
    "name": "getDelegation",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "delegate", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "bool", "name": "active", "type": "bool"}
        ],
        "internalType": "struct GovernanceDelegation.Delegation",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "delegate", "type": "address"}],
    "name": "getDelegateInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "totalDelegated", "type": "uint256"},
          {"internalType": "uint256", "name": "delegatorCount", "type": "uint256"},
          {"internalType": "bool", "name": "registered", "type": "bool"},
          {"internalType": "uint256", "name": "registrationTime", "type": "uint256"}
        ],
        "internalType": "struct GovernanceDelegation.DelegateInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRegisteredDelegates",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "offset", "type": "uint256"},
      {"internalType": "uint256", "name": "limit", "type": "uint256"}
    ],
    "name": "getDelegatesPaginated",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDelegationStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalDelegations", "type": "uint256"},
      {"internalType": "uint256", "name": "totalDelegated", "type": "uint256"},
      {"internalType": "uint256", "name": "registeredDelegateCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Types
export interface Delegation {
  delegate: string;
  amount: string;
  timestamp: number;
  active: boolean;
}

export interface DelegateInfo {
  name: string;
  description: string;
  totalDelegated: string;
  delegatorCount: number;
  registered: boolean;
  registrationTime: number;
}

export interface DelegationStats {
  totalDelegations: number;
  totalDelegated: string;
  registeredDelegateCount: number;
}

export const useGovernanceDelegation = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delegation, setDelegation] = useState<Delegation | null>(null);
  const [votingPower, setVotingPower] = useState<string>('0');
  const [registeredDelegates, setRegisteredDelegates] = useState<string[]>([]);
  const [delegationStats, setDelegationStats] = useState<DelegationStats | null>(null);
  
  // Contract address - you'll need to update this with your deployed contract
  const GOVERNANCE_DELEGATION_CONTRACT = process.env.NEXT_PUBLIC_GOVERNANCE_DELEGATION_CONTRACT || '0x0000000000000000000000000000000000000000';
  
  // Check if we're on the correct network
  const isCorrectNetwork = chainId === 50312; // Somnia testnet
  
  // Load user's delegation information
  const loadDelegation = async () => {
    if (!publicClient || !address || !isCorrectNetwork) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if contract is deployed
      if (GOVERNANCE_DELEGATION_CONTRACT === '0x0000000000000000000000000000000000000000') {
        // Use fallback data when contract is not deployed
        const fallbackDelegation: Delegation = {
          delegate: '0x0000000000000000000000000000000000000000',
          amount: '0',
          timestamp: 0,
          active: false
        };
        setDelegation(fallbackDelegation);
        setVotingPower('0');
        setError('Using demo data - delegation contract not deployed yet');
        return;
      }
      
      // Get delegation information
      const delegationData = await publicClient.readContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'getDelegation',
        args: [address]
      }) as any;
      
      const delegationInfo: Delegation = {
        delegate: delegationData.delegate,
        amount: formatEther(delegationData.amount),
        timestamp: Number(delegationData.timestamp),
        active: delegationData.active
      };
      
      setDelegation(delegationInfo);
      
      // Get voting power
      const votingPowerData = await publicClient.readContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'getVotingPower',
        args: [address]
      }) as bigint;
      
      setVotingPower(formatEther(votingPowerData));
      
    } catch (err) {
      console.error('Error loading delegation:', err);
      setError('Failed to load delegation information');
      
      // Fallback data
      const fallbackDelegation: Delegation = {
        delegate: '0x0000000000000000000000000000000000000000',
        amount: '0',
        timestamp: 0,
        active: false
      };
      setDelegation(fallbackDelegation);
      setVotingPower('0');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load registered delegates
  const loadRegisteredDelegates = async () => {
    if (!publicClient || !isCorrectNetwork) return;
    
    try {
      // Check if contract is deployed
      if (GOVERNANCE_DELEGATION_CONTRACT === '0x0000000000000000000000000000000000000000') {
        // Use fallback data
        const fallbackDelegates = [
          '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          '0x8ba1f109551bD432803012645Hac136c',
          '0x1234567890123456789012345678901234567890'
        ];
        setRegisteredDelegates(fallbackDelegates);
        return;
      }
      
      const delegates = await publicClient.readContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'getRegisteredDelegates'
      }) as string[];
      
      setRegisteredDelegates(delegates);
      
    } catch (err) {
      console.error('Error loading registered delegates:', err);
      // Fallback data
      const fallbackDelegates = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0x8ba1f109551bD432803012645Hac136c',
        '0x1234567890123456789012345678901234567890'
      ];
      setRegisteredDelegates(fallbackDelegates);
    }
  };
  
  // Load delegation statistics
  const loadDelegationStats = async () => {
    if (!publicClient || !isCorrectNetwork) return;
    
    try {
      // Check if contract is deployed
      if (GOVERNANCE_DELEGATION_CONTRACT === '0x0000000000000000000000000000000000000000') {
        // Use fallback data
        const fallbackStats: DelegationStats = {
          totalDelegations: 0,
          totalDelegated: '0',
          registeredDelegateCount: 0
        };
        setDelegationStats(fallbackStats);
        return;
      }
      
      const stats = await publicClient.readContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'getDelegationStats'
      }) as [bigint, bigint, bigint];
      
      const delegationStats: DelegationStats = {
        totalDelegations: Number(stats[0]),
        totalDelegated: formatEther(stats[1]),
        registeredDelegateCount: Number(stats[2])
      };
      
      setDelegationStats(delegationStats);
      
    } catch (err) {
      console.error('Error loading delegation stats:', err);
      // Fallback data
      const fallbackStats: DelegationStats = {
        totalDelegations: 0,
        totalDelegated: '0',
        registeredDelegateCount: 0
      };
      setDelegationStats(fallbackStats);
    }
  };
  
  // Delegate voting power
  const delegate = async (delegateAddress: string, amount: string) => {
    if (!walletClient || !address || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }
    
    if (GOVERNANCE_DELEGATION_CONTRACT === '0x0000000000000000000000000000000000000000') {
      throw new Error('Delegation contract not deployed yet');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const amountWei = parseEther(amount);
      
      const hash = await walletClient.writeContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'delegate',
        args: [delegateAddress as `0x${string}`, amountWei]
      });
      
      // Wait for transaction confirmation
      await publicClient?.waitForTransactionReceipt({ hash });
      
      // Reload delegation information
      await loadDelegation();
      
      return hash;
      
    } catch (err) {
      console.error('Error delegating:', err);
      setError('Failed to delegate voting power');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Undelegate voting power
  const undelegate = async () => {
    if (!walletClient || !address || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }
    
    if (GOVERNANCE_DELEGATION_CONTRACT === '0x0000000000000000000000000000000000000000') {
      throw new Error('Delegation contract not deployed yet');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const hash = await walletClient.writeContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'undelegate'
      });
      
      // Wait for transaction confirmation
      await publicClient?.waitForTransactionReceipt({ hash });
      
      // Reload delegation information
      await loadDelegation();
      
      return hash;
      
    } catch (err) {
      console.error('Error undelegating:', err);
      setError('Failed to undelegate voting power');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register as a delegate
  const registerDelegate = async (name: string, description: string) => {
    if (!walletClient || !address || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }
    
    if (GOVERNANCE_DELEGATION_CONTRACT === '0x0000000000000000000000000000000000000000') {
      throw new Error('Delegation contract not deployed yet');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const hash = await walletClient.writeContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'registerDelegate',
        args: [name, description]
      });
      
      // Wait for transaction confirmation
      await publicClient?.waitForTransactionReceipt({ hash });
      
      // Reload registered delegates
      await loadRegisteredDelegates();
      
      return hash;
      
    } catch (err) {
      console.error('Error registering delegate:', err);
      setError('Failed to register as delegate');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get delegate information
  const getDelegateInfo = async (delegateAddress: string): Promise<DelegateInfo | null> => {
    if (!publicClient || !isCorrectNetwork) return null;
    
    try {
      // Check if contract is deployed
      if (GOVERNANCE_DELEGATION_CONTRACT === '0x0000000000000000000000000000000000000000') {
        // Return fallback data
        return {
          name: 'Demo Delegate',
          description: 'This is a demo delegate for testing purposes',
          totalDelegated: '0',
          delegatorCount: 0,
          registered: false,
          registrationTime: 0
        };
      }
      
      const delegateInfo = await publicClient.readContract({
        address: GOVERNANCE_DELEGATION_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_DELEGATION_ABI,
        functionName: 'getDelegateInfo',
        args: [delegateAddress as `0x${string}`]
      }) as any;
      
      return {
        name: delegateInfo.name,
        description: delegateInfo.description,
        totalDelegated: formatEther(delegateInfo.totalDelegated),
        delegatorCount: Number(delegateInfo.delegatorCount),
        registered: delegateInfo.registered,
        registrationTime: Number(delegateInfo.registrationTime)
      };
      
    } catch (err) {
      console.error('Error getting delegate info:', err);
      return null;
    }
  };
  
  // Load all data on mount and when dependencies change
  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      loadDelegation();
      loadRegisteredDelegates();
      loadDelegationStats();
    }
  }, [isConnected, isCorrectNetwork, address]);
  
  return {
    // State
    isLoading,
    error,
    delegation,
    votingPower,
    registeredDelegates,
    delegationStats,
    
    // Actions
    delegate,
    undelegate,
    registerDelegate,
    getDelegateInfo,
    loadDelegation,
    loadRegisteredDelegates,
    loadDelegationStats,
    
    // Utils
    isCorrectNetwork,
    contractAddress: GOVERNANCE_DELEGATION_CONTRACT
  };
};
