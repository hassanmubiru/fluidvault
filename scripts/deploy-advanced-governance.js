const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Advanced Governance Contracts...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "STT");
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low balance. You may need more STT for deployment.");
  }
  
  try {
    // Deploy a simple mock token first
    console.log("\n🪙 Deploying Mock Token...");
    const MockToken = await ethers.getContractFactory("contracts/MockToken.sol:MockToken");
    const mockToken = await MockToken.deploy("FluidVault Token", "FVT", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();
    const mockTokenAddress = await mockToken.getAddress();
    console.log("✅ MockToken deployed to:", mockTokenAddress);
    
    // Deploy GovernanceDelegation
    console.log("\n📋 Deploying GovernanceDelegation...");
    const GovernanceDelegation = await ethers.getContractFactory("GovernanceDelegation");
    const governanceDelegation = await GovernanceDelegation.deploy(
      mockTokenAddress // Use the deployed mock token
    );
    await governanceDelegation.waitForDeployment();
    const governanceDelegationAddress = await governanceDelegation.getAddress();
    console.log("✅ GovernanceDelegation deployed to:", governanceDelegationAddress);
    
    // Deploy AdvancedVoting
    console.log("\n🗳️  Deploying AdvancedVoting...");
    const AdvancedVoting = await ethers.getContractFactory("AdvancedVoting");
    const advancedVoting = await AdvancedVoting.deploy(
      mockTokenAddress, // Use the deployed mock token
      governanceDelegationAddress // Delegation contract address
    );
    await advancedVoting.waitForDeployment();
    const advancedVotingAddress = await advancedVoting.getAddress();
    console.log("✅ AdvancedVoting deployed to:", advancedVotingAddress);
    
    // Deploy GovernanceTimelock
    console.log("\n⏰ Deploying GovernanceTimelock...");
    const GovernanceTimelock = await ethers.getContractFactory("GovernanceTimelock");
    const governanceTimelock = await GovernanceTimelock.deploy(
      advancedVotingAddress, // Use voting contract as governance contract for now
      advancedVotingAddress, // Voting contract address
      2 * 24 * 60 * 60, // 2 days delay
      30 * 60 // 30 minutes emergency delay
    );
    await governanceTimelock.waitForDeployment();
    const governanceTimelockAddress = await governanceTimelock.getAddress();
    console.log("✅ GovernanceTimelock deployed to:", governanceTimelockAddress);
    
    // Deploy GovernanceEscrow
    console.log("\n🔒 Deploying GovernanceEscrow...");
    const GovernanceEscrow = await ethers.getContractFactory("GovernanceEscrow");
    const governanceEscrow = await GovernanceEscrow.deploy(
      mockTokenAddress, // Use the deployed mock token
      advancedVotingAddress, // Use voting contract as governance contract for now
      advancedVotingAddress // Voting contract address
    );
    await governanceEscrow.waitForDeployment();
    const governanceEscrowAddress = await governanceEscrow.getAddress();
    console.log("✅ GovernanceEscrow deployed to:", governanceEscrowAddress);
    
    console.log("\n🎉 Advanced Governance Contracts Deployment Complete!");
    console.log("\n📊 Contract Addresses:");
    console.log("   GovernanceDelegation:", governanceDelegationAddress);
    console.log("   AdvancedVoting:", advancedVotingAddress);
    console.log("   GovernanceTimelock:", governanceTimelockAddress);
    console.log("   GovernanceEscrow:", governanceEscrowAddress);
    
    console.log("\n🔧 Environment Variables to Set:");
    console.log(`   NEXT_PUBLIC_GOVERNANCE_DELEGATION_CONTRACT=${governanceDelegationAddress}`);
    console.log(`   NEXT_PUBLIC_ADVANCED_VOTING_CONTRACT=${advancedVotingAddress}`);
    console.log(`   NEXT_PUBLIC_GOVERNANCE_TIMELOCK_CONTRACT=${governanceTimelockAddress}`);
    console.log(`   NEXT_PUBLIC_GOVERNANCE_ESCROW_CONTRACT=${governanceEscrowAddress}`);
    
    console.log("\n📋 Next Steps:");
    console.log("1. Update environment variables in Vercel");
    console.log("2. Deploy frontend with new contract addresses");
    console.log("3. Test all advanced governance features");
    console.log("4. Verify contracts on Somnia testnet explorer");
    
    console.log("\n🚀 Advanced Governance System Ready!");
    console.log("The advanced governance system is now deployed with:");
    console.log("• Delegation system for voting power management");
    console.log("• Advanced voting mechanisms (quadratic, weighted, ranked)");
    console.log("• Timelock system for secure proposal execution");
    console.log("• Escrow system for governance participation rewards");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
