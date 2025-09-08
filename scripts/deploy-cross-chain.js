const { ethers } = require("hardhat");

async function main() {
  console.log("🌉 Starting Cross-Chain Bridge Deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "STT");
  
  if (balance < ethers.parseEther("0.1")) {
    console.log("⚠️  Warning: Low balance. You may need more STT for deployment.");
  }

  try {
    // Deploy CrossChainBridge
    console.log("\n📄 Deploying CrossChainBridge...");
    const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
    const bridge = await CrossChainBridge.deploy(deployer.address); // feeRecipient
    await bridge.waitForDeployment();
    const bridgeAddress = await bridge.getAddress();
    console.log(`✅ CrossChainBridge deployed to: ${bridgeAddress}`);

    // Deploy MultiChainVault
    console.log("\n📄 Deploying MultiChainVault...");
    const MultiChainVault = await ethers.getContractFactory("MultiChainVault");
    const vault = await MultiChainVault.deploy(
      bridgeAddress, // bridge address
      "0x0000000000000000000000000000000000000000", // strategyManager (placeholder)
      deployer.address // feeRecipient
    );
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log(`✅ MultiChainVault deployed to: ${vaultAddress}`);

    // Add some supported chains to the bridge
    console.log("\n🔗 Adding supported chains...");
    
    // Add Ethereum (Chain ID 1)
    await bridge.addSupportedChain(
      1, // chainId
      "Ethereum", // name
      "0x0000000000000000000000000000000000000000", // bridgeContract (placeholder)
      ethers.parseEther("0.001"), // minTransfer
      ethers.parseEther("1000"), // maxTransfer
      50 // bridgeFee (0.5%)
    );
    console.log("✅ Added Ethereum support");

    // Add Polygon (Chain ID 137)
    await bridge.addSupportedChain(
      137, // chainId
      "Polygon", // name
      "0x0000000000000000000000000000000000000000", // bridgeContract (placeholder)
      ethers.parseEther("0.001"), // minTransfer
      ethers.parseEther("1000"), // maxTransfer
      30 // bridgeFee (0.3%)
    );
    console.log("✅ Added Polygon support");

    // Add Arbitrum (Chain ID 42161)
    await bridge.addSupportedChain(
      42161, // chainId
      "Arbitrum", // name
      "0x0000000000000000000000000000000000000000", // bridgeContract (placeholder)
      ethers.parseEther("0.001"), // minTransfer
      ethers.parseEther("1000"), // maxTransfer
      25 // bridgeFee (0.25%)
    );
    console.log("✅ Added Arbitrum support");

    // Add Optimism (Chain ID 10)
    await bridge.addSupportedChain(
      10, // chainId
      "Optimism", // name
      "0x0000000000000000000000000000000000000000", // bridgeContract (placeholder)
      ethers.parseEther("0.001"), // minTransfer
      ethers.parseEther("1000"), // maxTransfer
      25 // bridgeFee (0.25%)
    );
    console.log("✅ Added Optimism support");

    // Add BSC (Chain ID 56)
    await bridge.addSupportedChain(
      56, // chainId
      "BSC", // name
      "0x0000000000000000000000000000000000000000", // bridgeContract (placeholder)
      ethers.parseEther("0.001"), // minTransfer
      ethers.parseEther("1000"), // maxTransfer
      20 // bridgeFee (0.2%)
    );
    console.log("✅ Added BSC support");

    // Add Somnia Testnet (Chain ID 50312)
    await bridge.addSupportedChain(
      50312, // chainId
      "Somnia Testnet", // name
      bridgeAddress, // bridgeContract (self-reference for demo)
      ethers.parseEther("0.001"), // minTransfer
      ethers.parseEther("1000"), // maxTransfer
      10 // bridgeFee (0.1%)
    );
    console.log("✅ Added Somnia Testnet support");

    // Add some supported tokens (using STT as example)
    console.log("\n🪙 Adding supported tokens...");
    
    // Add STT token (using a placeholder address)
    const sttTokenAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
    await bridge.addSupportedToken(
      sttTokenAddress, // token
      "STT", // symbol
      18 // decimals
    );
    console.log("✅ Added STT token support");

    // Add chain strategies to MultiChainVault
    console.log("\n📊 Adding chain strategies...");
    
    // Add Ethereum strategy
    await vault.addChainStrategy(
      1, // chainId
      0, // strategyId
      "0x0000000000000000000000000000000000000000" // strategyContract (placeholder)
    );
    console.log("✅ Added Ethereum strategy");

    // Add Polygon strategy
    await vault.addChainStrategy(
      137, // chainId
      0, // strategyId
      "0x0000000000000000000000000000000000000000" // strategyContract (placeholder)
    );
    console.log("✅ Added Polygon strategy");

    // Verify deployments
    console.log("\n🔍 Verifying deployments...");
    
    const bridgeChainCount = await bridge.getSupportedChains();
    console.log(`✅ Bridge supports ${bridgeChainCount.length} chains`);
    
    const bridgeInfo = await bridge.getChainInfo(1);
    console.log(`✅ Ethereum chain info: ${bridgeInfo.name}, Active: ${bridgeInfo.isActive}`);

    console.log("\n🎉 Cross-Chain Bridge Deployment Complete!");
    console.log("\n📋 Contract Addresses:");
    console.log(`   CrossChainBridge: ${bridgeAddress}`);
    console.log(`   MultiChainVault: ${vaultAddress}`);
    
    console.log("\n🔧 Environment Variables for Vercel:");
    console.log(`   NEXT_PUBLIC_CROSS_CHAIN_BRIDGE_CONTRACT=${bridgeAddress}`);
    console.log(`   NEXT_PUBLIC_MULTI_CHAIN_VAULT_CONTRACT=${vaultAddress}`);
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update Vercel environment variables with the contract addresses above");
    console.log("2. Redeploy the frontend to use the new contracts");
    console.log("3. Test the cross-chain bridge functionality");
    console.log("4. Configure real bridge contracts for other chains");

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
