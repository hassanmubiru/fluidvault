// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./YieldStrategyManager.sol";

/**
 * @title AutoCompound
 * @dev Automated yield compounding system for strategies
 * @notice Automatically compounds yield to maximize returns
 */
contract AutoCompound is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct CompoundSettings {
        bool isEnabled;
        uint256 frequency; // Hours between compounds
        uint256 minAmount; // Minimum amount to compound
        uint256 maxGasPrice; // Maximum gas price for auto-compound
        uint256 lastCompound;
        uint256 totalCompounds;
        uint256 totalCompounded;
    }
    
    struct CompoundJob {
        uint256 strategyId;
        address user;
        uint256 nextExecution;
        bool isActive;
        uint256 executions;
        uint256 totalCompounded;
    }

    // ============ STATE VARIABLES ============
    
    YieldStrategyManager public strategyManager;
    
    mapping(address => mapping(uint256 => CompoundSettings)) public userCompoundSettings;
    mapping(bytes32 => CompoundJob) public compoundJobs;
    mapping(address => bool) public authorizedExecutors;
    
    uint256 public jobCount;
    uint256 public constant MIN_FREQUENCY = 1; // 1 hour minimum
    uint256 public constant MAX_FREQUENCY = 168; // 1 week maximum
    uint256 public constant BASIS_POINTS = 10000;
    
    uint256 public compoundFeeRate = 50; // 0.5% fee for auto-compound
    address public feeRecipient;
    
    // ============ EVENTS ============
    
    event CompoundSettingsUpdated(
        address indexed user,
        uint256 indexed strategyId,
        bool enabled,
        uint256 frequency,
        uint256 minAmount
    );
    
    event AutoCompoundExecuted(
        address indexed user,
        uint256 indexed strategyId,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    
    event CompoundJobCreated(
        bytes32 indexed jobId,
        address indexed user,
        uint256 indexed strategyId,
        uint256 nextExecution
    );
    
    event CompoundJobCancelled(
        bytes32 indexed jobId,
        address indexed user,
        uint256 indexed strategyId
    );
    
    event ExecutorAuthorized(
        address indexed executor,
        bool authorized
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedExecutor() {
        require(
            authorizedExecutors[msg.sender] || msg.sender == owner(),
            "AutoCompound: Not authorized executor"
        );
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _strategyManager, address _feeRecipient) {
        strategyManager = YieldStrategyManager(_strategyManager);
        feeRecipient = _feeRecipient;
        authorizedExecutors[msg.sender] = true;
    }

    // ============ USER FUNCTIONS ============
    
    /**
     * @dev Enable auto-compound for a strategy
     * @param strategyId Strategy ID
     * @param frequency Hours between compounds
     * @param minAmount Minimum amount to compound
     * @param maxGasPrice Maximum gas price for execution
     */
    function enableAutoCompound(
        uint256 strategyId,
        uint256 frequency,
        uint256 minAmount,
        uint256 maxGasPrice
    ) external {
        require(frequency >= MIN_FREQUENCY && frequency <= MAX_FREQUENCY, "AutoCompound: Invalid frequency");
        require(minAmount > 0, "AutoCompound: Invalid min amount");
        
        // Check if user has position in strategy
        YieldStrategyManager.UserPosition memory position = strategyManager.getUserPosition(msg.sender, strategyId);
        require(position.shares > 0, "AutoCompound: No position in strategy");
        
        // Update settings
        userCompoundSettings[msg.sender][strategyId] = CompoundSettings({
            isEnabled: true,
            frequency: frequency,
            minAmount: minAmount,
            maxGasPrice: maxGasPrice,
            lastCompound: 0,
            totalCompounds: 0,
            totalCompounded: 0
        });
        
        // Create compound job
        bytes32 jobId = keccak256(abi.encodePacked(msg.sender, strategyId, block.timestamp));
        compoundJobs[jobId] = CompoundJob({
            strategyId: strategyId,
            user: msg.sender,
            nextExecution: block.timestamp + (frequency * 1 hours),
            isActive: true,
            executions: 0,
            totalCompounded: 0
        });
        
        jobCount++;
        
        emit CompoundSettingsUpdated(msg.sender, strategyId, true, frequency, minAmount);
        emit CompoundJobCreated(jobId, msg.sender, strategyId, block.timestamp + (frequency * 1 hours));
    }
    
    /**
     * @dev Disable auto-compound for a strategy
     * @param strategyId Strategy ID
     */
    function disableAutoCompound(uint256 strategyId) external {
        userCompoundSettings[msg.sender][strategyId].isEnabled = false;
        
        // Find and cancel compound job
        bytes32 jobId = findUserJob(msg.sender, strategyId);
        if (jobId != bytes32(0)) {
            compoundJobs[jobId].isActive = false;
            emit CompoundJobCancelled(jobId, msg.sender, strategyId);
        }
        
        emit CompoundSettingsUpdated(msg.sender, strategyId, false, 0, 0);
    }
    
    /**
     * @dev Update auto-compound settings
     * @param strategyId Strategy ID
     * @param frequency New frequency
     * @param minAmount New minimum amount
     * @param maxGasPrice New maximum gas price
     */
    function updateAutoCompoundSettings(
        uint256 strategyId,
        uint256 frequency,
        uint256 minAmount,
        uint256 maxGasPrice
    ) external {
        require(frequency >= MIN_FREQUENCY && frequency <= MAX_FREQUENCY, "AutoCompound: Invalid frequency");
        require(minAmount > 0, "AutoCompound: Invalid min amount");
        
        CompoundSettings storage settings = userCompoundSettings[msg.sender][strategyId];
        require(settings.isEnabled, "AutoCompound: Auto-compound not enabled");
        
        settings.frequency = frequency;
        settings.minAmount = minAmount;
        settings.maxGasPrice = maxGasPrice;
        
        // Update compound job
        bytes32 jobId = findUserJob(msg.sender, strategyId);
        if (jobId != bytes32(0)) {
            compoundJobs[jobId].nextExecution = block.timestamp + (frequency * 1 hours);
        }
        
        emit CompoundSettingsUpdated(msg.sender, strategyId, true, frequency, minAmount);
    }

    // ============ EXECUTOR FUNCTIONS ============
    
    /**
     * @dev Execute auto-compound for a specific job
     * @param jobId Job ID
     */
    function executeCompound(bytes32 jobId) external onlyAuthorizedExecutor nonReentrant {
        CompoundJob storage job = compoundJobs[jobId];
        require(job.isActive, "AutoCompound: Job not active");
        require(block.timestamp >= job.nextExecution, "AutoCompound: Not time to execute");
        
        // Check gas price
        CompoundSettings storage settings = userCompoundSettings[job.user][job.strategyId];
        require(tx.gasprice <= settings.maxGasPrice, "AutoCompound: Gas price too high");
        
        // Check if user still has position
        YieldStrategyManager.UserPosition memory position = strategyManager.getUserPosition(job.user, job.strategyId);
        require(position.shares > 0, "AutoCompound: No position");
        
        // Calculate yield to compound
        uint256 yield = calculateYield(job.user, job.strategyId);
        require(yield >= settings.minAmount, "AutoCompound: Yield below minimum");
        
        // Execute compound (simplified - in practice, this would interact with the strategy)
        uint256 compoundFee = (yield * compoundFeeRate) / BASIS_POINTS;
        uint256 compoundAmount = yield - compoundFee;
        
        // Update job
        job.executions++;
        job.totalCompounded += compoundAmount;
        job.nextExecution = block.timestamp + (settings.frequency * 1 hours);
        
        // Update settings
        settings.lastCompound = block.timestamp;
        settings.totalCompounds++;
        settings.totalCompounded += compoundAmount;
        
        // Transfer fee to fee recipient
        if (compoundFee > 0) {
            // In practice, this would transfer the actual token
            // For now, we'll just emit the event
        }
        
        emit AutoCompoundExecuted(job.user, job.strategyId, compoundAmount, compoundFee, block.timestamp);
    }
    
    /**
     * @dev Execute multiple compounds in batch
     * @param jobIds Array of job IDs
     */
    function executeBatchCompound(bytes32[] calldata jobIds) external onlyAuthorizedExecutor {
        for (uint256 i = 0; i < jobIds.length; i++) {
            try this.executeCompound(jobIds[i]) {
                // Success
            } catch {
                // Continue with next job
                continue;
            }
        }
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Authorize or deauthorize an executor
     * @param executor Executor address
     * @param authorized Authorization status
     */
    function setAuthorizedExecutor(address executor, bool authorized) external onlyOwner {
        authorizedExecutors[executor] = authorized;
        emit ExecutorAuthorized(executor, authorized);
    }
    
    /**
     * @dev Update compound fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function updateCompoundFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 500, "AutoCompound: Fee rate too high"); // Max 5%
        compoundFeeRate = newFeeRate;
    }
    
    /**
     * @dev Update fee recipient
     * @param newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "AutoCompound: Invalid address");
        feeRecipient = newFeeRecipient;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's compound settings for a strategy
     * @param user User address
     * @param strategyId Strategy ID
     * @return Compound settings
     */
    function getCompoundSettings(address user, uint256 strategyId) external view returns (CompoundSettings memory) {
        return userCompoundSettings[user][strategyId];
    }
    
    /**
     * @dev Get compound job information
     * @param jobId Job ID
     * @return Compound job information
     */
    function getCompoundJob(bytes32 jobId) external view returns (CompoundJob memory) {
        return compoundJobs[jobId];
    }
    
    /**
     * @dev Get all active jobs
     * @return Array of active job IDs
     */
    function getActiveJobs() external view returns (bytes32[] memory) {
        bytes32[] memory activeJobs = new bytes32[](jobCount);
        uint256 count = 0;
        
        // This is a simplified implementation
        // In practice, you'd want to maintain a separate array of active jobs
        for (uint256 i = 0; i < jobCount; i++) {
            bytes32 jobId = bytes32(i);
            if (compoundJobs[jobId].isActive) {
                activeJobs[count] = jobId;
                count++;
            }
        }
        
        // Resize array
        bytes32[] memory result = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeJobs[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get jobs ready for execution
     * @return Array of job IDs ready for execution
     */
    function getJobsReadyForExecution() external view returns (bytes32[] memory) {
        bytes32[] memory readyJobs = new bytes32[](jobCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < jobCount; i++) {
            bytes32 jobId = bytes32(i);
            CompoundJob memory job = compoundJobs[jobId];
            if (job.isActive && block.timestamp >= job.nextExecution) {
                readyJobs[count] = jobId;
                count++;
            }
        }
        
        // Resize array
        bytes32[] memory result = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = readyJobs[i];
        }
        
        return result;
    }

    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Find user's job for a strategy
     * @param user User address
     * @param strategyId Strategy ID
     * @return Job ID or zero if not found
     */
    function findUserJob(address user, uint256 strategyId) internal view returns (bytes32) {
        for (uint256 i = 0; i < jobCount; i++) {
            bytes32 jobId = bytes32(i);
            CompoundJob memory job = compoundJobs[jobId];
            if (job.user == user && job.strategyId == strategyId && job.isActive) {
                return jobId;
            }
        }
        return bytes32(0);
    }
    
    /**
     * @dev Calculate yield for a user's position
     * @param user User address
     * @param strategyId Strategy ID
     * @return Calculated yield
     */
    function calculateYield(address user, uint256 strategyId) internal view returns (uint256) {
        YieldStrategyManager.UserPosition memory position = strategyManager.getUserPosition(user, strategyId);
        
        // Simplified yield calculation
        // In practice, this would query the actual strategy for yield
        uint256 timeSinceLastHarvest = block.timestamp - position.lastHarvest;
        uint256 annualYield = (position.amount * 500) / BASIS_POINTS; // 5% annual yield
        uint256 yield = (annualYield * timeSinceLastHarvest) / 365 days;
        
        return yield;
    }
}
