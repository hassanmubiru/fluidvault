// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AnalyticsEngine
 * @dev Advanced analytics and reporting system for FluidVault
 * @author FluidVault Team
 */
contract AnalyticsEngine is Ownable, ReentrancyGuard, Pausable {
    
    // ============ STRUCTS ============
    
    struct PortfolioMetrics {
        uint256 totalValue;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 totalYield;
        uint256 activeStrategies;
        uint256 crossChainPositions;
        uint256 lastUpdated;
    }
    
    struct StrategyPerformance {
        uint256 strategyId;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 totalYield;
        uint256 currentAPY;
        uint256 riskScore;
        uint256 sharpeRatio;
        uint256 maxDrawdown;
        uint256 lastUpdated;
    }
    
    struct RiskMetrics {
        uint256 portfolioRisk;
        uint256 concentrationRisk;
        uint256 liquidityRisk;
        uint256 smartContractRisk;
        uint256 marketRisk;
        uint256 lastCalculated;
    }
    
    struct YieldAnalytics {
        uint256 dailyYield;
        uint256 weeklyYield;
        uint256 monthlyYield;
        uint256 yearlyYield;
        uint256 averageAPY;
        uint256 bestPerformingStrategy;
        uint256 worstPerformingStrategy;
        uint256 lastUpdated;
    }
    
    struct CrossChainAnalytics {
        uint256 totalChains;
        uint256 totalBridges;
        uint256 totalBridgeVolume;
        uint256 averageBridgeTime;
        uint256 bridgeSuccessRate;
        uint256 gasOptimization;
        uint256 lastUpdated;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(address => PortfolioMetrics) public userPortfolios;
    mapping(uint256 => StrategyPerformance) public strategyPerformance;
    mapping(address => RiskMetrics) public userRiskMetrics;
    mapping(address => YieldAnalytics) public userYieldAnalytics;
    mapping(address => CrossChainAnalytics) public userCrossChainAnalytics;
    
    // Historical data storage
    mapping(address => mapping(uint256 => PortfolioMetrics)) public historicalPortfolios;
    mapping(uint256 => mapping(uint256 => StrategyPerformance)) public historicalStrategyPerformance;
    
    // Analytics configuration
    uint256 public constant MAX_HISTORICAL_ENTRIES = 365; // 1 year of daily data
    uint256 public constant RISK_SCORE_MAX = 100;
    uint256 public constant APY_PRECISION = 10000; // 4 decimal places
    
    // External contract addresses
    address public fluidVaultContract;
    address public governanceContract;
    address public crossChainBridgeContract;
    address public yieldStrategyManagerContract;
    
    // ============ EVENTS ============
    
    event PortfolioUpdated(address indexed user, uint256 totalValue, uint256 totalYield);
    event StrategyPerformanceUpdated(uint256 indexed strategyId, uint256 currentAPY, uint256 riskScore);
    event RiskMetricsCalculated(address indexed user, uint256 portfolioRisk);
    event YieldAnalyticsUpdated(address indexed user, uint256 averageAPY);
    event CrossChainAnalyticsUpdated(address indexed user, uint256 totalBridges);
    event HistoricalDataStored(address indexed user, uint256 day, uint256 totalValue);
    
    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || 
            msg.sender == fluidVaultContract || 
            msg.sender == governanceContract,
            "AnalyticsEngine: Unauthorized"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _fluidVaultContract,
        address _governanceContract,
        address _crossChainBridgeContract,
        address _yieldStrategyManagerContract
    ) {
        fluidVaultContract = _fluidVaultContract;
        governanceContract = _governanceContract;
        crossChainBridgeContract = _crossChainBridgeContract;
        yieldStrategyManagerContract = _yieldStrategyManagerContract;
    }
    
    // ============ PORTFOLIO ANALYTICS ============
    
    /**
     * @dev Update user portfolio metrics
     * @param user User address
     * @param totalValue Total portfolio value
     * @param totalDeposits Total deposits made
     * @param totalWithdrawals Total withdrawals made
     * @param totalYield Total yield earned
     * @param activeStrategies Number of active strategies
     * @param crossChainPositions Number of cross-chain positions
     */
    function updatePortfolioMetrics(
        address user,
        uint256 totalValue,
        uint256 totalDeposits,
        uint256 totalWithdrawals,
        uint256 totalYield,
        uint256 activeStrategies,
        uint256 crossChainPositions
    ) external onlyAuthorized whenNotPaused {
        PortfolioMetrics storage portfolio = userPortfolios[user];
        
        portfolio.totalValue = totalValue;
        portfolio.totalDeposits = totalDeposits;
        portfolio.totalWithdrawals = totalWithdrawals;
        portfolio.totalYield = totalYield;
        portfolio.activeStrategies = activeStrategies;
        portfolio.crossChainPositions = crossChainPositions;
        portfolio.lastUpdated = block.timestamp;
        
        // Store historical data
        uint256 day = block.timestamp / 1 days;
        historicalPortfolios[user][day] = portfolio;
        
        emit PortfolioUpdated(user, totalValue, totalYield);
    }
    
    /**
     * @dev Get user portfolio metrics
     * @param user User address
     * @return Portfolio metrics
     */
    function getPortfolioMetrics(address user) external view returns (PortfolioMetrics memory) {
        return userPortfolios[user];
    }
    
    /**
     * @dev Get historical portfolio data
     * @param user User address
     * @param days Number of days to retrieve
     * @return Array of historical portfolio metrics
     */
    function getHistoricalPortfolioData(address user, uint256 days) external view returns (PortfolioMetrics[] memory) {
        require(days <= MAX_HISTORICAL_ENTRIES, "AnalyticsEngine: Too many days requested");
        
        PortfolioMetrics[] memory historicalData = new PortfolioMetrics[](days);
        uint256 currentDay = block.timestamp / 1 days;
        
        for (uint256 i = 0; i < days; i++) {
            uint256 day = currentDay - (days - 1 - i);
            historicalData[i] = historicalPortfolios[user][day];
        }
        
        return historicalData;
    }
    
    // ============ STRATEGY PERFORMANCE ============
    
    /**
     * @dev Update strategy performance metrics
     * @param strategyId Strategy ID
     * @param totalDeposits Total deposits in strategy
     * @param totalWithdrawals Total withdrawals from strategy
     * @param totalYield Total yield from strategy
     * @param currentAPY Current APY (in basis points)
     * @param riskScore Risk score (0-100)
     * @param sharpeRatio Sharpe ratio
     * @param maxDrawdown Maximum drawdown
     */
    function updateStrategyPerformance(
        uint256 strategyId,
        uint256 totalDeposits,
        uint256 totalWithdrawals,
        uint256 totalYield,
        uint256 currentAPY,
        uint256 riskScore,
        uint256 sharpeRatio,
        uint256 maxDrawdown
    ) external onlyAuthorized whenNotPaused {
        require(riskScore <= RISK_SCORE_MAX, "AnalyticsEngine: Invalid risk score");
        
        StrategyPerformance storage performance = strategyPerformance[strategyId];
        
        performance.strategyId = strategyId;
        performance.totalDeposits = totalDeposits;
        performance.totalWithdrawals = totalWithdrawals;
        performance.totalYield = totalYield;
        performance.currentAPY = currentAPY;
        performance.riskScore = riskScore;
        performance.sharpeRatio = sharpeRatio;
        performance.maxDrawdown = maxDrawdown;
        performance.lastUpdated = block.timestamp;
        
        // Store historical data
        uint256 day = block.timestamp / 1 days;
        historicalStrategyPerformance[strategyId][day] = performance;
        
        emit StrategyPerformanceUpdated(strategyId, currentAPY, riskScore);
    }
    
    /**
     * @dev Get strategy performance metrics
     * @param strategyId Strategy ID
     * @return Strategy performance metrics
     */
    function getStrategyPerformance(uint256 strategyId) external view returns (StrategyPerformance memory) {
        return strategyPerformance[strategyId];
    }
    
    /**
     * @dev Get all strategy performance data
     * @return Array of all strategy performance metrics
     */
    function getAllStrategyPerformance() external view returns (StrategyPerformance[] memory) {
        // This would need to be implemented based on how strategies are managed
        // For now, return empty array
        StrategyPerformance[] memory allPerformance = new StrategyPerformance[](0);
        return allPerformance;
    }
    
    // ============ RISK ANALYTICS ============
    
    /**
     * @dev Calculate and update user risk metrics
     * @param user User address
     * @param portfolioRisk Portfolio risk score
     * @param concentrationRisk Concentration risk score
     * @param liquidityRisk Liquidity risk score
     * @param smartContractRisk Smart contract risk score
     * @param marketRisk Market risk score
     */
    function updateRiskMetrics(
        address user,
        uint256 portfolioRisk,
        uint256 concentrationRisk,
        uint256 liquidityRisk,
        uint256 smartContractRisk,
        uint256 marketRisk
    ) external onlyAuthorized whenNotPaused {
        require(portfolioRisk <= RISK_SCORE_MAX, "AnalyticsEngine: Invalid portfolio risk");
        require(concentrationRisk <= RISK_SCORE_MAX, "AnalyticsEngine: Invalid concentration risk");
        require(liquidityRisk <= RISK_SCORE_MAX, "AnalyticsEngine: Invalid liquidity risk");
        require(smartContractRisk <= RISK_SCORE_MAX, "AnalyticsEngine: Invalid smart contract risk");
        require(marketRisk <= RISK_SCORE_MAX, "AnalyticsEngine: Invalid market risk");
        
        RiskMetrics storage riskMetrics = userRiskMetrics[user];
        
        riskMetrics.portfolioRisk = portfolioRisk;
        riskMetrics.concentrationRisk = concentrationRisk;
        riskMetrics.liquidityRisk = liquidityRisk;
        riskMetrics.smartContractRisk = smartContractRisk;
        riskMetrics.marketRisk = marketRisk;
        riskMetrics.lastCalculated = block.timestamp;
        
        emit RiskMetricsCalculated(user, portfolioRisk);
    }
    
    /**
     * @dev Get user risk metrics
     * @param user User address
     * @return Risk metrics
     */
    function getRiskMetrics(address user) external view returns (RiskMetrics memory) {
        return userRiskMetrics[user];
    }
    
    // ============ YIELD ANALYTICS ============
    
    /**
     * @dev Update user yield analytics
     * @param user User address
     * @param dailyYield Daily yield earned
     * @param weeklyYield Weekly yield earned
     * @param monthlyYield Monthly yield earned
     * @param yearlyYield Yearly yield earned
     * @param averageAPY Average APY across all strategies
     * @param bestPerformingStrategy Best performing strategy ID
     * @param worstPerformingStrategy Worst performing strategy ID
     */
    function updateYieldAnalytics(
        address user,
        uint256 dailyYield,
        uint256 weeklyYield,
        uint256 monthlyYield,
        uint256 yearlyYield,
        uint256 averageAPY,
        uint256 bestPerformingStrategy,
        uint256 worstPerformingStrategy
    ) external onlyAuthorized whenNotPaused {
        YieldAnalytics storage yieldAnalytics = userYieldAnalytics[user];
        
        yieldAnalytics.dailyYield = dailyYield;
        yieldAnalytics.weeklyYield = weeklyYield;
        yieldAnalytics.monthlyYield = monthlyYield;
        yieldAnalytics.yearlyYield = yearlyYield;
        yieldAnalytics.averageAPY = averageAPY;
        yieldAnalytics.bestPerformingStrategy = bestPerformingStrategy;
        yieldAnalytics.worstPerformingStrategy = worstPerformingStrategy;
        yieldAnalytics.lastUpdated = block.timestamp;
        
        emit YieldAnalyticsUpdated(user, averageAPY);
    }
    
    /**
     * @dev Get user yield analytics
     * @param user User address
     * @return Yield analytics
     */
    function getYieldAnalytics(address user) external view returns (YieldAnalytics memory) {
        return userYieldAnalytics[user];
    }
    
    // ============ CROSS-CHAIN ANALYTICS ============
    
    /**
     * @dev Update user cross-chain analytics
     * @param user User address
     * @param totalChains Number of chains used
     * @param totalBridges Number of bridge transactions
     * @param totalBridgeVolume Total bridge volume
     * @param averageBridgeTime Average bridge time
     * @param bridgeSuccessRate Bridge success rate
     * @param gasOptimization Gas optimization score
     */
    function updateCrossChainAnalytics(
        address user,
        uint256 totalChains,
        uint256 totalBridges,
        uint256 totalBridgeVolume,
        uint256 averageBridgeTime,
        uint256 bridgeSuccessRate,
        uint256 gasOptimization
    ) external onlyAuthorized whenNotPaused {
        CrossChainAnalytics storage crossChainAnalytics = userCrossChainAnalytics[user];
        
        crossChainAnalytics.totalChains = totalChains;
        crossChainAnalytics.totalBridges = totalBridges;
        crossChainAnalytics.totalBridgeVolume = totalBridgeVolume;
        crossChainAnalytics.averageBridgeTime = averageBridgeTime;
        crossChainAnalytics.bridgeSuccessRate = bridgeSuccessRate;
        crossChainAnalytics.gasOptimization = gasOptimization;
        crossChainAnalytics.lastUpdated = block.timestamp;
        
        emit CrossChainAnalyticsUpdated(user, totalBridges);
    }
    
    /**
     * @dev Get user cross-chain analytics
     * @param user User address
     * @return Cross-chain analytics
     */
    function getCrossChainAnalytics(address user) external view returns (CrossChainAnalytics memory) {
        return userCrossChainAnalytics[user];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update contract addresses
     * @param _fluidVaultContract New FluidVault contract address
     * @param _governanceContract New Governance contract address
     * @param _crossChainBridgeContract New CrossChainBridge contract address
     * @param _yieldStrategyManagerContract New YieldStrategyManager contract address
     */
    function updateContractAddresses(
        address _fluidVaultContract,
        address _governanceContract,
        address _crossChainBridgeContract,
        address _yieldStrategyManagerContract
    ) external onlyOwner {
        fluidVaultContract = _fluidVaultContract;
        governanceContract = _governanceContract;
        crossChainBridgeContract = _crossChainBridgeContract;
        yieldStrategyManagerContract = _yieldStrategyManagerContract;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency function to clear historical data
     * @param user User address
     * @param startDay Start day to clear
     * @param endDay End day to clear
     */
    function clearHistoricalData(address user, uint256 startDay, uint256 endDay) external onlyOwner {
        require(endDay >= startDay, "AnalyticsEngine: Invalid day range");
        require(endDay - startDay <= MAX_HISTORICAL_ENTRIES, "AnalyticsEngine: Too many days to clear");
        
        for (uint256 day = startDay; day <= endDay; day++) {
            delete historicalPortfolios[user][day];
        }
    }
}
