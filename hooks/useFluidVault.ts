import { useState, useEffect } from 'react';
import { useAccount, useContract, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';

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

  // Get contract address from environment
  useEffect(() => {
    const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (address) {
      setContractAddress(address);
    }
  }, []);

  // Contract instances
  const fluidVaultContract = useContract({
    address: contractAddress as `0x${string}`,
    abi: FLUID_VAULT_ABI,
  });

  const interestCalculatorContract = useContract({
    address: process.env.NEXT_PUBLIC_INTEREST_CALCULATOR_ADDRESS as `0x${string}`,
    abi: INTEREST_CALCULATOR_ABI,
  });

  // Deposit function
  const deposit = async (tokenAddress: string, amount: string) => {
    if (!fluidVaultContract || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await fluidVaultContract.deposit(tokenAddress, amountWei);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw function
  const withdraw = async (tokenAddress: string, amount: string) => {
    if (!fluidVaultContract || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const amountWei = ethers.utils.parseEther(amount);
      const tx = await fluidVaultContract.withdraw(tokenAddress, amountWei);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw all function
  const withdrawAll = async (tokenAddress: string) => {
    if (!fluidVaultContract || !isConnected) {
      throw new Error('Contract not available or wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = await fluidVaultContract.withdrawAll(tokenAddress);
      await tx.wait();
      return tx;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current interest for user
  const getCurrentInterest = async (tokenAddress: string) => {
    if (!fluidVaultContract || !address) {
      return '0';
    }

    try {
      const interest = await fluidVaultContract.getCurrentInterest(address, tokenAddress);
      return ethers.utils.formatEther(interest);
    } catch (err) {
      console.error('Failed to get current interest:', err);
      return '0';
    }
  };

  // Get user deposit info
  const getUserDeposit = async (tokenAddress: string) => {
    if (!fluidVaultContract || !address) {
      return null;
    }

    try {
      const deposit = await fluidVaultContract.getUserDeposit(address, tokenAddress);
      return {
        amount: ethers.utils.formatEther(deposit.amount),
        timestamp: deposit.timestamp.toNumber(),
        lastInterestUpdate: deposit.lastInterestUpdate.toNumber(),
        accumulatedInterest: ethers.utils.formatEther(deposit.accumulatedInterest)
      };
    } catch (err) {
      console.error('Failed to get user deposit:', err);
      return null;
    }
  };

  // Get vault info
  const getVaultInfo = async (tokenAddress: string) => {
    if (!fluidVaultContract) {
      return null;
    }

    try {
      const vaultInfo = await fluidVaultContract.getVaultInfo(tokenAddress);
      return {
        token: vaultInfo.token,
        totalDeposits: ethers.utils.formatEther(vaultInfo.totalDeposits),
        totalInterestPaid: ethers.utils.formatEther(vaultInfo.totalInterestPaid),
        currentInterestRate: vaultInfo.currentInterestRate.toNumber(),
        lastRateUpdate: vaultInfo.lastRateUpdate.toNumber(),
        isActive: vaultInfo.isActive
      };
    } catch (err) {
      console.error('Failed to get vault info:', err);
      return null;
    }
  };

  // Check if token is supported
  const isTokenSupported = async (tokenAddress: string) => {
    if (!fluidVaultContract) {
      return false;
    }

    try {
      return await fluidVaultContract.supportedTokens(tokenAddress);
    } catch (err) {
      console.error('Failed to check token support:', err);
      return false;
    }
  };

  // Get total number of vaults
  const getTotalVaults = async () => {
    if (!fluidVaultContract) {
      return 0;
    }

    try {
      const total = await fluidVaultContract.totalVaults();
      return total.toNumber();
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
    if (!interestCalculatorContract) {
      return '0';
    }

    try {
      const principalWei = ethers.utils.parseEther(principal);
      const interest = await interestCalculatorContract.calculateInterest(
        principalWei,
        rate,
        timeElapsed
      );
      return ethers.utils.formatEther(interest);
    } catch (err) {
      console.error('Failed to calculate interest:', err);
      return '0';
    }
  };

  // Listen to contract events
  const listenToEvents = (callback: (event: any) => void) => {
    if (!fluidVaultContract) return;

    const depositFilter = fluidVaultContract.filters.Deposit(address);
    const withdrawalFilter = fluidVaultContract.filters.Withdrawal(address);
    const interestFilter = fluidVaultContract.filters.InterestAccrued(address);

    fluidVaultContract.on(depositFilter, callback);
    fluidVaultContract.on(withdrawalFilter, callback);
    fluidVaultContract.on(interestFilter, callback);

    return () => {
      fluidVaultContract.off(depositFilter, callback);
      fluidVaultContract.off(withdrawalFilter, callback);
      fluidVaultContract.off(interestFilter, callback);
    };
  };

  return {
    // State
    isLoading,
    error,
    contractAddress,
    isConnected,
    
    // Contract instances
    fluidVaultContract,
    interestCalculatorContract,
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
