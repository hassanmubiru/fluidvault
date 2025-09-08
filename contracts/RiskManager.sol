// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./YieldStrategyManager.sol";

/**
 * @title RiskManager
 * @dev Risk assessment and management system for yield strategies
 * @notice Provides risk metrics and portfolio risk management
 */
contract RiskManager is ReentrancyGuard, Ownable {
    
    // ============ STRUCTS ============
    
    struct RiskMetrics {
        uint256 volatility; // Volatility measure (basis points)
        uint256 maxDrawdown; // Maximum drawdown (basis points)
        uint256 sharpeRatio; // Risk-adjusted return (scaled by 1000)
        uint256 var95; // Value at Risk 95% (basis points)
        uint256 var99; // Value at Risk 99% (basis points)
        uint256 correlation; // Correlation with market (basis points)
        uint256 lastUpdate;
    }
    
    struct PortfolioRisk {
        address user;
        uint256 totalRisk; // Total portfolio risk (basis points)
        uint256 diversificationScore; // Diversification score (0-100)
        uint256 concentrationRisk; // Concentration risk (basis points)
        uint256 liquidityRisk; // Liquidity risk (basis points)
        uint256 lastUpdate;
    }
    
    struct RiskLimits {
        uint256 maxVolatility; // Maximum allowed volatility
        uint256 maxDrawdown; // Maximum allowed drawdown
        uint256 minSharpeRatio; // Minimum required Sharpe ratio
        uint256 maxConcentration; // Maximum concentration in single strategy
        uint256 maxLiquidityRisk; // Maximum liquidity risk
    }
    
    struct RiskAlert {
        uint256 id;
        address user;
        uint256 strategyId;
        string alertType;
        string message;
        uint256 severity; // 1-5 severity level
        bool isActive;
        uint256 timestamp;
    }

    // ============ STATE VARIABLES ============
    
    YieldStrategyManager public strategyManager;
    
    mapping(uint256 => RiskMetrics) public strategyRiskMetrics;
    mapping(address => PortfolioRisk) public userPortfolioRisk;
    mapping(address => RiskLimits) public userRiskLimits;
    mapping(address => bool) public authorizedRiskAssessors;
    
    uint256 public alertCount;
    mapping(uint256 => RiskAlert) public riskAlerts;
    mapping(address => uint256[]) public userAlerts;
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_RISK_SCORE = 10000; // 100% risk
    
    // Default risk limits
    RiskLimits public defaultRiskLimits = RiskLimits({
        maxVolatility: 2000, // 20%
        maxDrawdown: 1500, // 15%
        minSharpeRatio: 100, // 0.1
        maxConcentration: 5000, // 50%
        maxLiquidityRisk: 1000 // 10%
    });

    // ============ EVENTS ============
    
    event RiskMetricsUpdated(
        uint256 indexed strategyId,
        uint256 volatility,
        uint256 maxDrawdown,
        uint256 sharpeRatio
    );
    
    event PortfolioRiskUpdated(
        address indexed user,
        uint256 totalRisk,
        uint256 diversificationScore,
        uint256 concentrationRisk
    );
    
    event RiskLimitsUpdated(
        address indexed user,
        uint256 maxVolatility,
        uint256 maxDrawdown,
        uint256 minSharpeRatio
    );
    
    event RiskAlertCreated(
        uint256 indexed alertId,
        address indexed user,
        uint256 indexed strategyId,
        string alertType,
        uint256 severity
    );
    
    event RiskAlertResolved(
        uint256 indexed alertId,
        address indexed user,
        bool resolved
    );
    
    event RiskAssessorAuthorized(
        address indexed assessor,
        bool authorized
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedRiskAssessor() {
        require(
            authorizedRiskAssessors[msg.sender] || msg.sender == owner(),
            "RiskManager: Not authorized risk assessor"
        );
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _strategyManager) {
        strategyManager = YieldStrategyManager(_strategyManager);
        authorizedRiskAssessors[msg.sender] = true;
    }

    // ============ RISK ASSESSMENT FUNCTIONS ============
    
    /**
     * @dev Update risk metrics for a strategy
     * @param strategyId Strategy ID
     * @param volatility Volatility measure
     * @param maxDrawdown Maximum drawdown
     * @param sharpeRatio Risk-adjusted return
     * @param var95 Value at Risk 95%
     * @param var99 Value at Risk 99%
     * @param correlation Correlation with market
     */
    function updateStrategyRiskMetrics(
        uint256 strategyId,
        uint256 volatility,
        uint256 maxDrawdown,
        uint256 sharpeRatio,
        uint256 var95,
        uint256 var99,
        uint256 correlation
    ) external onlyAuthorizedRiskAssessor {
        strategyRiskMetrics[strategyId] = RiskMetrics({
            volatility: volatility,
            maxDrawdown: maxDrawdown,
            sharpeRatio: sharpeRatio,
            var95: var95,
            var99: var99,
            correlation: correlation,
            lastUpdate: block.timestamp
        });
        
        emit RiskMetricsUpdated(strategyId, volatility, maxDrawdown, sharpeRatio);
    }
    
    /**
     * @dev Calculate and update portfolio risk for a user
     * @param user User address
     */
    function updatePortfolioRisk(address user) external onlyAuthorizedRiskAssessor {
        uint256 totalRisk = 0;
        uint256 diversificationScore = 0;
        uint256 concentrationRisk = 0;
        uint256 liquidityRisk = 0;
        
        // Get user's positions across all strategies
        uint256 strategyCount = strategyManager.strategyCount();
        uint256 totalValue = 0;
        uint256[] memory strategyValues = new uint256[](strategyCount);
        
        for (uint256 i = 0; i < strategyCount; i++) {
            YieldStrategyManager.UserPosition memory position = strategyManager.getUserPosition(user, i);
            if (position.shares > 0) {
                strategyValues[i] = position.amount;
                totalValue += position.amount;
            }
        }
        
        if (totalValue > 0) {
            // Calculate concentration risk
            for (uint256 i = 0; i < strategyCount; i++) {
                if (strategyValues[i] > 0) {
                    uint256 concentration = (strategyValues[i] * BASIS_POINTS) / totalValue;
                    concentrationRisk += (concentration * concentration) / BASIS_POINTS;
                }
            }
            
            // Calculate diversification score (inverse of concentration)
            diversificationScore = BASIS_POINTS - (concentrationRisk / strategyCount);
            
            // Calculate total risk (weighted average of strategy risks)
            for (uint256 i = 0; i < strategyCount; i++) {
                if (strategyValues[i] > 0) {
                    RiskMetrics memory metrics = strategyRiskMetrics[i];
                    uint256 weight = (strategyValues[i] * BASIS_POINTS) / totalValue;
                    totalRisk += (metrics.volatility * weight) / BASIS_POINTS;
                }
            }
            
            // Calculate liquidity risk (simplified)
            liquidityRisk = calculateLiquidityRisk(user, strategyValues);
        }
        
        userPortfolioRisk[user] = PortfolioRisk({
            user: user,
            totalRisk: totalRisk,
            diversificationScore: diversificationScore,
            concentrationRisk: concentrationRisk,
            liquidityRisk: liquidityRisk,
            lastUpdate: block.timestamp
        });
        
        emit PortfolioRiskUpdated(user, totalRisk, diversificationScore, concentrationRisk);
        
        // Check for risk alerts
        checkRiskAlerts(user);
    }
    
    /**
     * @dev Set risk limits for a user
     * @param maxVolatility Maximum allowed volatility
     * @param maxDrawdown Maximum allowed drawdown
     * @param minSharpeRatio Minimum required Sharpe ratio
     * @param maxConcentration Maximum concentration in single strategy
     * @param maxLiquidityRisk Maximum liquidity risk
     */
    function setRiskLimits(
        uint256 maxVolatility,
        uint256 maxDrawdown,
        uint256 minSharpeRatio,
        uint256 maxConcentration,
        uint256 maxLiquidityRisk
    ) external {
        require(maxVolatility <= 5000, "RiskManager: Volatility limit too high"); // Max 50%
        require(maxDrawdown <= 3000, "RiskManager: Drawdown limit too high"); // Max 30%
        require(maxConcentration <= 8000, "RiskManager: Concentration limit too high"); // Max 80%
        require(maxLiquidityRisk <= 2000, "RiskManager: Liquidity risk limit too high"); // Max 20%
        
        userRiskLimits[msg.sender] = RiskLimits({
            maxVolatility: maxVolatility,
            maxDrawdown: maxDrawdown,
            minSharpeRatio: minSharpeRatio,
            maxConcentration: maxConcentration,
            maxLiquidityRisk: maxLiquidityRisk
        });
        
        emit RiskLimitsUpdated(msg.sender, maxVolatility, maxDrawdown, minSharpeRatio);
    }

    // ============ RISK ALERT FUNCTIONS ============
    
    /**
     * @dev Check for risk alerts for a user
     * @param user User address
     */
    function checkRiskAlerts(address user) internal {
        PortfolioRisk memory portfolioRisk = userPortfolioRisk[user];
        RiskLimits memory limits = userRiskLimits[user];
        
        // Use default limits if user hasn't set custom limits
        if (limits.maxVolatility == 0) {
            limits = defaultRiskLimits;
        }
        
        // Check volatility alert
        if (portfolioRisk.totalRisk > limits.maxVolatility) {
            createRiskAlert(
                user,
                0, // Strategy ID 0 for portfolio-level alerts
                "HIGH_VOLATILITY",
                "Portfolio volatility exceeds your risk limit",
                3 // Medium severity
            );
        }
        
        // Check concentration alert
        if (portfolioRisk.concentrationRisk > limits.maxConcentration) {
            createRiskAlert(
                user,
                0,
                "HIGH_CONCENTRATION",
                "Portfolio concentration exceeds your risk limit",
                4 // High severity
            );
        }
        
        // Check liquidity risk alert
        if (portfolioRisk.liquidityRisk > limits.maxLiquidityRisk) {
            createRiskAlert(
                user,
                0,
                "HIGH_LIQUIDITY_RISK",
                "Portfolio liquidity risk exceeds your risk limit",
                2 // Low severity
            );
        }
    }
    
    /**
     * @dev Create a risk alert
     * @param user User address
     * @param strategyId Strategy ID (0 for portfolio-level)
     * @param alertType Alert type
     * @param message Alert message
     * @param severity Severity level (1-5)
     */
    function createRiskAlert(
        address user,
        uint256 strategyId,
        string memory alertType,
        string memory message,
        uint256 severity
    ) internal {
        uint256 alertId = alertCount;
        
        riskAlerts[alertId] = RiskAlert({
            id: alertId,
            user: user,
            strategyId: strategyId,
            alertType: alertType,
            message: message,
            severity: severity,
            isActive: true,
            timestamp: block.timestamp
        });
        
        userAlerts[user].push(alertId);
        alertCount++;
        
        emit RiskAlertCreated(alertId, user, strategyId, alertType, severity);
    }
    
    /**
     * @dev Resolve a risk alert
     * @param alertId Alert ID
     */
    function resolveRiskAlert(uint256 alertId) external {
        RiskAlert storage alert = riskAlerts[alertId];
        require(alert.user == msg.sender, "RiskManager: Not your alert");
        require(alert.isActive, "RiskManager: Alert already resolved");
        
        alert.isActive = false;
        
        emit RiskAlertResolved(alertId, msg.sender, true);
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Authorize or deauthorize a risk assessor
     * @param assessor Risk assessor address
     * @param authorized Authorization status
     */
    function setAuthorizedRiskAssessor(address assessor, bool authorized) external onlyOwner {
        authorizedRiskAssessors[assessor] = authorized;
        emit RiskAssessorAuthorized(assessor, authorized);
    }
    
    /**
     * @dev Update default risk limits
     * @param newLimits New default risk limits
     */
    function updateDefaultRiskLimits(RiskLimits memory newLimits) external onlyOwner {
        require(newLimits.maxVolatility <= 5000, "RiskManager: Volatility limit too high");
        require(newLimits.maxDrawdown <= 3000, "RiskManager: Drawdown limit too high");
        require(newLimits.maxConcentration <= 8000, "RiskManager: Concentration limit too high");
        require(newLimits.maxLiquidityRisk <= 2000, "RiskManager: Liquidity risk limit too high");
        
        defaultRiskLimits = newLimits;
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get risk metrics for a strategy
     * @param strategyId Strategy ID
     * @return Risk metrics
     */
    function getStrategyRiskMetrics(uint256 strategyId) external view returns (RiskMetrics memory) {
        return strategyRiskMetrics[strategyId];
    }
    
    /**
     * @dev Get portfolio risk for a user
     * @param user User address
     * @return Portfolio risk information
     */
    function getPortfolioRisk(address user) external view returns (PortfolioRisk memory) {
        return userPortfolioRisk[user];
    }
    
    /**
     * @dev Get risk limits for a user
     * @param user User address
     * @return Risk limits
     */
    function getRiskLimits(address user) external view returns (RiskLimits memory) {
        RiskLimits memory limits = userRiskLimits[user];
        if (limits.maxVolatility == 0) {
            return defaultRiskLimits;
        }
        return limits;
    }
    
    /**
     * @dev Get risk alerts for a user
     * @param user User address
     * @return Array of alert IDs
     */
    function getUserAlerts(address user) external view returns (uint256[] memory) {
        return userAlerts[user];
    }
    
    /**
     * @dev Get risk alert information
     * @param alertId Alert ID
     * @return Risk alert information
     */
    function getRiskAlert(uint256 alertId) external view returns (RiskAlert memory) {
        return riskAlerts[alertId];
    }
    
    /**
     * @dev Get active risk alerts for a user
     * @param user User address
     * @return Array of active alert IDs
     */
    function getActiveUserAlerts(address user) external view returns (uint256[] memory) {
        uint256[] memory allAlerts = userAlerts[user];
        uint256 activeCount = 0;
        
        // Count active alerts
        for (uint256 i = 0; i < allAlerts.length; i++) {
            if (riskAlerts[allAlerts[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active alerts
        uint256[] memory activeAlerts = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allAlerts.length; i++) {
            if (riskAlerts[allAlerts[i]].isActive) {
                activeAlerts[index] = allAlerts[i];
                index++;
            }
        }
        
        return activeAlerts;
    }
    
    /**
     * @dev Calculate risk score for a strategy
     * @param strategyId Strategy ID
     * @return Risk score (0-10000, where 10000 is maximum risk)
     */
    function calculateStrategyRiskScore(uint256 strategyId) external view returns (uint256) {
        RiskMetrics memory metrics = strategyRiskMetrics[strategyId];
        
        // Simple risk score calculation
        uint256 riskScore = 0;
        
        // Volatility component (40% weight)
        riskScore += (metrics.volatility * 40) / 100;
        
        // Drawdown component (30% weight)
        riskScore += (metrics.maxDrawdown * 30) / 100;
        
        // Sharpe ratio component (20% weight) - lower Sharpe = higher risk
        if (metrics.sharpeRatio < 100) { // 0.1
            riskScore += ((100 - metrics.sharpeRatio) * 20) / 100;
        }
        
        // VaR component (10% weight)
        riskScore += (metrics.var95 * 10) / 100;
        
        return riskScore > MAX_RISK_SCORE ? MAX_RISK_SCORE : riskScore;
    }

    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calculate liquidity risk for a user's portfolio
     * @param user User address
     * @param strategyValues Array of strategy values
     * @return Liquidity risk score
     */
    function calculateLiquidityRisk(address user, uint256[] memory strategyValues) internal view returns (uint256) {
        // Simplified liquidity risk calculation
        // In practice, this would consider:
        // - Lock-up periods
        // - Withdrawal fees
        // - Market depth
        // - Protocol liquidity
        
        uint256 totalValue = 0;
        uint256 illiquidValue = 0;
        
        for (uint256 i = 0; i < strategyValues.length; i++) {
            if (strategyValues[i] > 0) {
                totalValue += strategyValues[i];
                
                // Assume strategies with higher risk have higher illiquidity
                RiskMetrics memory metrics = strategyRiskMetrics[i];
                if (metrics.volatility > 1500) { // 15% volatility threshold
                    illiquidValue += strategyValues[i];
                }
            }
        }
        
        if (totalValue == 0) return 0;
        
        return (illiquidValue * BASIS_POINTS) / totalValue;
    }
}
