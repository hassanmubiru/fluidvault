// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./CrossChainBridge.sol";
import "./YieldStrategyManager.sol";

/**
 * @title MultiChainVault
 * @dev Multi-chain vault for cross-chain yield strategies
 * @notice Enables yield strategies across multiple blockchain networks
 */
contract MultiChainVault is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct CrossChainPosition {
        uint256 positionId;
        address user;
        uint256 strategyId;
        uint256 sourceChainId;
        uint256 targetChainId;
        address token;
        uint256 amount;
        uint256 shares;
        uint256 entryTime;
        uint256 lastUpdate;
        bool isActive;
        bytes32 bridgeTxHash;
    }
    
    struct ChainStrategy {
        uint256 chainId;
        uint256 strategyId;
        address strategyContract;
        bool isActive;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
    }
    
    struct CrossChainYield {
        uint256 positionId;
        uint256 yieldAmount;
        uint256 timestamp;
        uint256 sourceChainId;
        bool isClaimed;
    }

    // ============ STATE VARIABLES ============
    
    CrossChainBridge public bridge;
    YieldStrategyManager public strategyManager;
    
    mapping(uint256 => CrossChainPosition) public crossChainPositions;
    mapping(uint256 => ChainStrategy) public chainStrategies;
    mapping(uint256 => CrossChainYield) public crossChainYields;
    mapping(address => mapping(uint256 => uint256[])) public userPositions; // user => chainId => positionIds
    mapping(address => bool) public authorizedOperators;
    
    uint256 public positionCount;
    uint256 public chainStrategyCount;
    uint256 public yieldCount;
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public crossChainFeeRate = 100; // 1%
    address public feeRecipient;

    // ============ EVENTS ============
    
    event ChainStrategyAdded(
        uint256 indexed chainId,
        uint256 indexed strategyId,
        address strategyContract
    );
    
    event CrossChainDeposit(
        uint256 indexed positionId,
        address indexed user,
        uint256 sourceChainId,
        uint256 targetChainId,
        uint256 strategyId,
        uint256 amount,
        uint256 shares
    );
    
    event CrossChainWithdrawal(
        uint256 indexed positionId,
        address indexed user,
        uint256 amount,
        uint256 shares
    );
    
    event CrossChainYieldGenerated(
        uint256 indexed positionId,
        uint256 indexed yieldId,
        uint256 yieldAmount,
        uint256 sourceChainId
    );
    
    event CrossChainYieldClaimed(
        uint256 indexed yieldId,
        address indexed user,
        uint256 amount
    );
    
    event BridgeTransactionInitiated(
        uint256 indexed positionId,
        bytes32 indexed bridgeTxHash,
        uint256 targetChainId
    );
    
    event OperatorAuthorized(
        address indexed operator,
        bool authorized
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedOperator() {
        require(
            authorizedOperators[msg.sender] || msg.sender == owner(),
            "MultiChainVault: Not authorized operator"
        );
        _;
    }
    
    modifier validPosition(uint256 positionId) {
        require(positionId < positionCount, "MultiChainVault: Invalid position ID");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        address _bridge,
        address _strategyManager,
        address _feeRecipient
    ) {
        bridge = CrossChainBridge(_bridge);
        strategyManager = YieldStrategyManager(_strategyManager);
        feeRecipient = _feeRecipient;
        authorizedOperators[msg.sender] = true;
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add chain strategy
     * @param chainId Chain ID
     * @param strategyId Strategy ID on target chain
     * @param strategyContract Strategy contract address on target chain
     */
    function addChainStrategy(
        uint256 chainId,
        uint256 strategyId,
        address strategyContract
    ) external onlyOwner {
        chainStrategies[chainStrategyCount] = ChainStrategy({
            chainId: chainId,
            strategyId: strategyId,
            strategyContract: strategyContract,
            isActive: true,
            totalDeposits: 0,
            totalWithdrawals: 0
        });
        
        chainStrategyCount++;
        
        emit ChainStrategyAdded(chainId, strategyId, strategyContract);
    }
    
    /**
     * @dev Update chain strategy status
     * @param chainStrategyId Chain strategy ID
     * @param isActive Active status
     */
    function updateChainStrategy(
        uint256 chainStrategyId,
        bool isActive
    ) external onlyOwner {
        require(chainStrategyId < chainStrategyCount, "MultiChainVault: Invalid chain strategy ID");
        chainStrategies[chainStrategyId].isActive = isActive;
    }
    
    /**
     * @dev Authorize or deauthorize an operator
     * @param operator Operator address
     * @param authorized Authorization status
     */
    function setAuthorizedOperator(address operator, bool authorized) external onlyOwner {
        authorizedOperators[operator] = authorized;
        emit OperatorAuthorized(operator, authorized);
    }
    
    /**
     * @dev Update cross-chain fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function updateCrossChainFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 500, "MultiChainVault: Fee rate too high"); // Max 5%
        crossChainFeeRate = newFeeRate;
    }
    
    /**
     * @dev Update fee recipient
     * @param newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "MultiChainVault: Invalid address");
        feeRecipient = newFeeRecipient;
    }

    // ============ USER FUNCTIONS ============
    
    /**
     * @dev Deposit into cross-chain strategy
     * @param targetChainId Target chain ID
     * @param strategyId Strategy ID on target chain
     * @param token Token address
     * @param amount Deposit amount
     */
    function depositCrossChain(
        uint256 targetChainId,
        uint256 strategyId,
        address token,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "MultiChainVault: Invalid amount");
        
        // Find chain strategy
        uint256 chainStrategyId = findChainStrategy(targetChainId, strategyId);
        require(chainStrategyId != type(uint256).max, "MultiChainVault: Chain strategy not found");
        require(chainStrategies[chainStrategyId].isActive, "MultiChainVault: Chain strategy inactive");
        
        // Calculate cross-chain fee
        uint256 crossChainFee = (amount * crossChainFeeRate) / BASIS_POINTS;
        uint256 depositAmount = amount - crossChainFee;
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Transfer fee to fee recipient
        if (crossChainFee > 0) {
            IERC20(token).safeTransfer(feeRecipient, crossChainFee);
        }
        
        // Create cross-chain position
        uint256 positionId = positionCount;
        crossChainPositions[positionId] = CrossChainPosition({
            positionId: positionId,
            user: msg.sender,
            strategyId: strategyId,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            token: token,
            amount: depositAmount,
            shares: depositAmount, // Simplified - 1:1 ratio
            entryTime: block.timestamp,
            lastUpdate: block.timestamp,
            isActive: true,
            bridgeTxHash: bytes32(0)
        });
        
        positionCount++;
        userPositions[msg.sender][targetChainId].push(positionId);
        
        // Update chain strategy totals
        chainStrategies[chainStrategyId].totalDeposits += depositAmount;
        
        emit CrossChainDeposit(positionId, msg.sender, block.chainid, targetChainId, strategyId, depositAmount, depositAmount);
        
        // Initiate bridge transaction
        initiateBridgeTransaction(positionId, targetChainId, token, depositAmount);
    }
    
    /**
     * @dev Withdraw from cross-chain strategy
     * @param positionId Position ID
     * @param shares Shares to withdraw
     */
    function withdrawCrossChain(
        uint256 positionId,
        uint256 shares
    ) external nonReentrant validPosition(positionId) {
        CrossChainPosition storage position = crossChainPositions[positionId];
        require(position.user == msg.sender, "MultiChainVault: Not position owner");
        require(position.isActive, "MultiChainVault: Position inactive");
        require(position.shares >= shares, "MultiChainVault: Insufficient shares");
        
        // Calculate withdrawal amount
        uint256 withdrawalAmount = (position.amount * shares) / position.shares;
        
        // Update position
        position.amount -= withdrawalAmount;
        position.shares -= shares;
        position.lastUpdate = block.timestamp;
        
        if (position.shares == 0) {
            position.isActive = false;
        }
        
        // Update chain strategy totals
        uint256 chainStrategyId = findChainStrategy(position.targetChainId, position.strategyId);
        if (chainStrategyId != type(uint256).max) {
            chainStrategies[chainStrategyId].totalWithdrawals += withdrawalAmount;
        }
        
        // Transfer tokens to user
        IERC20(position.token).safeTransfer(msg.sender, withdrawalAmount);
        
        emit CrossChainWithdrawal(positionId, msg.sender, withdrawalAmount, shares);
    }
    
    /**
     * @dev Claim cross-chain yield
     * @param yieldId Yield ID
     */
    function claimCrossChainYield(
        uint256 yieldId
    ) external nonReentrant {
        require(yieldId < yieldCount, "MultiChainVault: Invalid yield ID");
        CrossChainYield storage yield = crossChainYields[yieldId];
        CrossChainPosition memory position = crossChainPositions[yield.positionId];
        
        require(position.user == msg.sender, "MultiChainVault: Not yield owner");
        require(!yield.isClaimed, "MultiChainVault: Yield already claimed");
        
        yield.isClaimed = true;
        
        // Transfer yield to user
        IERC20(position.token).safeTransfer(msg.sender, yield.yieldAmount);
        
        emit CrossChainYieldClaimed(yieldId, msg.sender, yield.yieldAmount);
    }

    // ============ OPERATOR FUNCTIONS ============
    
    /**
     * @dev Record cross-chain yield (called by operator)
     * @param positionId Position ID
     * @param yieldAmount Yield amount
     * @param sourceChainId Source chain ID
     */
    function recordCrossChainYield(
        uint256 positionId,
        uint256 yieldAmount,
        uint256 sourceChainId
    ) external onlyAuthorizedOperator validPosition(positionId) {
        CrossChainPosition storage position = crossChainPositions[positionId];
        require(position.isActive, "MultiChainVault: Position inactive");
        
        uint256 yieldId = yieldCount;
        crossChainYields[yieldId] = CrossChainYield({
            positionId: positionId,
            yieldAmount: yieldAmount,
            timestamp: block.timestamp,
            sourceChainId: sourceChainId,
            isClaimed: false
        });
        
        yieldCount++;
        
        emit CrossChainYieldGenerated(positionId, yieldId, yieldAmount, sourceChainId);
    }
    
    /**
     * @dev Update bridge transaction hash
     * @param positionId Position ID
     * @param bridgeTxHash Bridge transaction hash
     */
    function updateBridgeTransactionHash(
        uint256 positionId,
        bytes32 bridgeTxHash
    ) external onlyAuthorizedOperator validPosition(positionId) {
        crossChainPositions[positionId].bridgeTxHash = bridgeTxHash;
        
        emit BridgeTransactionInitiated(positionId, bridgeTxHash, crossChainPositions[positionId].targetChainId);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get cross-chain position
     * @param positionId Position ID
     * @return Cross-chain position information
     */
    function getCrossChainPosition(uint256 positionId) external view returns (CrossChainPosition memory) {
        return crossChainPositions[positionId];
    }
    
    /**
     * @dev Get chain strategy
     * @param chainStrategyId Chain strategy ID
     * @return Chain strategy information
     */
    function getChainStrategy(uint256 chainStrategyId) external view returns (ChainStrategy memory) {
        return chainStrategies[chainStrategyId];
    }
    
    /**
     * @dev Get cross-chain yield
     * @param yieldId Yield ID
     * @return Cross-chain yield information
     */
    function getCrossChainYield(uint256 yieldId) external view returns (CrossChainYield memory) {
        return crossChainYields[yieldId];
    }
    
    /**
     * @dev Get user positions for a chain
     * @param user User address
     * @param chainId Chain ID
     * @return Array of position IDs
     */
    function getUserPositions(address user, uint256 chainId) external view returns (uint256[] memory) {
        return userPositions[user][chainId];
    }
    
    /**
     * @dev Get user's unclaimed yields
     * @param user User address
     * @return Array of unclaimed yield IDs
     */
    function getUserUnclaimedYields(address user) external view returns (uint256[] memory) {
        uint256[] memory unclaimedYields = new uint256[](yieldCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < yieldCount; i++) {
            CrossChainYield memory yield = crossChainYields[i];
            CrossChainPosition memory position = crossChainPositions[yield.positionId];
            
            if (position.user == user && !yield.isClaimed) {
                unclaimedYields[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = unclaimedYields[i];
        }
        
        return result;
    }
    
    /**
     * @dev Calculate cross-chain fees
     * @param amount Transfer amount
     * @return Cross-chain fee amount
     */
    function calculateCrossChainFees(uint256 amount) external view returns (uint256) {
        return (amount * crossChainFeeRate) / BASIS_POINTS;
    }

    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Find chain strategy by chain ID and strategy ID
     * @param chainId Chain ID
     * @param strategyId Strategy ID
     * @return Chain strategy ID or max uint256 if not found
     */
    function findChainStrategy(uint256 chainId, uint256 strategyId) internal view returns (uint256) {
        for (uint256 i = 0; i < chainStrategyCount; i++) {
            if (chainStrategies[i].chainId == chainId && chainStrategies[i].strategyId == strategyId) {
                return i;
            }
        }
        return type(uint256).max;
    }
    
    /**
     * @dev Initiate bridge transaction
     * @param positionId Position ID
     * @param targetChainId Target chain ID
     * @param token Token address
     * @param amount Transfer amount
     */
    function initiateBridgeTransaction(
        uint256 positionId,
        uint256 targetChainId,
        address token,
        uint256 amount
    ) internal {
        // In a real implementation, this would call the bridge contract
        // For now, we'll just emit an event
        emit BridgeTransactionInitiated(positionId, bytes32(0), targetChainId);
    }
}
