const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Test Deployment - Checking Configuration");
  console.log("=============================================");
  
  try {
    // Check if we can get signers
    const signers = await ethers.getSigners();
    console.log(`📝 Found ${signers.length} signer(s)`);
    
    if (signers.length === 0) {
      console.log("❌ No signers found. This usually means:");
      console.log("   1. No private key configured in .env file");
      console.log("   2. Network connection issues");
      console.log("   3. Invalid private key format");
      console.log("");
      console.log("💡 Solutions:");
      console.log("   1. Create .env file with: PRIVATE_KEY=your_private_key_here");
      console.log("   2. Get STT tokens from Somnia testnet faucet");
      console.log("   3. Check your private key format (should start with 0x)");
      return;
    }
    
    const deployer = signers[0];
    console.log(`📝 Deployer address: ${deployer.address}`);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} STT`);
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      console.log("⚠️  Warning: Very low balance. You may need more STT for gas fees.");
      console.log("   Get STT tokens from: Somnia testnet faucet");
    }
    
    // Check network
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 50312n) {
      console.log("❌ Wrong network. Expected Somnia testnet (Chain ID: 50312)");
      return;
    }
    
    console.log("✅ Configuration looks good!");
    console.log("🚀 Ready to deploy contracts...");
    
    // Try to deploy a simple contract
    console.log("\n🏗️  Testing contract deployment...");
    
    const InterestCalculator = await ethers.getContractFactory("InterestCalculator");
    console.log("📄 InterestCalculator contract loaded");
    
    const interestCalculator = await InterestCalculator.deploy();
    console.log("⏳ Deploying InterestCalculator...");
    
    await interestCalculator.deployed();
    console.log(`✅ InterestCalculator deployed to: ${interestCalculator.address}`);
    
    console.log("\n🎉 Test deployment successful!");
    console.log("🔗 View on explorer: https://shannon-explorer.somnia.network/address/" + interestCalculator.address);
    
  } catch (error) {
    console.error("❌ Test deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Solution: Get more STT tokens from Somnia testnet faucet");
    } else if (error.message.includes("network")) {
      console.log("💡 Solution: Check your internet connection and RPC URL");
    } else if (error.message.includes("private key")) {
      console.log("💡 Solution: Check your private key in .env file");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
