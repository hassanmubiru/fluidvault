import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'ethers';

// Governance contract ABI (simplified for key functions)
const GOVERNANCE_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint8", "name": "proposalType", "type": "uint8"},
      {"internalType": "bytes", "name": "data", "type": "bytes"}
    ],
    "name": "createProposal",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"internalType": "bool", "name": "support", "type": "bool"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
    "name": "cancelProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "proposals",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "proposer", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "forVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "againstVotes", "type": "uint256"},
      {"internalType": "bool", "name": "executed", "type": "bool"},
      {"internalType": "bool", "name": "cancelled", "type": "bool"},
      {"internalType": "uint8", "name": "proposalType", "type": "uint8"},
      {"internalType": "bytes", "name": "data", "type": "bytes"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "votingPower",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "votes",
    "outputs": [
      {"internalType": "bool", "name": "hasVoted", "type": "bool"},
      {"internalType": "bool", "name": "support", "type": "bool"},
      {"internalType": "uint256", "name": "weight", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingPeriod",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "quorumThreshold",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "majorityThreshold",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface Proposal {
  id: number;
  proposer: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  forVotes: string;
  againstVotes: string;
  executed: boolean;
  cancelled: boolean;
  proposalType: number;
  data: string;
}

export interface UserVote {
  hasVoted: boolean;
  support: boolean;
  weight: string;
}

export interface GovernanceParams {
  votingPeriod: number;
  quorumThreshold: number;
  majorityThreshold: number;
}

export const PROPOSAL_TYPES = {
  0: 'Interest Rate Update',
  1: 'Platform Fee Update', 
  2: 'Vault Creation',
  3: 'Vault Deactivation',
  4: 'Operator Management',
  5: 'Emergency Pause',
  6: 'Parameter Update'
} as const;

export function useGovernance() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userVotingPower, setUserVotingPower] = useState<string>('0');
  const [governanceParams, setGovernanceParams] = useState<GovernanceParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract address - you'll need to update this with your deployed governance contract
  const GOVERNANCE_CONTRACT = process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT || '0x0000000000000000000000000000000000000000';

  // Load all proposals
  const loadProposals = async () => {
    if (!publicClient) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const proposalCount = await publicClient.readContract({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_ABI,
        functionName: 'proposalCount'
      }) as bigint;

      const proposalPromises = [];
      for (let i = 0; i < Number(proposalCount); i++) {
        proposalPromises.push(
          publicClient.readContract({
            address: GOVERNANCE_CONTRACT as `0x${string}`,
            abi: GOVERNANCE_ABI,
            functionName: 'proposals',
            args: [BigInt(i)]
          })
        );
      }

      const proposalResults = await Promise.all(proposalPromises);
      const formattedProposals = proposalResults.map((proposal: any, index) => ({
        id: index,
        proposer: proposal[1],
        title: proposal[2],
        description: proposal[3],
        startTime: Number(proposal[4]),
        endTime: Number(proposal[5]),
        forVotes: formatEther(proposal[6]),
        againstVotes: formatEther(proposal[7]),
        executed: proposal[8],
        cancelled: proposal[9],
        proposalType: Number(proposal[10]),
        data: proposal[11]
      }));

      setProposals(formattedProposals);
    } catch (err: any) {
      console.error('Failed to load proposals:', err);
      setError('Failed to load proposals');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user voting power
  const loadUserVotingPower = async () => {
    if (!publicClient || !address) return;
    
    try {
      const power = await publicClient.readContract({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_ABI,
        functionName: 'votingPower',
        args: [address]
      }) as bigint;

      setUserVotingPower(formatEther(power));
    } catch (err: any) {
      console.error('Failed to load voting power:', err);
    }
  };

  // Load governance parameters
  const loadGovernanceParams = async () => {
    if (!publicClient) return;
    
    try {
      const [votingPeriod, quorumThreshold, majorityThreshold] = await Promise.all([
        publicClient.readContract({
          address: GOVERNANCE_CONTRACT as `0x${string}`,
          abi: GOVERNANCE_ABI,
          functionName: 'votingPeriod'
        }) as Promise<bigint>,
        publicClient.readContract({
          address: GOVERNANCE_CONTRACT as `0x${string}`,
          abi: GOVERNANCE_ABI,
          functionName: 'quorumThreshold'
        }) as Promise<bigint>,
        publicClient.readContract({
          address: GOVERNANCE_CONTRACT as `0x${string}`,
          abi: GOVERNANCE_ABI,
          functionName: 'majorityThreshold'
        }) as Promise<bigint>
      ]);

      setGovernanceParams({
        votingPeriod: Number(votingPeriod),
        quorumThreshold: Number(quorumThreshold),
        majorityThreshold: Number(majorityThreshold)
      });
    } catch (err: any) {
      console.error('Failed to load governance params:', err);
    }
  };

  // Create a new proposal
  const createProposal = async (
    title: string,
    description: string,
    proposalType: number,
    data: string = '0x'
  ) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_ABI,
        functionName: 'createProposal',
        args: [title, description, proposalType, data as `0x${string}`]
      });

      console.log('Proposal creation transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to create proposal:', err);
      setError(err.message || 'Failed to create proposal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Vote on a proposal
  const vote = async (proposalId: number, support: boolean) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_ABI,
        functionName: 'vote',
        args: [BigInt(proposalId), support]
      });

      console.log('Vote transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to vote:', err);
      setError(err.message || 'Failed to vote');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute a proposal
  const executeProposal = async (proposalId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_ABI,
        functionName: 'executeProposal',
        args: [BigInt(proposalId)]
      });

      console.log('Execute proposal transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to execute proposal:', err);
      setError(err.message || 'Failed to execute proposal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a proposal
  const cancelProposal = async (proposalId: number) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const hash = await walletClient.writeContract({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_ABI,
        functionName: 'cancelProposal',
        args: [BigInt(proposalId)]
      });

      console.log('Cancel proposal transaction:', hash);
      return hash;
    } catch (err: any) {
      console.error('Failed to cancel proposal:', err);
      setError(err.message || 'Failed to cancel proposal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user's vote for a specific proposal
  const getUserVote = async (proposalId: number): Promise<UserVote | null> => {
    if (!publicClient || !address) return null;
    
    try {
      const vote = await publicClient.readContract({
        address: GOVERNANCE_CONTRACT as `0x${string}`,
        abi: GOVERNANCE_ABI,
        functionName: 'votes',
        args: [BigInt(proposalId), address]
      }) as [boolean, boolean, bigint];

      return {
        hasVoted: vote[0],
        support: vote[1],
        weight: formatEther(vote[2])
      };
    } catch (err: any) {
      console.error('Failed to get user vote:', err);
      return null;
    }
  };

  // Check if proposal is active
  const isProposalActive = (proposal: Proposal): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return now >= proposal.startTime && now <= proposal.endTime && !proposal.executed && !proposal.cancelled;
  };

  // Check if proposal can be executed
  const canExecuteProposal = (proposal: Proposal): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return now > proposal.endTime && !proposal.executed && !proposal.cancelled;
  };

  // Load all data on mount and when connected
  useEffect(() => {
    if (publicClient) {
      loadProposals();
      loadGovernanceParams();
    }
  }, [publicClient]);

  useEffect(() => {
    if (publicClient && address) {
      loadUserVotingPower();
    }
  }, [publicClient, address]);

  return {
    proposals,
    userVotingPower,
    governanceParams,
    isLoading,
    error,
    createProposal,
    vote,
    executeProposal,
    cancelProposal,
    getUserVote,
    isProposalActive,
    canExecuteProposal,
    loadProposals,
    loadUserVotingPower,
    loadGovernanceParams
  };
}
