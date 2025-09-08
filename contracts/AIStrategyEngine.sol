// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AIStrategyEngine
 * @dev AI-powered strategy optimization and recommendation system
 * @author FluidVault Team
 */
contract AIStrategyEngine is Ownable, ReentrancyGuard, Pausable {
    
    // ============ STRUCTS ============
    
    struct AIStrategy {
        uint256 strategyId;
        string name;
        string description;
        uint256 targetAPY;
        uint256 riskLevel;
        uint256 minDeposit;
        uint256 maxDeposit;
        uint256[] supportedTokens;
        uint256[] supportedChains;
        bool isActive;
        uint256 createdAt;
        uint256 lastOptimized;
    }
    
    struct StrategyRecommendation {
        uint256 strategyId;
        uint256 confidence;
        uint256 expectedAPY;
        uint256 riskScore;
        uint256 recommendedAmount;
        string reasoning;
        uint256 timestamp;
    }
    
    struct UserProfile {
        uint256 riskTolerance;
        uint256 investmentHorizon;
        uint256 preferredChains;
        uint256 preferredTokens;
        uint256 totalPortfolioValue;
        uint256 lastUpdated;
    }
    
    struct MarketConditions {
        uint256 marketVolatility;
        uint256 yieldEnvironment;
        uint256 liquidityConditions;
        uint256 gasPrices;
        uint256 lastUpdated;
    }
    
    struct OptimizationResult {
        uint256 strategyId;
        uint256 optimizedAPY;
        uint256 riskReduction;
        uint256 gasOptimization;
        uint256 liquidityImprovement;
        uint256 timestamp;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => AIStrategy) public aiStrategies;
    mapping(address => StrategyRecommendation[]) public userRecommendations;
    mapping(address => UserProfile) public userProfiles;
    mapping(uint256 => OptimizationResult[]) public strategyOptimizations;
    
    MarketConditions public currentMarketConditions;
    
    uint256 public nextStrategyId = 1;
    uint256 public constant MAX_RISK_LEVEL = 10;
    uint256 public constant MAX_CONFIDENCE = 100;
    uint256 public constant APY_PRECISION = 10000; // 4 decimal places
    
    // External contract addresses
    address public analyticsEngineContract;
    address public yieldStrategyManagerContract;
    address public crossChainBridgeContract;
    
    // ============ EVENTS ============
    
    event AIStrategyCreated(uint256 indexed strategyId, string name, uint256 targetAPY);
    event StrategyOptimized(uint256 indexed strategyId, uint256 optimizedAPY, uint256 riskReduction);
    event RecommendationGenerated(address indexed user, uint256 strategyId, uint256 confidence);
    event UserProfileUpdated(address indexed user, uint256 riskTolerance);
    event MarketConditionsUpdated(uint256 marketVolatility, uint256 yieldEnvironment);
    
    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || 
            msg.sender == analyticsEngineContract || 
            msg.sender == yieldStrategyManagerContract,
            "AIStrategyEngine: Unauthorized"
        );
        _;
    }
    
    modifier validStrategyId(uint256 strategyId) {
        require(strategyId > 0 && strategyId < nextStrategyId, "AIStrategyEngine: Invalid strategy ID");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _analyticsEngineContract,
        address _yieldStrategyManagerContract,
        address _crossChainBridgeContract
    ) {
        analyticsEngineContract = _analyticsEngineContract;
        yieldStrategyManagerContract = _yieldStrategyManagerContract;
        crossChainBridgeContract = _crossChainBridgeContract;
        
        // Initialize market conditions
        currentMarketConditions = MarketConditions({
            marketVolatility: 50, // Medium volatility
            yieldEnvironment: 60, // Moderate yield environment
            liquidityConditions: 70, // Good liquidity
            gasPrices: 30, // Low gas prices
            lastUpdated: block.timestamp
        });
    }
    
    // ============ AI STRATEGY MANAGEMENT ============
    
    /**
     * @dev Create a new AI strategy
     * @param name Strategy name
     * @param description Strategy description
     * @param targetAPY Target APY (in basis points)
     * @param riskLevel Risk level (1-10)
     * @param minDeposit Minimum deposit amount
     * @param maxDeposit Maximum deposit amount
     * @param supportedTokens Array of supported token IDs
     * @param supportedChains Array of supported chain IDs
     */
    function createAIStrategy(
        string memory name,
        string memory description,
        uint256 targetAPY,
        uint256 riskLevel,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256[] memory supportedTokens,
        uint256[] memory supportedChains
    ) external onlyOwner whenNotPaused {
        require(riskLevel > 0 && riskLevel <= MAX_RISK_LEVEL, "AIStrategyEngine: Invalid risk level");
        require(minDeposit <= maxDeposit, "AIStrategyEngine: Invalid deposit range");
        require(supportedTokens.length > 0, "AIStrategyEngine: No supported tokens");
        require(supportedChains.length > 0, "AIStrategyEngine: No supported chains");
        
        uint256 strategyId = nextStrategyId++;
        
        aiStrategies[strategyId] = AIStrategy({
            strategyId: strategyId,
            name: name,
            description: description,
            targetAPY: targetAPY,
            riskLevel: riskLevel,
            minDeposit: minDeposit,
            maxDeposit: maxDeposit,
            supportedTokens: supportedTokens,
            supportedChains: supportedChains,
            isActive: true,
            createdAt: block.timestamp,
            lastOptimized: block.timestamp
        });
        
        emit AIStrategyCreated(strategyId, name, targetAPY);
    }
    
    /**
     * @dev Get AI strategy details
     * @param strategyId Strategy ID
     * @return AI strategy details
     */
    function getAIStrategy(uint256 strategyId) external view validStrategyId(strategyId) returns (AIStrategy memory) {
        return aiStrategies[strategyId];
    }
    
    /**
     * @dev Get all active AI strategies
     * @return Array of active AI strategies
     */
    function getActiveAIStrategies() external view returns (AIStrategy[] memory) {
        uint256 activeCount = 0;
        
        // Count active strategies
        for (uint256 i = 1; i < nextStrategyId; i++) {
            if (aiStrategies[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array and populate
        AIStrategy[] memory activeStrategies = new AIStrategy[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextStrategyId; i++) {
            if (aiStrategies[i].isActive) {
                activeStrategies[index] = aiStrategies[i];
                index++;
            }
        }
        
        return activeStrategies;
    }
    
    // ============ STRATEGY OPTIMIZATION ============
    
    /**
     * @dev Optimize a strategy based on current market conditions
     * @param strategyId Strategy ID to optimize
     * @param optimizedAPY Optimized APY (in basis points)
     * @param riskReduction Risk reduction percentage
     * @param gasOptimization Gas optimization percentage
     * @param liquidityImprovement Liquidity improvement percentage
     */
    function optimizeStrategy(
        uint256 strategyId,
        uint256 optimizedAPY,
        uint256 riskReduction,
        uint256 gasOptimization,
        uint256 liquidityImprovement
    ) external onlyAuthorized validStrategyId(strategyId) whenNotPaused {
        require(riskReduction <= 100, "AIStrategyEngine: Invalid risk reduction");
        require(gasOptimization <= 100, "AIStrategyEngine: Invalid gas optimization");
        require(liquidityImprovement <= 100, "AIStrategyEngine: Invalid liquidity improvement");
        
        OptimizationResult memory result = OptimizationResult({
            strategyId: strategyId,
            optimizedAPY: optimizedAPY,
            riskReduction: riskReduction,
            gasOptimization: gasOptimization,
            liquidityImprovement: liquidityImprovement,
            timestamp: block.timestamp
        });
        
        strategyOptimizations[strategyId].push(result);
        
        // Update strategy last optimized timestamp
        aiStrategies[strategyId].lastOptimized = block.timestamp;
        
        emit StrategyOptimized(strategyId, optimizedAPY, riskReduction);
    }
    
    /**
     * @dev Get strategy optimization history
     * @param strategyId Strategy ID
     * @return Array of optimization results
     */
    function getStrategyOptimizations(uint256 strategyId) external view validStrategyId(strategyId) returns (OptimizationResult[] memory) {
        return strategyOptimizations[strategyId];
    }
    
    // ============ USER PROFILES ============
    
    /**
     * @dev Update user profile for AI recommendations
     * @param user User address
     * @param riskTolerance Risk tolerance (1-10)
     * @param investmentHorizon Investment horizon in days
     * @param preferredChains Preferred chain IDs
     * @param preferredTokens Preferred token IDs
     * @param totalPortfolioValue Total portfolio value
     */
    function updateUserProfile(
        address user,
        uint256 riskTolerance,
        uint256 investmentHorizon,
        uint256 preferredChains,
        uint256 preferredTokens,
        uint256 totalPortfolioValue
    ) external onlyAuthorized whenNotPaused {
        require(riskTolerance > 0 && riskTolerance <= MAX_RISK_LEVEL, "AIStrategyEngine: Invalid risk tolerance");
        require(investmentHorizon > 0, "AIStrategyEngine: Invalid investment horizon");
        
        userProfiles[user] = UserProfile({
            riskTolerance: riskTolerance,
            investmentHorizon: investmentHorizon,
            preferredChains: preferredChains,
            preferredTokens: preferredTokens,
            totalPortfolioValue: totalPortfolioValue,
            lastUpdated: block.timestamp
        });
        
        emit UserProfileUpdated(user, riskTolerance);
    }
    
    /**
     * @dev Get user profile
     * @param user User address
     * @return User profile
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return userProfiles[user];
    }
    
    // ============ RECOMMENDATIONS ============
    
    /**
     * @dev Generate strategy recommendation for user
     * @param user User address
     * @param strategyId Recommended strategy ID
     * @param confidence Confidence level (0-100)
     * @param expectedAPY Expected APY (in basis points)
     * @param riskScore Risk score (0-100)
     * @param recommendedAmount Recommended deposit amount
     * @param reasoning Reasoning for recommendation
     */
    function generateRecommendation(
        address user,
        uint256 strategyId,
        uint256 confidence,
        uint256 expectedAPY,
        uint256 riskScore,
        uint256 recommendedAmount,
        string memory reasoning
    ) external onlyAuthorized validStrategyId(strategyId) whenNotPaused {
        require(confidence <= MAX_CONFIDENCE, "AIStrategyEngine: Invalid confidence level");
        require(riskScore <= 100, "AIStrategyEngine: Invalid risk score");
        
        StrategyRecommendation memory recommendation = StrategyRecommendation({
            strategyId: strategyId,
            confidence: confidence,
            expectedAPY: expectedAPY,
            riskScore: riskScore,
            recommendedAmount: recommendedAmount,
            reasoning: reasoning,
            timestamp: block.timestamp
        });
        
        userRecommendations[user].push(recommendation);
        
        emit RecommendationGenerated(user, strategyId, confidence);
    }
    
    /**
     * @dev Get user recommendations
     * @param user User address
     * @return Array of user recommendations
     */
    function getUserRecommendations(address user) external view returns (StrategyRecommendation[] memory) {
        return userRecommendations[user];
    }
    
    /**
     * @dev Get latest recommendation for user
     * @param user User address
     * @return Latest recommendation
     */
    function getLatestRecommendation(address user) external view returns (StrategyRecommendation memory) {
        StrategyRecommendation[] memory recommendations = userRecommendations[user];
        if (recommendations.length == 0) {
            return StrategyRecommendation({
                strategyId: 0,
                confidence: 0,
                expectedAPY: 0,
                riskScore: 0,
                recommendedAmount: 0,
                reasoning: "No recommendations available",
                timestamp: 0
            });
        }
        
        return recommendations[recommendations.length - 1];
    }
    
    // ============ MARKET CONDITIONS ============
    
    /**
     * @dev Update market conditions
     * @param marketVolatility Market volatility (0-100)
     * @param yieldEnvironment Yield environment (0-100)
     * @param liquidityConditions Liquidity conditions (0-100)
     * @param gasPrices Gas price conditions (0-100)
     */
    function updateMarketConditions(
        uint256 marketVolatility,
        uint256 yieldEnvironment,
        uint256 liquidityConditions,
        uint256 gasPrices
    ) external onlyAuthorized whenNotPaused {
        require(marketVolatility <= 100, "AIStrategyEngine: Invalid market volatility");
        require(yieldEnvironment <= 100, "AIStrategyEngine: Invalid yield environment");
        require(liquidityConditions <= 100, "AIStrategyEngine: Invalid liquidity conditions");
        require(gasPrices <= 100, "AIStrategyEngine: Invalid gas prices");
        
        currentMarketConditions = MarketConditions({
            marketVolatility: marketVolatility,
            yieldEnvironment: yieldEnvironment,
            liquidityConditions: liquidityConditions,
            gasPrices: gasPrices,
            lastUpdated: block.timestamp
        });
        
        emit MarketConditionsUpdated(marketVolatility, yieldEnvironment);
    }
    
    /**
     * @dev Get current market conditions
     * @return Current market conditions
     */
    function getMarketConditions() external view returns (MarketConditions memory) {
        return currentMarketConditions;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update contract addresses
     * @param _analyticsEngineContract New AnalyticsEngine contract address
     * @param _yieldStrategyManagerContract New YieldStrategyManager contract address
     * @param _crossChainBridgeContract New CrossChainBridge contract address
     */
    function updateContractAddresses(
        address _analyticsEngineContract,
        address _yieldStrategyManagerContract,
        address _crossChainBridgeContract
    ) external onlyOwner {
        analyticsEngineContract = _analyticsEngineContract;
        yieldStrategyManagerContract = _yieldStrategyManagerContract;
        crossChainBridgeContract = _crossChainBridgeContract;
    }
    
    /**
     * @dev Toggle strategy active status
     * @param strategyId Strategy ID
     * @param isActive Active status
     */
    function toggleStrategyStatus(uint256 strategyId, bool isActive) external onlyOwner validStrategyId(strategyId) {
        aiStrategies[strategyId].isActive = isActive;
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
     * @dev Clear user recommendations
     * @param user User address
     */
    function clearUserRecommendations(address user) external onlyOwner {
        delete userRecommendations[user];
    }
}
