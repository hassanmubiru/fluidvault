const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting FluidVault deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy InterestCalculator first
  console.log("\n📊 Deploying InterestCalculator...");
  const InterestCalculator = await ethers.getContractFactory("InterestCalculator");
  const interestCalculator = await InterestCalculator.deploy();
  await interestCalculator.deployed();
  console.log("InterestCalculator deployed to:", interestCalculator.address);

  // Deploy Governance
  console.log("\n🗳️ Deploying Governance...");
  const Governance = await ethers.getContractFactory("Governance");
  const governance = await Governance.deploy();
  await governance.deployed();
  console.log("Governance deployed to:", governance.address);

  // Deploy FluidVault
  console.log("\n🏦 Deploying FluidVault...");
  const FluidVault = await ethers.getContractFactory("FluidVault");
  const fluidVault = await FluidVault.deploy(
    interestCalculator.address,
    governance.address,
    deployer.address // Fee recipient
  );
  await fluidVault.deployed();
  console.log("FluidVault deployed to:", fluidVault.address);

  // Create some initial vaults for testing
  console.log("\n💰 Creating initial vaults...");
  
  // For testing, we'll create vaults for common tokens
  // Note: In production, you'd use actual token addresses
  const testTokens = [
    {
      name: "USDC",
      address: "0x1234567890123456789012345678901234567890", // Replace with actual USDC address
      rate: 500 // 5% APY
    },
    {
      name: "USDT", 
      address: "0x2345678901234567890123456789012345678901", // Replace with actual USDT address
      rate: 450 // 4.5% APY
    },
    {
      name: "DAI",
      address: "0x3456789012345678901234567890123456789012", // Replace with actual DAI address
      rate: 400 // 4% APY
    }
  ];

  for (const token of testTokens) {
    try {
      console.log(`Creating vault for ${token.name}...`);
      await fluidVault.createVault(token.address, token.rate);
      console.log(`✅ ${token.name} vault created with ${token.rate/100}% APY`);
    } catch (error) {
      console.log(`❌ Failed to create ${token.name} vault:`, error.message);
    }
  }

  // Set up governance permissions
  console.log("\n🔐 Setting up governance permissions...");
  try {
    await governance.addAuthorizedVoter(deployer.address, 10000); // 100% voting power
    console.log("✅ Governance permissions set up");
  } catch (error) {
    console.log("❌ Failed to set up governance:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      FluidVault: {
        address: fluidVault.address,
        abi: FluidVault.interface.format("json")
      },
      InterestCalculator: {
        address: interestCalculator.address,
        abi: InterestCalculator.interface.format("json")
      },
      Governance: {
        address: governance.address,
        abi: Governance.interface.format("json")
      }
    },
    vaults: testTokens.map(token => ({
      name: token.name,
      address: token.address,
      rate: token.rate
    }))
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);

  // Create .env file with contract addresses
  const envContent = `# FluidVault Deployment - ${hre.network.name}
FLUID_VAULT_ADDRESS=${fluidVault.address}
INTEREST_CALCULATOR_ADDRESS=${interestCalculator.address}
GOVERNANCE_ADDRESS=${governance.address}

# Network Configuration
NEXT_PUBLIC_SOMNIA_RPC_URL=${hre.network.config.url || "https://testnet-rpc.somnia.network"}
NEXT_PUBLIC_SOMNIA_CHAIN_ID=${hre.network.config.chainId || 1946}
NEXT_PUBLIC_CONTRACT_ADDRESS=${fluidVault.address}
`;

  const envFile = path.join(__dirname, "..", ".env.local");
  fs.writeFileSync(envFile, envContent);
  console.log(`📄 Environment file created: ${envFile}`);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log(`FluidVault: ${fluidVault.address}`);
  console.log(`InterestCalculator: ${interestCalculator.address}`);
  console.log(`Governance: ${governance.address}`);
  
  console.log("\n🔗 Next Steps:");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Verify contracts on block explorer (if available)");
  console.log("3. Test the contracts with the frontend");
  console.log("4. Create governance proposals for parameter updates");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
