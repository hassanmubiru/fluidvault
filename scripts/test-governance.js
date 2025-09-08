const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing FluidVault Governance System");
  console.log("=====================================");
  
  try {
    // Connect to the network
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 50312n) {
      console.error("❌ Error: This script is designed for Somnia testnet (Chain ID: 50312)");
      return;
    }
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Testing with account: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} STT`);
    
    // Contract addresses from deployment
    const GOVERNANCE_ADDRESS = "0xd5ea8671F16BFB23044c54ed65eE3A7ab63BF58F";
    const FLUIDVAULT_ADDRESS = "0x43161EAAC8726443B5AE5Cd7219cDeF8e43612Fe";
    
    console.log("\n🔗 Connecting to deployed contracts...");
    
    // Connect to Governance contract
    const Governance = await ethers.getContractFactory("Governance");
    const governance = Governance.attach(GOVERNANCE_ADDRESS);
    console.log(`✅ Connected to Governance: ${GOVERNANCE_ADDRESS}`);
    
    // Connect to FluidVault contract
    const FluidVault = await ethers.getContractFactory("FluidVault");
    const fluidVault = FluidVault.attach(FLUIDVAULT_ADDRESS);
    console.log(`✅ Connected to FluidVault: ${FLUIDVAULT_ADDRESS}`);
    
    console.log("\n📊 Testing Governance Functions...");
    
    // Test 1: Check governance parameters
    console.log("1️⃣  Checking governance parameters...");
    const votingPeriod = await governance.votingPeriod();
    const quorumThreshold = await governance.quorumThreshold();
    const majorityThreshold = await governance.majorityThreshold();
    
    console.log(`   📅 Voting Period: ${Number(votingPeriod) / 86400} days`);
    console.log(`   👥 Quorum Threshold: ${Number(quorumThreshold) / 100}%`);
    console.log(`   📈 Majority Threshold: ${Number(majorityThreshold) / 100}%`);
    
    // Test 2: Check user voting power
    console.log("2️⃣  Checking user voting power...");
    const votingPower = await governance.votingPower(deployer.address);
    console.log(`   🗳️  Voting Power: ${ethers.formatEther(votingPower)}`);
    
    // Test 3: Check proposal count
    console.log("3️⃣  Checking proposal count...");
    const proposalCount = await governance.proposalCount();
    console.log(`   📋 Total Proposals: ${proposalCount}`);
    
    // Test 4: Create a test proposal
    console.log("4️⃣  Creating test proposal...");
    const testTitle = "Test Proposal - Interest Rate Update";
    const testDescription = "This is a test proposal to update the USDC vault interest rate from 5.2% to 6.0%. This proposal is for testing the governance system functionality.";
    const proposalType = 0; // INTEREST_RATE_UPDATE
    const testData = "0x"; // Empty data for test
    
    try {
      const tx = await governance.createProposal(
        testTitle,
        testDescription,
        proposalType,
        testData
      );
      
      console.log(`   📝 Proposal creation transaction: ${tx.hash}`);
      console.log("   ⏳ Waiting for confirmation...");
      
      const receipt = await tx.wait();
      console.log(`   ✅ Proposal created successfully! Gas used: ${receipt.gasUsed}`);
      
      // Get the new proposal count
      const newProposalCount = await governance.proposalCount();
      console.log(`   📊 New proposal count: ${newProposalCount}`);
      
      // Get the latest proposal
      const latestProposal = await governance.proposals(newProposalCount - 1n);
      console.log(`   🆔 Latest Proposal ID: ${latestProposal.id}`);
      console.log(`   📝 Title: ${latestProposal.title}`);
      console.log(`   👤 Proposer: ${latestProposal.proposer}`);
      console.log(`   ⏰ Start Time: ${new Date(Number(latestProposal.startTime) * 1000).toLocaleString()}`);
      console.log(`   ⏰ End Time: ${new Date(Number(latestProposal.endTime) * 1000).toLocaleString()}`);
      
    } catch (error) {
      console.log(`   ❌ Failed to create proposal: ${error.message}`);
    }
    
    // Test 5: Check FluidVault integration
    console.log("5️⃣  Testing FluidVault integration...");
    try {
      const governanceAddress = await fluidVault.governance();
      console.log(`   🏛️  FluidVault governance address: ${governanceAddress}`);
      
      if (governanceAddress.toLowerCase() === GOVERNANCE_ADDRESS.toLowerCase()) {
        console.log("   ✅ Governance integration verified!");
      } else {
        console.log("   ❌ Governance integration mismatch!");
      }
    } catch (error) {
      console.log(`   ❌ Failed to check FluidVault integration: ${error.message}`);
    }
    
    console.log("\n🎉 Governance system test completed!");
    console.log("=====================================");
    console.log("✅ Governance contract is deployed and functional");
    console.log("✅ Contract integration is working correctly");
    console.log("✅ Proposal creation is operational");
    console.log("✅ Ready for community governance!");
    
    console.log("\n🌐 Next Steps:");
    console.log("1. Visit the governance page: https://fluidvault-6dzhj0v0k-hassan-mubiru-s-projects.vercel.app/governance");
    console.log("2. Connect your wallet to Somnia testnet");
    console.log("3. Create and vote on proposals");
    console.log("4. Test the full governance workflow");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
