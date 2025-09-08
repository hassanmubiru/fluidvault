const { ethers } = require("hardhat");

async function main() {
  console.log("📊 Starting Analytics & AI Strategy Engine Deployment...");
  
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
    // Deploy AnalyticsEngine
    console.log("\n📄 Deploying AnalyticsEngine...");
    const AnalyticsEngine = await ethers.getContractFactory("AnalyticsEngine");
    const analyticsEngine = await AnalyticsEngine.deploy(
      "0x0000000000000000000000000000000000000000", // fluidVaultContract (placeholder)
      "0x0000000000000000000000000000000000000000", // governanceContract (placeholder)
      "0xA580bCEf7674d9a2355831033C1880ABF5A46385", // crossChainBridgeContract
      "0x0000000000000000000000000000000000000000"  // yieldStrategyManagerContract (placeholder)
    );
    await analyticsEngine.waitForDeployment();
    const analyticsEngineAddress = await analyticsEngine.getAddress();
    console.log(`✅ AnalyticsEngine deployed to: ${analyticsEngineAddress}`);

    // Deploy AIStrategyEngine
    console.log("\n📄 Deploying AIStrategyEngine...");
    const AIStrategyEngine = await ethers.getContractFactory("AIStrategyEngine");
    const aiStrategyEngine = await AIStrategyEngine.deploy(
      analyticsEngineAddress, // analyticsEngineContract
      "0x0000000000000000000000000000000000000000", // yieldStrategyManagerContract (placeholder)
      "0xA580bCEf7674d9a2355831033C1880ABF5A46385"  // crossChainBridgeContract
    );
    await aiStrategyEngine.waitForDeployment();
    const aiStrategyEngineAddress = await aiStrategyEngine.getAddress();
    console.log(`✅ AIStrategyEngine deployed to: ${aiStrategyEngineAddress}`);

    // Create some sample AI strategies
    console.log("\n🤖 Creating sample AI strategies...");
    
    // Strategy 1: Conservative Yield
    await aiStrategyEngine.createAIStrategy(
      "Conservative Yield Strategy",
      "Low-risk strategy focusing on stable yields with minimal volatility",
      500, // 5% target APY
      3,   // Risk level 3/10
      ethers.parseEther("0.1"), // Min deposit 0.1 ETH
      ethers.parseEther("100"), // Max deposit 100 ETH
      [0, 1], // Supported tokens (STT, ETH)
      [1, 137, 50312] // Supported chains (Ethereum, Polygon, Somnia)
    );
    console.log("✅ Created Conservative Yield Strategy");

    // Strategy 2: Balanced Growth
    await aiStrategyEngine.createAIStrategy(
      "Balanced Growth Strategy",
      "Medium-risk strategy balancing yield and growth potential",
      800, // 8% target APY
      6,   // Risk level 6/10
      ethers.parseEther("0.5"), // Min deposit 0.5 ETH
      ethers.parseEther("500"), // Max deposit 500 ETH
      [0, 1, 2], // Supported tokens (STT, ETH, USDC)
      [1, 137, 42161, 50312] // Supported chains (Ethereum, Polygon, Arbitrum, Somnia)
    );
    console.log("✅ Created Balanced Growth Strategy");

    // Strategy 3: Aggressive Yield
    await aiStrategyEngine.createAIStrategy(
      "Aggressive Yield Strategy",
      "High-risk strategy maximizing yield through advanced DeFi protocols",
      1200, // 12% target APY
      8,    // Risk level 8/10
      ethers.parseEther("1.0"), // Min deposit 1 ETH
      ethers.parseEther("1000"), // Max deposit 1000 ETH
      [0, 1, 2, 3], // Supported tokens (STT, ETH, USDC, WBTC)
      [1, 137, 42161, 10, 56, 50312] // All supported chains
    );
    console.log("✅ Created Aggressive Yield Strategy");

    // Update market conditions
    console.log("\n📈 Setting initial market conditions...");
    await aiStrategyEngine.updateMarketConditions(
      45, // Market volatility: 45%
      65, // Yield environment: 65%
      75, // Liquidity conditions: 75%
      25  // Gas prices: 25% (low)
    );
    console.log("✅ Market conditions updated");

    // Create sample user profile for testing
    console.log("\n👤 Creating sample user profile...");
    await aiStrategyEngine.updateUserProfile(
      deployer.address, // User address
      5, // Risk tolerance: 5/10 (moderate)
      365, // Investment horizon: 365 days
      0b111111, // Preferred chains: All chains (bitmask)
      0b1111, // Preferred tokens: All tokens (bitmask)
      ethers.parseEther("10") // Total portfolio value: 10 ETH
    );
    console.log("✅ Sample user profile created");

    // Generate a sample recommendation
    console.log("\n🎯 Generating sample AI recommendation...");
    await aiStrategyEngine.generateRecommendation(
      deployer.address, // User address
      2, // Strategy ID: Balanced Growth Strategy
      85, // Confidence: 85%
      800, // Expected APY: 8%
      60, // Risk score: 60%
      ethers.parseEther("2.5"), // Recommended amount: 2.5 ETH
      "Based on your moderate risk tolerance and 1-year investment horizon, the Balanced Growth Strategy offers optimal risk-adjusted returns with exposure to multiple chains and tokens."
    );
    console.log("✅ Sample AI recommendation generated");

    // Update some analytics data
    console.log("\n📊 Setting sample analytics data...");
    await analyticsEngine.updatePortfolioMetrics(
      deployer.address, // User address
      ethers.parseEther("10"), // Total value: 10 ETH
      ethers.parseEther("8"), // Total deposits: 8 ETH
      ethers.parseEther("1"), // Total withdrawals: 1 ETH
      ethers.parseEther("0.5"), // Total yield: 0.5 ETH
      2, // Active strategies: 2
      3  // Cross-chain positions: 3
    );
    console.log("✅ Portfolio metrics updated");

    // Update risk metrics
    await analyticsEngine.updateRiskMetrics(
      deployer.address, // User address
      45, // Portfolio risk: 45%
      35, // Concentration risk: 35%
      25, // Liquidity risk: 25%
      15, // Smart contract risk: 15%
      40  // Market risk: 40%
    );
    console.log("✅ Risk metrics updated");

    // Update yield analytics
    await analyticsEngine.updateYieldAnalytics(
      deployer.address, // User address
      ethers.parseEther("0.01"), // Daily yield: 0.01 ETH
      ethers.parseEther("0.07"), // Weekly yield: 0.07 ETH
      ethers.parseEther("0.3"), // Monthly yield: 0.3 ETH
      ethers.parseEther("3.6"), // Yearly yield: 3.6 ETH
      800, // Average APY: 8%
      2, // Best performing strategy: Strategy #2
      1  // Worst performing strategy: Strategy #1
    );
    console.log("✅ Yield analytics updated");

    // Update cross-chain analytics
    await analyticsEngine.updateCrossChainAnalytics(
      deployer.address, // User address
      4, // Total chains: 4
      8, // Total bridges: 8
      ethers.parseEther("25"), // Total bridge volume: 25 ETH
      300, // Average bridge time: 300 seconds
      95, // Bridge success rate: 95%
      80  // Gas optimization: 80%
    );
    console.log("✅ Cross-chain analytics updated");

    // Verify deployments
    console.log("\n🔍 Verifying deployments...");
    
    const activeStrategies = await aiStrategyEngine.getActiveAIStrategies();
    console.log(`✅ AI Strategy Engine has ${activeStrategies.length} active strategies`);
    
    const userProfile = await aiStrategyEngine.getUserProfile(deployer.address);
    console.log(`✅ User profile created with risk tolerance: ${userProfile.riskTolerance}/10`);
    
    const portfolioMetrics = await analyticsEngine.getPortfolioMetrics(deployer.address);
    console.log(`✅ Portfolio metrics: ${ethers.formatEther(portfolioMetrics.totalValue)} ETH total value`);
    
    const marketConditions = await aiStrategyEngine.getMarketConditions();
    console.log(`✅ Market conditions: ${marketConditions.marketVolatility}% volatility, ${marketConditions.yieldEnvironment}% yield environment`);

    console.log("\n🎉 Analytics & AI Strategy Engine Deployment Complete!");
    console.log("\n📋 Contract Addresses:");
    console.log(`   AnalyticsEngine: ${analyticsEngineAddress}`);
    console.log(`   AIStrategyEngine: ${aiStrategyEngineAddress}`);
    
    console.log("\n🔧 Environment Variables for Vercel:");
    console.log(`   NEXT_PUBLIC_ANALYTICS_ENGINE_CONTRACT=${analyticsEngineAddress}`);
    console.log(`   NEXT_PUBLIC_AI_STRATEGY_ENGINE_CONTRACT=${aiStrategyEngineAddress}`);
    
    console.log("\n📝 Next Steps:");
    console.log("1. Update Vercel environment variables with the contract addresses above");
    console.log("2. Redeploy the frontend to use the new analytics contracts");
    console.log("3. Test the analytics dashboard and AI strategy functionality");
    console.log("4. Configure real data sources for analytics");
    console.log("5. Implement additional AI strategy algorithms");

    console.log("\n🤖 AI Strategies Created:");
    console.log("   • Conservative Yield Strategy (5% APY, Risk 3/10)");
    console.log("   • Balanced Growth Strategy (8% APY, Risk 6/10)");
    console.log("   • Aggressive Yield Strategy (12% APY, Risk 8/10)");
    
    console.log("\n📊 Analytics Features:");
    console.log("   • Portfolio performance tracking");
    console.log("   • Risk assessment and metrics");
    console.log("   • Yield analytics and reporting");
    console.log("   • Cross-chain portfolio insights");
    console.log("   • AI-powered strategy recommendations");
    console.log("   • Market condition analysis");

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
