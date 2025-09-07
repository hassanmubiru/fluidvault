const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Simple Deploy to Somnia Testnet");
  console.log("===================================");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} STT`);
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.warn("⚠️  Warning: Very low balance. You may need more STT for gas fees.");
  }

  console.log("\n🏗️  Deploying contracts...");
  
  try {
    // Deploy InterestCalculator
    console.log("1️⃣  Deploying InterestCalculator...");
    const InterestCalculator = await ethers.getContractFactory("InterestCalculator");
    const interestCalculator = await InterestCalculator.deploy();
    await interestCalculator.deployed();
    console.log(`   ✅ InterestCalculator: ${interestCalculator.address}`);

    // Deploy Governance
    console.log("2️⃣  Deploying Governance...");
    const Governance = await ethers.getContractFactory("Governance");
    const governance = await Governance.deploy();
    await governance.deployed();
    console.log(`   ✅ Governance: ${governance.address}`);

    // Deploy FluidVault
    console.log("3️⃣  Deploying FluidVault...");
    const FluidVault = await ethers.getContractFactory("FluidVault");
    const fluidVault = await FluidVault.deploy(
      interestCalculator.address,
      governance.address,
      deployer.address // Fee recipient
    );
    await fluidVault.deployed();
    console.log(`   ✅ FluidVault: ${fluidVault.address}`);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log(`   FluidVault: ${fluidVault.address}`);
    console.log(`   InterestCalculator: ${interestCalculator.address}`);
    console.log(`   Governance: ${governance.address}`);
    
    console.log("\n🔗 Block Explorer Links:");
    console.log(`   FluidVault: https://shannon-explorer.somnia.network/address/${fluidVault.address}`);
    console.log(`   InterestCalculator: https://shannon-explorer.somnia.network/address/${interestCalculator.address}`);
    console.log(`   Governance: https://shannon-explorer.somnia.network/address/${governance.address}`);
    
    console.log("\n📄 Update your .env.local file with:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${fluidVault.address}`);
    console.log(`NEXT_PUBLIC_INTEREST_CALCULATOR_ADDRESS=${interestCalculator.address}`);
    console.log(`NEXT_PUBLIC_GOVERNANCE_ADDRESS=${governance.address}`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.error("💡 Solution: Get more STT tokens from the Somnia testnet faucet");
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
