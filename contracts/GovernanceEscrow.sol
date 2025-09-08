// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GovernanceEscrow
 * @dev Handles governance escrow, slashing, and rewards for governance participation
 * @author FluidVault Team
 */
contract GovernanceEscrow is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // Events
    event TokensEscrowed(address indexed user, uint256 amount, uint256 timestamp);
    event TokensReleased(address indexed user, uint256 amount, uint256 timestamp);
    event TokensSlashed(address indexed user, uint256 amount, string reason, uint256 timestamp);
    event RewardsDistributed(address indexed user, uint256 amount, uint256 timestamp);
    event EscrowPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event SlashingThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event RewardsRateUpdated(uint256 oldRate, uint256 newRate);
    
    // Structs
    struct EscrowPosition {
        uint256 amount;
        uint256 timestamp;
        uint256 releaseTime;
        bool released;
        uint256 slashingRisk; // 0-100 percentage
    }
    
    struct SlashingEvent {
        address user;
        uint256 amount;
        string reason;
        uint256 timestamp;
        address slasher;
    }
    
    struct RewardsInfo {
        uint256 totalEarned;
        uint256 totalClaimed;
        uint256 lastClaimTime;
        uint256 pendingRewards;
    }
    
    // State variables
    IERC20 public immutable token;
    
    mapping(address => EscrowPosition[]) public userEscrows;
    mapping(address => uint256) public totalEscrowed;
    mapping(address => uint256) public totalReleased;
    mapping(address => uint256) public totalSlashed;
    mapping(address => RewardsInfo) public userRewards;
    
    SlashingEvent[] public slashingEvents;
    
    uint256 public escrowPeriod = 7 days; // Default 7 days escrow
    uint256 public slashingThreshold = 50; // 50% slashing threshold
    uint256 public rewardsRate = 100; // 100 basis points (1%) per day
    uint256 public maxEscrowAmount = 1000000 * 10**18; // 1M tokens max
    
    // External contracts
    address public immutable governanceContract;
    address public immutable votingContract;
    
    // Slashing authorities
    mapping(address => bool) public slashingAuthorities;
    
    constructor(
        address _token,
        address _governanceContract,
        address _votingContract
    ) {
        require(_token != address(0), "Invalid token address");
        require(_governanceContract != address(0), "Invalid governance contract");
        require(_votingContract != address(0), "Invalid voting contract");
        
        token = IERC20(_token);
        governanceContract = _governanceContract;
        votingContract = _votingContract;
        
        // Owner is automatically a slashing authority
        slashingAuthorities[msg.sender] = true;
    }
    
    /**
     * @dev Escrow tokens for governance participation
     * @param amount Amount of tokens to escrow
     */
    function escrowTokens(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= maxEscrowAmount, "Amount exceeds maximum escrow");
        require(totalEscrowed[msg.sender] + amount <= maxEscrowAmount, "Total escrow exceeds maximum");
        
        // Transfer tokens from user to contract
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        uint256 releaseTime = block.timestamp + escrowPeriod;
        
        // Create escrow position
        userEscrows[msg.sender].push(EscrowPosition({
            amount: amount,
            timestamp: block.timestamp,
            releaseTime: releaseTime,
            released: false,
            slashingRisk: 0
        }));
        
        totalEscrowed[msg.sender] += amount;
        
        emit TokensEscrowed(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Release escrowed tokens
     * @param escrowIndex Index of the escrow position to release
     */
    function releaseTokens(uint256 escrowIndex) external nonReentrant whenNotPaused {
        require(escrowIndex < userEscrows[msg.sender].length, "Invalid escrow index");
        
        EscrowPosition storage escrow = userEscrows[msg.sender][escrowIndex];
        require(!escrow.released, "Escrow already released");
        require(block.timestamp >= escrow.releaseTime, "Escrow period not completed");
        
        escrow.released = true;
        totalReleased[msg.sender] += escrow.amount;
        
        // Transfer tokens back to user
        token.safeTransfer(msg.sender, escrow.amount);
        
        emit TokensReleased(msg.sender, escrow.amount, block.timestamp);
    }
    
    /**
     * @dev Release all eligible escrowed tokens
     */
    function releaseAllEligibleTokens() external nonReentrant whenNotPaused {
        uint256 totalToRelease = 0;
        
        for (uint256 i = 0; i < userEscrows[msg.sender].length; i++) {
            EscrowPosition storage escrow = userEscrows[msg.sender][i];
            
            if (!escrow.released && block.timestamp >= escrow.releaseTime) {
                escrow.released = true;
                totalToRelease += escrow.amount;
            }
        }
        
        require(totalToRelease > 0, "No tokens eligible for release");
        
        totalReleased[msg.sender] += totalToRelease;
        
        // Transfer tokens back to user
        token.safeTransfer(msg.sender, totalToRelease);
        
        emit TokensReleased(msg.sender, totalToRelease, block.timestamp);
    }
    
    /**
     * @dev Slash tokens from a user's escrow
     * @param user The user to slash
     * @param amount Amount to slash
     * @param reason Reason for slashing
     */
    function slashTokens(
        address user,
        uint256 amount,
        string calldata reason
    ) external nonReentrant whenNotPaused {
        require(slashingAuthorities[msg.sender], "Not authorized to slash");
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        
        uint256 availableToSlash = getAvailableToSlash(user);
        require(amount <= availableToSlash, "Amount exceeds available to slash");
        
        // Slash from escrowed tokens
        uint256 remainingToSlash = amount;
        
        for (uint256 i = 0; i < userEscrows[user].length && remainingToSlash > 0; i++) {
            EscrowPosition storage escrow = userEscrows[user][i];
            
            if (!escrow.released) {
                uint256 slashFromThis = remainingToSlash > escrow.amount ? escrow.amount : remainingToSlash;
                
                escrow.amount -= slashFromThis;
                remainingToSlash -= slashFromThis;
                
                // If escrow is completely slashed, mark as released
                if (escrow.amount == 0) {
                    escrow.released = true;
                }
            }
        }
        
        totalSlashed[user] += amount;
        totalEscrowed[user] -= amount;
        
        // Record slashing event
        slashingEvents.push(SlashingEvent({
            user: user,
            amount: amount,
            reason: reason,
            timestamp: block.timestamp,
            slasher: msg.sender
        }));
        
        // Transfer slashed tokens to contract (could be burned or sent to treasury)
        // For now, they remain in the contract
        
        emit TokensSlashed(user, amount, reason, block.timestamp);
    }
    
    /**
     * @dev Calculate and distribute governance rewards
     * @param user The user to calculate rewards for
     */
    function calculateRewards(address user) external {
        require(msg.sender == governanceContract || msg.sender == votingContract, "Unauthorized");
        
        uint256 pendingRewards = getPendingRewards(user);
        if (pendingRewards > 0) {
            userRewards[user].pendingRewards += pendingRewards;
            userRewards[user].totalEarned += pendingRewards;
            userRewards[user].lastClaimTime = block.timestamp;
        }
    }
    
    /**
     * @dev Claim governance rewards
     */
    function claimRewards() external nonReentrant whenNotPaused {
        RewardsInfo storage rewards = userRewards[msg.sender];
        require(rewards.pendingRewards > 0, "No rewards to claim");
        
        uint256 amountToClaim = rewards.pendingRewards;
        rewards.pendingRewards = 0;
        rewards.totalClaimed += amountToClaim;
        
        // Transfer rewards to user
        token.safeTransfer(msg.sender, amountToClaim);
        
        emit RewardsDistributed(msg.sender, amountToClaim, block.timestamp);
    }
    
    /**
     * @dev Add a slashing authority
     * @param authority The address to add as slashing authority
     */
    function addSlashingAuthority(address authority) external onlyOwner {
        require(authority != address(0), "Invalid authority address");
        require(!slashingAuthorities[authority], "Already a slashing authority");
        
        slashingAuthorities[authority] = true;
    }
    
    /**
     * @dev Remove a slashing authority
     * @param authority The address to remove as slashing authority
     */
    function removeSlashingAuthority(address authority) external onlyOwner {
        require(slashingAuthorities[authority], "Not a slashing authority");
        require(authority != owner(), "Cannot remove owner as slashing authority");
        
        slashingAuthorities[authority] = false;
    }
    
    /**
     * @dev Update escrow period
     * @param newPeriod New escrow period in seconds
     */
    function updateEscrowPeriod(uint256 newPeriod) external onlyOwner {
        require(newPeriod > 0, "Invalid escrow period");
        require(newPeriod != escrowPeriod, "Escrow period unchanged");
        
        uint256 oldPeriod = escrowPeriod;
        escrowPeriod = newPeriod;
        
        emit EscrowPeriodUpdated(oldPeriod, newPeriod);
    }
    
    /**
     * @dev Update slashing threshold
     * @param newThreshold New slashing threshold percentage (0-100)
     */
    function updateSlashingThreshold(uint256 newThreshold) external onlyOwner {
        require(newThreshold <= 100, "Invalid slashing threshold");
        require(newThreshold != slashingThreshold, "Slashing threshold unchanged");
        
        uint256 oldThreshold = slashingThreshold;
        slashingThreshold = newThreshold;
        
        emit SlashingThresholdUpdated(oldThreshold, newThreshold);
    }
    
    /**
     * @dev Update rewards rate
     * @param newRate New rewards rate in basis points
     */
    function updateRewardsRate(uint256 newRate) external onlyOwner {
        require(newRate != rewardsRate, "Rewards rate unchanged");
        
        uint256 oldRate = rewardsRate;
        rewardsRate = newRate;
        
        emit RewardsRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Get user's escrow positions
     * @param user The user address
     * @return Array of escrow positions
     */
    function getUserEscrows(address user) external view returns (EscrowPosition[] memory) {
        return userEscrows[user];
    }
    
    /**
     * @dev Get available tokens to slash for a user
     * @param user The user address
     * @return Amount available to slash
     */
    function getAvailableToSlash(address user) public view returns (uint256) {
        uint256 available = 0;
        
        for (uint256 i = 0; i < userEscrows[user].length; i++) {
            EscrowPosition storage escrow = userEscrows[user][i];
            if (!escrow.released) {
                available += escrow.amount;
            }
        }
        
        return available;
    }
    
    /**
     * @dev Get pending rewards for a user
     * @param user The user address
     * @return Pending rewards amount
     */
    function getPendingRewards(address user) public view returns (uint256) {
        RewardsInfo storage rewards = userRewards[user];
        uint256 timeSinceLastClaim = block.timestamp - rewards.lastClaimTime;
        
        // Calculate rewards based on escrowed amount and time
        uint256 escrowedAmount = totalEscrowed[user] - totalSlashed[user];
        uint256 dailyReward = (escrowedAmount * rewardsRate) / 10000; // Convert basis points to percentage
        uint256 pendingReward = (dailyReward * timeSinceLastClaim) / 1 days;
        
        return pendingReward;
    }
    
    /**
     * @dev Get user's rewards information
     * @param user The user address
     * @return Rewards information
     */
    function getUserRewards(address user) external view returns (RewardsInfo memory) {
        RewardsInfo memory rewards = userRewards[user];
        rewards.pendingRewards = getPendingRewards(user);
        return rewards;
    }
    
    /**
     * @dev Get slashing events with pagination
     * @param offset Starting index
     * @param limit Maximum number of events to return
     * @return Array of slashing events
     */
    function getSlashingEventsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (SlashingEvent[] memory) {
        require(offset < slashingEvents.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > slashingEvents.length) {
            end = slashingEvents.length;
        }
        
        SlashingEvent[] memory result = new SlashingEvent[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = slashingEvents[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get escrow statistics
     * @return totalEscrowedAmount Total amount escrowed across all users
     * @return totalReleasedAmount Total amount released across all users
     * @return totalSlashedAmount Total amount slashed across all users
     * @return totalRewards Total rewards distributed
     */
    function getEscrowStats() external view returns (
        uint256 totalEscrowedAmount,
        uint256 totalReleasedAmount,
        uint256 totalSlashedAmount,
        uint256 totalRewards
    ) {
        // This would require iterating through all users, which is gas-intensive
        // For now, return contract balance as a proxy
        totalEscrowedAmount = token.balanceOf(address(this));
        totalReleasedAmount = 0; // Would need to track this separately
        totalSlashedAmount = 0; // Would need to track this separately
        totalRewards = 0; // Would need to track this separately
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
}
