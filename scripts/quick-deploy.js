const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Quick FluidVault deployment to Somnia testnet...");
  
  // Check if we have a private key
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ Please set PRIVATE_KEY in your .env.local file");
    console.log("Example: PRIVATE_KEY=your_private_key_without_0x_prefix");
    process.exit(1);
  }

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "STT");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.warn("⚠️  Low balance! You may need more STT tokens for gas fees.");
    console.log("Get test tokens from Somnia Discord: https://discord.gg/somnia");
  }

  try {
    // Deploy InterestCalculator
    console.log("\n📊 Deploying InterestCalculator...");
    const InterestCalculator = await ethers.getContractFactory("InterestCalculator");
    const interestCalculator = await InterestCalculator.deploy();
    await interestCalculator.deployed();
    console.log("✅ InterestCalculator deployed to:", interestCalculator.address);

    // Deploy Governance
    console.log("\n🗳️ Deploying Governance...");
    const Governance = await ethers.getContractFactory("Governance");
    const governance = await Governance.deploy();
    await governance.deployed();
    console.log("✅ Governance deployed to:", governance.address);

    // Deploy FluidVault
    console.log("\n🏦 Deploying FluidVault...");
    const FluidVault = await ethers.getContractFactory("FluidVault");
    const fluidVault = await FluidVault.deploy(
      interestCalculator.address,
      governance.address,
      deployer.address // Fee recipient
    );
    await fluidVault.deployed();
    console.log("✅ FluidVault deployed to:", fluidVault.address);

    // Create initial vaults
    console.log("\n💰 Creating initial vaults...");
    
    // Mock token addresses for testing (replace with real addresses)
    const mockTokens = [
      { name: "USDC", address: "0x" + "1".repeat(40), rate: 500 },
      { name: "USDT", address: "0x" + "2".repeat(40), rate: 450 },
      { name: "DAI", address: "0x" + "3".repeat(40), rate: 400 }
    ];

    for (const token of mockTokens) {
      try {
        console.log(`Creating ${token.name} vault...`);
        await fluidVault.createVault(token.address, token.rate);
        console.log(`✅ ${token.name} vault created with ${token.rate/100}% APY`);
      } catch (error) {
        console.log(`❌ Failed to create ${token.name} vault:`, error.message);
      }
    }

    // Set up governance
    console.log("\n🔐 Setting up governance...");
    try {
      await governance.addAuthorizedVoter(deployer.address, 10000);
      console.log("✅ Governance permissions set up");
    } catch (error) {
      console.log("❌ Failed to set up governance:", error.message);
    }

    // Display results
    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log(`FluidVault: ${fluidVault.address}`);
    console.log(`InterestCalculator: ${interestCalculator.address}`);
    console.log(`Governance: ${governance.address}`);
    
    console.log("\n🔗 Block Explorer:");
    console.log(`https://shannon-explorer.somnia.network/address/${fluidVault.address}`);
    
    console.log("\n📄 Next Steps:");
    console.log("1. Copy the contract addresses above");
    console.log("2. Update your .env.local file with these addresses");
    console.log("3. Restart your frontend: npm run dev");
    console.log("4. Test the application with your deployed contracts");

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Get more STT tokens from Somnia Discord");
    } else if (error.message.includes("network")) {
      console.log("\n💡 Solution: Check your RPC URL and network configuration");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
