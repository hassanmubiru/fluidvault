import { useState } from 'react';
import { useContractWrite } from 'wagmi';
import { parseEther } from 'ethers';

// ERC20 ABI for token approval
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

export function useTokenApproval() {
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const { writeAsync: writeApprove, isLoading: isApprovalLoading } = useContractWrite({
    abi: ERC20_ABI,
    functionName: 'approve',
  });

  const approveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ) => {
    setIsApproving(true);
    setApprovalError(null);

    try {
      console.log('Approving token:', tokenAddress, 'for spender:', spenderAddress, 'amount:', amount);
      
      // Convert amount to wei
      const amountWei = parseEther(amount);
      
      // Call the approve function
      const tx = await writeApprove({
        address: tokenAddress as `0x${string}`,
        args: [spenderAddress as `0x${string}`, amountWei],
      });
      
      console.log('Approval transaction submitted:', tx.hash);
      return tx.hash;
    } catch (err: any) {
      console.error('Token approval failed:', err);
      setApprovalError(err.message || 'Token approval failed');
      throw err;
    } finally {
      setIsApproving(false);
    }
  };

  return {
    approveToken,
    isApproving: isApproving || isApprovalLoading,
    approvalError,
  };
}
