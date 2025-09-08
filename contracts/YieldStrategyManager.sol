// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title YieldStrategyManager
 * @dev Manages multiple yield strategies for automated yield farming
 * @notice Enables community-created strategies and automated yield optimization
 */
contract YieldStrategyManager is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct Strategy {
        uint256 id;
        address creator;
        string name;
        string description;
        address targetProtocol; // Protocol to interact with (Aave, Compound, etc.)
        address[] inputTokens; // Tokens this strategy accepts
        address[] outputTokens; // Tokens this strategy produces
        uint256 riskLevel; // 1-10 risk scale
        uint256 minDeposit;
        uint256 maxDeposit;
        uint256 performanceFee; // Basis points (100 = 1%)
        uint256 managementFee; // Basis points (100 = 1%)
        bool isActive;
        bool isVerified;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 totalFeesEarned;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct UserPosition {
        uint256 strategyId;
        uint256 amount;
        uint256 shares;
        uint256 entryTime;
        uint256 lastHarvest;
        uint256 accumulatedFees;
    }
    
    struct StrategyPerformance {
        uint256 totalReturn; // Total return in basis points
        uint256 annualizedReturn; // Annualized return in basis points
        uint256 volatility; // Volatility measure
        uint256 sharpeRatio; // Risk-adjusted return
        uint256 maxDrawdown; // Maximum drawdown
        uint256 lastUpdate;
    }

    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Strategy) public strategies;
    mapping(address => mapping(uint256 => UserPosition)) public userPositions;
    mapping(uint256 => StrategyPerformance) public strategyPerformance;
    mapping(address => bool) public authorizedStrategists;
    mapping(address => bool) public verifiedProtocols;
    
    uint256 public strategyCount;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_PERFORMANCE_FEE = 2000; // 20%
    uint256 public constant MAX_MANAGEMENT_FEE = 500; // 5%
    
    address public feeRecipient;
    uint256 public platformFeeRate = 100; // 1% platform fee
    
    // ============ EVENTS ============
    
    event StrategyCreated(
        uint256 indexed strategyId,
        address indexed creator,
        string name,
        uint256 riskLevel
    );
    
    event StrategyUpdated(
        uint256 indexed strategyId,
        address indexed updater,
        string description
    );
    
    event StrategyVerified(
        uint256 indexed strategyId,
        address indexed verifier,
        bool verified
    );
    
    event Deposit(
        uint256 indexed strategyId,
        address indexed user,
        uint256 amount,
        uint256 shares
    );
    
    event Withdrawal(
        uint256 indexed strategyId,
        address indexed user,
        uint256 amount,
        uint256 shares
    );
    
    event Harvest(
        uint256 indexed strategyId,
        address indexed user,
        uint256 yield,
        uint256 fees
    );
    
    event PerformanceUpdated(
        uint256 indexed strategyId,
        uint256 totalReturn,
        uint256 annualizedReturn
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedStrategist() {
        require(
            authorizedStrategists[msg.sender] || msg.sender == owner(),
            "YieldStrategyManager: Not authorized strategist"
        );
        _;
    }
    
    modifier validStrategy(uint256 strategyId) {
        require(strategyId < strategyCount, "YieldStrategyManager: Invalid strategy");
        _;
    }
    
    modifier activeStrategy(uint256 strategyId) {
        require(strategies[strategyId].isActive, "YieldStrategyManager: Strategy inactive");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        authorizedStrategists[msg.sender] = true;
    }

    // ============ STRATEGY MANAGEMENT ============
    
    /**
     * @dev Create a new yield strategy
     * @param name Strategy name
     * @param description Strategy description
     * @param targetProtocol Protocol address
     * @param inputTokens Array of input token addresses
     * @param outputTokens Array of output token addresses
     * @param riskLevel Risk level (1-10)
     * @param minDeposit Minimum deposit amount
     * @param maxDeposit Maximum deposit amount
     * @param performanceFee Performance fee in basis points
     * @param managementFee Management fee in basis points
     */
    function createStrategy(
        string memory name,
        string memory description,
        address targetProtocol,
        address[] memory inputTokens,
        address[] memory outputTokens,
        uint256 riskLevel,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 performanceFee,
        uint256 managementFee
    ) external onlyAuthorizedStrategist returns (uint256) {
        require(riskLevel >= 1 && riskLevel <= 10, "YieldStrategyManager: Invalid risk level");
        require(performanceFee <= MAX_PERFORMANCE_FEE, "YieldStrategyManager: Performance fee too high");
        require(managementFee <= MAX_MANAGEMENT_FEE, "YieldStrategyManager: Management fee too high");
        require(minDeposit > 0, "YieldStrategyManager: Invalid min deposit");
        require(maxDeposit >= minDeposit, "YieldStrategyManager: Invalid max deposit");
        
        uint256 strategyId = strategyCount;
        
        strategies[strategyId] = Strategy({
            id: strategyId,
            creator: msg.sender,
            name: name,
            description: description,
            targetProtocol: targetProtocol,
            inputTokens: inputTokens,
            outputTokens: outputTokens,
            riskLevel: riskLevel,
            minDeposit: minDeposit,
            maxDeposit: maxDeposit,
            performanceFee: performanceFee,
            managementFee: managementFee,
            isActive: true,
            isVerified: false,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalFeesEarned: 0,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        strategyCount++;
        
        emit StrategyCreated(strategyId, msg.sender, name, riskLevel);
        
        return strategyId;
    }
    
    /**
     * @dev Update strategy information
     * @param strategyId Strategy ID
     * @param description New description
     */
    function updateStrategy(
        uint256 strategyId,
        string memory description
    ) external validStrategy(strategyId) {
        Strategy storage strategy = strategies[strategyId];
        require(
            msg.sender == strategy.creator || msg.sender == owner(),
            "YieldStrategyManager: Not authorized to update"
        );
        
        strategy.description = description;
        strategy.lastUpdated = block.timestamp;
        
        emit StrategyUpdated(strategyId, msg.sender, description);
    }
    
    /**
     * @dev Verify or unverify a strategy
     * @param strategyId Strategy ID
     * @param verified Verification status
     */
    function verifyStrategy(
        uint256 strategyId,
        bool verified
    ) external onlyOwner validStrategy(strategyId) {
        strategies[strategyId].isVerified = verified;
        
        emit StrategyVerified(strategyId, msg.sender, verified);
    }
    
    /**
     * @dev Activate or deactivate a strategy
     * @param strategyId Strategy ID
     * @param active Activation status
     */
    function setStrategyActive(
        uint256 strategyId,
        bool active
    ) external onlyOwner validStrategy(strategyId) {
        strategies[strategyId].isActive = active;
    }

    // ============ USER OPERATIONS ============
    
    /**
     * @dev Deposit into a strategy
     * @param strategyId Strategy ID
     * @param amount Deposit amount
     * @param token Token to deposit
     */
    function deposit(
        uint256 strategyId,
        uint256 amount,
        address token
    ) external nonReentrant validStrategy(strategyId) activeStrategy(strategyId) {
        Strategy storage strategy = strategies[strategyId];
        require(amount >= strategy.minDeposit, "YieldStrategyManager: Below minimum deposit");
        require(amount <= strategy.maxDeposit, "YieldStrategyManager: Above maximum deposit");
        
        // Check if token is supported
        bool tokenSupported = false;
        for (uint256 i = 0; i < strategy.inputTokens.length; i++) {
            if (strategy.inputTokens[i] == token) {
                tokenSupported = true;
                break;
            }
        }
        require(tokenSupported, "YieldStrategyManager: Token not supported");
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Calculate shares (simplified - in practice, this would be more complex)
        uint256 shares = amount; // 1:1 for simplicity
        
        // Update user position
        UserPosition storage position = userPositions[msg.sender][strategyId];
        position.strategyId = strategyId;
        position.amount += amount;
        position.shares += shares;
        position.entryTime = block.timestamp;
        position.lastHarvest = block.timestamp;
        
        // Update strategy totals
        strategy.totalDeposits += amount;
        
        emit Deposit(strategyId, msg.sender, amount, shares);
    }
    
    /**
     * @dev Withdraw from a strategy
     * @param strategyId Strategy ID
     * @param shares Shares to withdraw
     * @param token Token to withdraw
     */
    function withdraw(
        uint256 strategyId,
        uint256 shares,
        address token
    ) external nonReentrant validStrategy(strategyId) {
        UserPosition storage position = userPositions[msg.sender][strategyId];
        require(position.shares >= shares, "YieldStrategyManager: Insufficient shares");
        
        // Calculate withdrawal amount (simplified)
        uint256 amount = shares; // 1:1 for simplicity
        
        // Update user position
        position.amount -= amount;
        position.shares -= shares;
        
        // Update strategy totals
        strategies[strategyId].totalWithdrawals += amount;
        
        // Transfer tokens to user
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdrawal(strategyId, msg.sender, amount, shares);
    }
    
    /**
     * @dev Harvest yield from a strategy
     * @param strategyId Strategy ID
     */
    function harvest(uint256 strategyId) external validStrategy(strategyId) {
        UserPosition storage position = userPositions[msg.sender][strategyId];
        require(position.shares > 0, "YieldStrategyManager: No position");
        
        // Calculate yield (simplified - in practice, this would query the protocol)
        uint256 yield = calculateYield(strategyId, position.shares);
        require(yield > 0, "YieldStrategyManager: No yield to harvest");
        
        // Calculate fees
        Strategy storage strategy = strategies[strategyId];
        uint256 performanceFee = (yield * strategy.performanceFee) / BASIS_POINTS;
        uint256 platformFee = (yield * platformFeeRate) / BASIS_POINTS;
        uint256 totalFees = performanceFee + platformFee;
        
        // Update accumulated fees
        position.accumulatedFees += totalFees;
        position.lastHarvest = block.timestamp;
        
        // Update strategy totals
        strategy.totalFeesEarned += totalFees;
        
        emit Harvest(strategyId, msg.sender, yield, totalFees);
    }

    // ============ PERFORMANCE TRACKING ============
    
    /**
     * @dev Update strategy performance metrics
     * @param strategyId Strategy ID
     * @param totalReturn Total return in basis points
     * @param annualizedReturn Annualized return in basis points
     * @param volatility Volatility measure
     * @param sharpeRatio Risk-adjusted return
     * @param maxDrawdown Maximum drawdown
     */
    function updatePerformance(
        uint256 strategyId,
        uint256 totalReturn,
        uint256 annualizedReturn,
        uint256 volatility,
        uint256 sharpeRatio,
        uint256 maxDrawdown
    ) external onlyAuthorizedStrategist validStrategy(strategyId) {
        strategyPerformance[strategyId] = StrategyPerformance({
            totalReturn: totalReturn,
            annualizedReturn: annualizedReturn,
            volatility: volatility,
            sharpeRatio: sharpeRatio,
            maxDrawdown: maxDrawdown,
            lastUpdate: block.timestamp
        });
        
        emit PerformanceUpdated(strategyId, totalReturn, annualizedReturn);
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add authorized strategist
     * @param strategist Strategist address
     * @param authorized Authorization status
     */
    function setAuthorizedStrategist(address strategist, bool authorized) external onlyOwner {
        authorizedStrategists[strategist] = authorized;
    }
    
    /**
     * @dev Add verified protocol
     * @param protocol Protocol address
     * @param verified Verification status
     */
    function setVerifiedProtocol(address protocol, bool verified) external onlyOwner {
        verifiedProtocols[protocol] = verified;
    }
    
    /**
     * @dev Update platform fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function updatePlatformFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "YieldStrategyManager: Fee rate too high"); // Max 10%
        platformFeeRate = newFeeRate;
    }
    
    /**
     * @dev Update fee recipient
     * @param newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "YieldStrategyManager: Invalid address");
        feeRecipient = newFeeRecipient;
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get strategy information
     * @param strategyId Strategy ID
     * @return Strategy information
     */
    function getStrategy(uint256 strategyId) external view validStrategy(strategyId) returns (Strategy memory) {
        return strategies[strategyId];
    }
    
    /**
     * @dev Get user position
     * @param user User address
     * @param strategyId Strategy ID
     * @return User position information
     */
    function getUserPosition(address user, uint256 strategyId) external view returns (UserPosition memory) {
        return userPositions[user][strategyId];
    }
    
    /**
     * @dev Get strategy performance
     * @param strategyId Strategy ID
     * @return Strategy performance metrics
     */
    function getStrategyPerformance(uint256 strategyId) external view returns (StrategyPerformance memory) {
        return strategyPerformance[strategyId];
    }
    
    /**
     * @dev Get all strategies
     * @return Array of all strategies
     */
    function getAllStrategies() external view returns (Strategy[] memory) {
        Strategy[] memory allStrategies = new Strategy[](strategyCount);
        for (uint256 i = 0; i < strategyCount; i++) {
            allStrategies[i] = strategies[i];
        }
        return allStrategies;
    }

    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calculate yield for a position (simplified)
     * @param strategyId Strategy ID
     * @param shares Number of shares
     * @return Calculated yield
     */
    function calculateYield(uint256 strategyId, uint256 shares) internal view returns (uint256) {
        // Simplified yield calculation - in practice, this would query the actual protocol
        // For now, return a small fixed yield
        return (shares * 100) / BASIS_POINTS; // 1% yield
    }
}
