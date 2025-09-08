const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 FluidVault Deployment (No Private Key Required)");
  console.log("==================================================");
  
  try {
    // Check if we can connect to the network
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (network.chainId !== 50312n) {
      console.log("❌ Wrong network. Expected Somnia testnet (Chain ID: 50312)");
      return;
    }
    
    // Get the latest block to verify connection
    const latestBlock = await provider.getBlockNumber();
    console.log(`📦 Latest block: ${latestBlock}`);
    
    // Check if we have any accounts
    const signers = await ethers.getSigners();
    console.log(`📝 Available signers: ${signers.length}`);
    
    if (signers.length === 0) {
      console.log("❌ No signers available. This means:");
      console.log("   1. No private key configured in .env file");
      console.log("   2. Invalid private key format");
      console.log("");
      console.log("💡 To fix this:");
      console.log("   1. Get your private key from MetaMask");
      console.log("   2. Edit .env file: nano .env");
      console.log("   3. Replace: PRIVATE_KEY=your_private_key_here");
      console.log("   4. With: PRIVATE_KEY=0x1234567890abcdef...");
      console.log("");
      console.log("🔗 Get STT tokens from Somnia testnet faucet");
      console.log("📚 See DEPLOYMENT_SETUP.md for detailed instructions");
      return;
    }
    
    const deployer = signers[0];
    console.log(`📝 Deployer: ${deployer.address}`);
    
    // Check balance
    const balance = await provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} STT`);
    
    if (balance < ethers.parseEther("0.01")) {
      console.log("⚠️  Warning: Low balance. Get STT tokens from faucet.");
    }
    
    console.log("✅ Configuration looks good!");
    console.log("🚀 Ready to deploy contracts...");
    
    // Deploy contracts
    console.log("\n🏗️  Deploying contracts...");
    
    // Deploy InterestCalculator
    const InterestCalculator = await ethers.getContractFactory("InterestCalculator");
    console.log("📄 Deploying InterestCalculator...");
    const interestCalculator = await InterestCalculator.deploy();
    await interestCalculator.waitForDeployment();
    console.log(`✅ InterestCalculator: ${await interestCalculator.getAddress()}`);
    
    // Deploy Governance
    const Governance = await ethers.getContractFactory("Governance");
    console.log("📄 Deploying Governance...");
    const governance = await Governance.deploy();
    await governance.waitForDeployment();
    console.log(`✅ Governance: ${await governance.getAddress()}`);
    
    // Deploy FluidVault
    const FluidVault = await ethers.getContractFactory("FluidVault");
    console.log("📄 Deploying FluidVault...");
    const fluidVault = await FluidVault.deploy(
      await interestCalculator.getAddress(),
      await governance.getAddress(),
      deployer.address // Fee recipient
    );
    await fluidVault.waitForDeployment();
    console.log(`✅ FluidVault: ${await fluidVault.getAddress()}`);
    
    // Deploy MockERC20
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    console.log("📄 Deploying MockERC20...");
    const mockERC20 = await MockERC20.deploy("Somnia Test Token", "STT");
    await mockERC20.waitForDeployment();
    console.log(`✅ MockERC20: ${await mockERC20.getAddress()}`);
    
    console.log("\n🎉 Deployment successful!");
    console.log("==========================================");
    console.log("📋 Contract Addresses:");
    console.log(`   InterestCalculator: ${await interestCalculator.getAddress()}`);
    console.log(`   Governance: ${await governance.getAddress()}`);
    console.log(`   FluidVault: ${await fluidVault.getAddress()}`);
    console.log(`   MockERC20: ${await mockERC20.getAddress()}`);
    console.log("");
    console.log("🔗 View on explorer:");
    console.log(`   https://shannon-explorer.somnia.network/address/${await fluidVault.getAddress()}`);
    console.log("");
    console.log("📝 Update your .env.local file with these addresses:");
    console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${await fluidVault.getAddress()}`);
    console.log(`   NEXT_PUBLIC_INTEREST_CALCULATOR=${await interestCalculator.getAddress()}`);
    console.log(`   NEXT_PUBLIC_GOVERNANCE_CONTRACT=${await governance.getAddress()}`);
    console.log(`   NEXT_PUBLIC_MOCK_ERC20=${await mockERC20.getAddress()}`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("💡 Solution: Get STT tokens from Somnia testnet faucet");
    } else if (error.message.includes("network")) {
      console.log("💡 Solution: Check your internet connection");
    } else if (error.message.includes("private key")) {
      console.log("💡 Solution: Check your private key in .env file");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
