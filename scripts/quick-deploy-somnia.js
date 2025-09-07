const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Quick Deploy to Somnia Testnet");
  console.log("=====================================");
  
  // Check if we're on the right network
  const network = await ethers.provider.getNetwork();
  console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  if (network.chainId !== 50312n) {
    console.error("❌ Error: This script is designed for Somnia testnet (Chain ID: 50312)");
    console.error(`Current network: ${network.name} (Chain ID: ${network.chainId})`);
    process.exit(1);
  }
  
  console.log("✅ Connected to Somnia testnet successfully!");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} STT`);
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.warn("⚠️  Warning: Low balance. You may need more STT for gas fees.");
  }

  console.log("\n🏗️  Deploying contracts...");
  
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

  // Create initial vaults with real Somnia testnet addresses
  console.log("\n💰 Creating initial vaults...");
  
  // Using real addresses from Somnia testnet transactions
  const vaults = [
    {
      name: "USDC Vault",
      address: "0x420f8ab112fa8b14c706e277204c8fc3eb0f4c92", // Real address from network
      rate: 520 // 5.2% APY
    },
    {
      name: "USDT Vault", 
      address: "0xb98c15a0dc1e271132e341250703c7e94c059e8d", // Real address from network
      rate: 480 // 4.8% APY
    },
    {
      name: "DAI Vault",
      address: "0xe7cf68c601f103e6daaeb75e1268019098815ea2", // Real address from network
      rate: 430 // 4.3% APY
    }
  ];

  for (const vault of vaults) {
    try {
      console.log(`   Creating ${vault.name}...`);
      const tx = await fluidVault.createVault(vault.address, vault.rate);
      await tx.wait();
      console.log(`   ✅ ${vault.name} created with ${vault.rate/100}% APY`);
    } catch (error) {
      console.log(`   ❌ Failed to create ${vault.name}: ${error.message}`);
    }
  }

  // Set up governance
  console.log("\n🔐 Setting up governance...");
  try {
    const tx = await governance.addAuthorizedVoter(deployer.address, 10000);
    await tx.wait();
    console.log("   ✅ Governance permissions configured");
  } catch (error) {
    console.log(`   ❌ Governance setup failed: ${error.message}`);
  }

  // Generate environment file
  console.log("\n📄 Generating environment configuration...");
  const envContent = `# FluidVault Deployment - Somnia Testnet
# Generated on ${new Date().toISOString()}

# Contract Addresses
NEXT_PUBLIC_CONTRACT_ADDRESS=${fluidVault.address}
NEXT_PUBLIC_INTEREST_CALCULATOR_ADDRESS=${interestCalculator.address}
NEXT_PUBLIC_GOVERNANCE_ADDRESS=${governance.address}

# Network Configuration
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
NEXT_PUBLIC_SOMNIA_CHAIN_ID=50312

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id

# Deployment Info
DEPLOYER_ADDRESS=${deployer.address}
DEPLOYMENT_TIMESTAMP=${new Date().toISOString()}
`;

  const envFile = path.join(__dirname, "..", ".env.local");
  fs.writeFileSync(envFile, envContent);
  console.log(`   ✅ Environment file created: .env.local`);

  // Save deployment info
  const deploymentInfo = {
    network: "somnia-testnet",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      FluidVault: fluidVault.address,
      InterestCalculator: interestCalculator.address,
      Governance: governance.address
    },
    vaults: vaults.map(v => ({
      name: v.name,
      address: v.address,
      rate: v.rate
    }))
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "somnia-testnet.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`   ✅ Deployment info saved: deployments/somnia-testnet.json`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log(`   FluidVault: ${fluidVault.address}`);
  console.log(`   InterestCalculator: ${interestCalculator.address}`);
  console.log(`   Governance: ${governance.address}`);
  
  console.log("\n🔗 Block Explorer Links:");
  console.log(`   FluidVault: https://shannon-explorer.somnia.network/address/${fluidVault.address}`);
  console.log(`   InterestCalculator: https://shannon-explorer.somnia.network/address/${interestCalculator.address}`);
  console.log(`   Governance: https://shannon-explorer.somnia.network/address/${governance.address}`);
  
  console.log("\n🚀 Next Steps:");
  console.log("   1. Restart your development server: npm run dev");
  console.log("   2. Open http://localhost:3000");
  console.log("   3. Connect your wallet to Somnia testnet");
  console.log("   4. Test deposit and withdraw functionality");
  console.log("   5. Verify transactions on Shannon Explorer");
  
  console.log("\n⚠️  Important:");
  console.log("   - Your .env.local file has been updated with contract addresses");
  console.log("   - Make sure your wallet is connected to Somnia testnet");
  console.log("   - You'll need STT tokens for gas fees");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
