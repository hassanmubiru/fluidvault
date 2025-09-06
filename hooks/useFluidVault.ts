import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useContractWrite, useWaitForTransaction } from 'wagmi';
import { ethers, formatEther, parseEther } from 'ethers';

// Contract ABI (simplified for demo)
const FLUID_VAULT_ABI = [
  "function deposit(address token, uint256 amount) external",
  "function withdraw(address token, uint256 amount) external",
  "function withdrawAll(address token) external",
  "function getCurrentInterest(address user, address token) external view returns (uint256)",
  "function getUserDeposit(address user, address token) external view returns (tuple(uint256 amount, uint256 timestamp, uint256 lastInterestUpdate, uint256 accumulatedInterest))",
  "function getVaultInfo(address token) external view returns (tuple(address token, uint256 totalDeposits, uint256 totalInterestPaid, uint256 currentInterestRate, uint256 lastRateUpdate, bool isActive))",
  "function supportedTokens(address token) external view returns (bool)",
  "function totalVaults() external view returns (uint256)",
  "event Deposit(address indexed user, address indexed token, uint256 amount, uint256 timestamp)",
  "event Withdrawal(address indexed user, address indexed token, uint256 amount, uint256 interest, uint256 timestamp)",
  "event InterestAccrued(address indexed user, address indexed token, uint256 interest, uint256 timestamp)"
];

const INTEREST_CALCULATOR_ABI = [
  "function calculateInterest(uint256 principal, uint256 annualRate, uint256 timeElapsed) external pure returns (uint256)",
  "function calculateCompoundInterest(uint256 principal, uint256 annualRate, uint256 timeElapsed, uint256 compoundFrequency) external pure returns (uint256)"
];

export function useFluidVault() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Contract write hooks for real transactions
  const { writeAsync: writeDeposit, isLoading: isDepositLoading } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: FLUID_VAULT_ABI,
    functionName: 'deposit',
  });
  
  const { writeAsync: writeWithdraw, isLoading: isWithdrawLoading } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: FLUID_VAULT_ABI,
    functionName: 'withdraw',
  });

  // Get contract address from environment
  useEffect(() => {
    const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (address) {
      setContractAddress(address);
    }
  }, []);

  // Deposit function with real contract interaction
  const deposit = async (tokenAddress: string, amount: string) => {
    if (!contractAddress || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Depositing', amount, 'to token', tokenAddress);
      
      // Convert amount to wei
      const amountWei = parseEther(amount);
      
      // Call the real contract function
      const tx = await writeDeposit({
        args: [tokenAddress as `0x${string}`, amountWei],
      });
      
      console.log('Deposit transaction submitted:', tx.hash);
      return tx.hash;
    } catch (err: any) {
      console.error('Deposit failed:', err);
      setError(err.message || 'Deposit failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw function with real contract interaction
  const withdraw = async (tokenAddress: string, amount: string) => {
    if (!contractAddress || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Withdrawing', amount, 'from token', tokenAddress);
      
      // Convert amount to wei
      const amountWei = parseEther(amount);
      
      // Call the real contract function
      const tx = await writeWithdraw({
        args: [tokenAddress as `0x${string}`, amountWei],
      });
      
      console.log('Withdraw transaction submitted:', tx.hash);
      return tx.hash;
    } catch (err: any) {
      console.error('Withdraw failed:', err);
      setError(err.message || 'Withdraw failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw all function (simplified for demo)
  const withdrawAll = async (tokenAddress: string) => {
    if (!contractAddress || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation for demo
      console.log('Withdrawing all from token', tokenAddress);
      return '0x1234567890abcdef'; // Mock transaction hash
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current interest for user
  const getCurrentInterest = async (tokenAddress: string) => {
    if (!address) {
      return '0';
    }

    try {
      // For demo purposes, return mock data
      // In production, this would call the actual contract
      return '2.35'; // Mock current interest
    } catch (err) {
      console.error('Failed to get current interest:', err);
      return '0';
    }
  };

  // Get user deposit info
  const getUserDeposit = async (tokenAddress: string) => {
    if (!address) {
      return null;
    }

    try {
      // For demo purposes, return mock data
      // In production, this would call the actual contract
      const mockDeposit = {
        amount: '150.50', // Mock user balance
        timestamp: Date.now() - 86400000, // 1 day ago
        lastInterestUpdate: Date.now() - 3600000, // 1 hour ago
        accumulatedInterest: '2.35' // Mock accumulated interest
      };
      
      return mockDeposit;
    } catch (err) {
      console.error('Failed to get user deposit:', err);
      return null;
    }
  };

  // Get vault info
  const getVaultInfo = async (tokenAddress: string) => {
    if (!contractAddress) {
      return null;
    }

    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: FLUID_VAULT_ABI,
        functionName: 'getVaultInfo',
        args: [tokenAddress as `0x${string}`],
      });
      const vaultInfo = result as any;
      return {
        token: vaultInfo.token,
        totalDeposits: formatEther(vaultInfo.totalDeposits),
        totalInterestPaid: formatEther(vaultInfo.totalInterestPaid),
        currentInterestRate: Number(vaultInfo.currentInterestRate),
        lastRateUpdate: Number(vaultInfo.lastRateUpdate),
        isActive: vaultInfo.isActive
      };
    } catch (err) {
      console.error('Failed to get vault info:', err);
      return null;
    }
  };

  // Check if token is supported
  const isTokenSupported = async (tokenAddress: string) => {
    if (!contractAddress) {
      return false;
    }

    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: FLUID_VAULT_ABI,
        functionName: 'supportedTokens',
        args: [tokenAddress as `0x${string}`],
      });
      return result as boolean;
    } catch (err) {
      console.error('Failed to check token support:', err);
      return false;
    }
  };

  // Get total number of vaults
  const getTotalVaults = async () => {
    if (!contractAddress) {
      return 0;
    }

    try {
      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: FLUID_VAULT_ABI,
        functionName: 'totalVaults',
      });
      return Number(result);
    } catch (err) {
      console.error('Failed to get total vaults:', err);
      return 0;
    }
  };

  // Get total TVL (simplified - would need price oracles in production)
  const getTotalTVL = async () => {
    // This is a simplified version
    // In production, you'd need to:
    // 1. Get all vault addresses
    // 2. Get total deposits for each vault
    // 3. Convert to USD using price oracles
    // 4. Sum all values
    
    try {
      // Mock data for demo
      return '4.5M';
    } catch (err) {
      console.error('Failed to get total TVL:', err);
      return '0';
    }
  };

  // Calculate interest (using interest calculator)
  const calculateInterest = async (principal: string, rate: number, timeElapsed: number) => {
    const interestCalculatorAddress = process.env.NEXT_PUBLIC_INTEREST_CALCULATOR_ADDRESS;
    if (!interestCalculatorAddress) {
      return '0';
    }

    try {
      const principalWei = parseEther(principal);
      const result = await publicClient.readContract({
        address: interestCalculatorAddress as `0x${string}`,
        abi: INTEREST_CALCULATOR_ABI,
        functionName: 'calculateInterest',
        args: [principalWei, rate, timeElapsed],
      });
      return formatEther(result as bigint);
    } catch (err) {
      console.error('Failed to calculate interest:', err);
      return '0';
    }
  };

  // Listen to contract events (simplified for demo)
  const listenToEvents = (callback: (event: any) => void) => {
    // Note: Event listening would need to be implemented with the new wagmi hooks
    // This is a simplified version for demo purposes
    console.log('Event listening not implemented in this demo version');
    return () => {};
  };

  return {
    // State
    isLoading: isLoading || isDepositLoading || isWithdrawLoading,
    error,
    contractAddress,
    isConnected,
    
    // Transaction states
    isDepositLoading,
    isWithdrawLoading,
    
    // Client
    publicClient,
    
    // Functions
    deposit,
    withdraw,
    withdrawAll,
    getCurrentInterest,
    getUserDeposit,
    getVaultInfo,
    isTokenSupported,
    getTotalVaults,
    getTotalTVL,
    calculateInterest,
    listenToEvents,
  };
}
