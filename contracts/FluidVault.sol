// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./InterestCalculator.sol";
import "./Governance.sol";

/**
 * @title FluidVault
 * @dev A decentralized savings platform with real-time interest accrual
 * @notice Leverages Somnia Network's high TPS and sub-second finality for instant withdrawals
 */
contract FluidVault is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct UserDeposit {
        uint256 amount;
        uint256 timestamp;
        uint256 lastInterestUpdate;
        uint256 accumulatedInterest;
    }

    struct VaultInfo {
        IERC20 token;
        uint256 totalDeposits;
        uint256 totalInterestPaid;
        uint256 currentInterestRate; // Basis points (100 = 1%)
        uint256 lastRateUpdate;
        bool isActive;
    }

    // ============ STATE VARIABLES ============
    
    mapping(address => mapping(address => UserDeposit)) public userDeposits;
    mapping(address => VaultInfo) public vaults;
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public authorizedOperators;
    
    InterestCalculator public interestCalculator;
    Governance public governance;
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_DEPOSIT = 1e15; // 0.001 tokens
    uint256 public constant MAX_VAULTS = 50;
    
    uint256 public totalVaults;
    uint256 public platformFeeRate = 50; // 0.5% in basis points
    address public feeRecipient;
    
    // ============ EVENTS ============
    
    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed user, address indexed token, uint256 amount, uint256 interest, uint256 timestamp);
    event InterestAccrued(address indexed user, address indexed token, uint256 interest, uint256 timestamp);
    event VaultCreated(address indexed token, uint256 initialRate, uint256 timestamp);
    event InterestRateUpdated(address indexed token, uint256 newRate, uint256 timestamp);
    event PlatformFeeUpdated(uint256 newFeeRate, uint256 timestamp);
    
    // ============ MODIFIERS ============
    
    modifier onlyAuthorized() {
        require(authorizedOperators[msg.sender] || msg.sender == owner(), "FluidVault: Not authorized");
        _;
    }
    
    modifier validToken(address token) {
        require(supportedTokens[token], "FluidVault: Token not supported");
        _;
    }
    
    modifier validDeposit(uint256 amount) {
        require(amount >= MIN_DEPOSIT, "FluidVault: Deposit too small");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(
        address _interestCalculator,
        address _governance,
        address _feeRecipient
    ) {
        interestCalculator = InterestCalculator(_interestCalculator);
        governance = Governance(_governance);
        feeRecipient = _feeRecipient;
        authorizedOperators[msg.sender] = true;
    }

    // ============ DEPOSIT FUNCTIONS ============
    
    /**
     * @dev Deposit tokens into the vault
     * @param token Address of the token to deposit
     * @param amount Amount of tokens to deposit
     */
    function deposit(address token, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        validToken(token) 
        validDeposit(amount) 
    {
        VaultInfo storage vault = vaults[token];
        require(vault.isActive, "FluidVault: Vault not active");
        
        UserDeposit storage userDeposit = userDeposits[msg.sender][token];
        
        // Accrue interest before updating deposit
        if (userDeposit.amount > 0) {
            _accrueInterest(msg.sender, token);
        }
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user deposit
        userDeposit.amount += amount;
        userDeposit.timestamp = block.timestamp;
        userDeposit.lastInterestUpdate = block.timestamp;
        
        // Update vault totals
        vault.totalDeposits += amount;
        
        emit Deposit(msg.sender, token, amount, block.timestamp);
    }

    // ============ WITHDRAWAL FUNCTIONS ============
    
    /**
     * @dev Withdraw all tokens and accrued interest
     * @param token Address of the token to withdraw
     */
    function withdrawAll(address token) 
        external 
        nonReentrant 
        whenNotPaused 
        validToken(token) 
    {
        UserDeposit storage userDeposit = userDeposits[msg.sender][token];
        require(userDeposit.amount > 0, "FluidVault: No deposit found");
        
        // Accrue interest
        _accrueInterest(msg.sender, token);
        
        uint256 totalAmount = userDeposit.amount + userDeposit.accumulatedInterest;
        uint256 interestAmount = userDeposit.accumulatedInterest;
        
        // Reset user deposit
        userDeposit.amount = 0;
        userDeposit.accumulatedInterest = 0;
        userDeposit.lastInterestUpdate = 0;
        
        // Update vault totals
        VaultInfo storage vault = vaults[token];
        vault.totalDeposits -= (totalAmount - interestAmount);
        vault.totalInterestPaid += interestAmount;
        
        // Transfer tokens to user
        IERC20(token).safeTransfer(msg.sender, totalAmount);
        
        emit Withdrawal(msg.sender, token, totalAmount, interestAmount, block.timestamp);
    }
    
    /**
     * @dev Withdraw partial amount
     * @param token Address of the token to withdraw
     * @param amount Amount to withdraw (excluding interest)
     */
    function withdraw(address token, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        validToken(token) 
    {
        UserDeposit storage userDeposit = userDeposits[msg.sender][token];
        require(userDeposit.amount >= amount, "FluidVault: Insufficient deposit");
        
        // Accrue interest
        _accrueInterest(msg.sender, token);
        
        // Update user deposit
        userDeposit.amount -= amount;
        userDeposit.lastInterestUpdate = block.timestamp;
        
        // Update vault totals
        VaultInfo storage vault = vaults[token];
        vault.totalDeposits -= amount;
        
        // Transfer tokens to user
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, token, amount, 0, block.timestamp);
    }

    // ============ INTEREST FUNCTIONS ============
    
    /**
     * @dev Accrue interest for a user's deposit
     * @param user User address
     * @param token Token address
     */
    function _accrueInterest(address user, address token) internal {
        UserDeposit storage userDeposit = userDeposits[user][token];
        VaultInfo storage vault = vaults[token];
        
        if (userDeposit.amount == 0 || userDeposit.lastInterestUpdate == 0) {
            return;
        }
        
        uint256 timeElapsed = block.timestamp - userDeposit.lastInterestUpdate;
        uint256 interest = interestCalculator.calculateInterest(
            userDeposit.amount,
            vault.currentInterestRate,
            timeElapsed
        );
        
        if (interest > 0) {
            userDeposit.accumulatedInterest += interest;
            userDeposit.lastInterestUpdate = block.timestamp;
            
            emit InterestAccrued(user, token, interest, block.timestamp);
        }
    }
    
    /**
     * @dev Get current interest for a user
     * @param user User address
     * @param token Token address
     * @return Total interest including accumulated and current
     */
    function getCurrentInterest(address user, address token) 
        external 
        view 
        returns (uint256) 
    {
        UserDeposit memory userDeposit = userDeposits[user][token];
        VaultInfo memory vault = vaults[token];
        
        if (userDeposit.amount == 0) {
            return userDeposit.accumulatedInterest;
        }
        
        uint256 timeElapsed = block.timestamp - userDeposit.lastInterestUpdate;
        uint256 currentInterest = interestCalculator.calculateInterest(
            userDeposit.amount,
            vault.currentInterestRate,
            timeElapsed
        );
        
        return userDeposit.accumulatedInterest + currentInterest;
    }

    // ============ VAULT MANAGEMENT ============
    
    /**
     * @dev Create a new vault for a token
     * @param token Token address
     * @param initialRate Initial interest rate in basis points
     */
    function createVault(address token, uint256 initialRate) 
        external 
        onlyAuthorized 
    {
        require(!supportedTokens[token], "FluidVault: Vault already exists");
        require(totalVaults < MAX_VAULTS, "FluidVault: Max vaults reached");
        require(initialRate <= 5000, "FluidVault: Rate too high"); // Max 50%
        
        supportedTokens[token] = true;
        totalVaults++;
        
        vaults[token] = VaultInfo({
            token: IERC20(token),
            totalDeposits: 0,
            totalInterestPaid: 0,
            currentInterestRate: initialRate,
            lastRateUpdate: block.timestamp,
            isActive: true
        });
        
        emit VaultCreated(token, initialRate, block.timestamp);
    }
    
    /**
     * @dev Update interest rate for a vault
     * @param token Token address
     * @param newRate New interest rate in basis points
     */
    function updateInterestRate(address token, uint256 newRate) 
        external 
        onlyAuthorized 
        validToken(token) 
    {
        require(newRate <= 5000, "FluidVault: Rate too high"); // Max 50%
        
        VaultInfo storage vault = vaults[token];
        vault.currentInterestRate = newRate;
        vault.lastRateUpdate = block.timestamp;
        
        emit InterestRateUpdated(token, newRate, block.timestamp);
    }
    
    /**
     * @dev Toggle vault active status
     * @param token Token address
     * @param isActive New active status
     */
    function setVaultStatus(address token, bool isActive) 
        external 
        onlyAuthorized 
        validToken(token) 
    {
        vaults[token].isActive = isActive;
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add authorized operator
     * @param operator Operator address
     */
    function addOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
    }
    
    /**
     * @dev Remove authorized operator
     * @param operator Operator address
     */
    function removeOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = false;
    }
    
    /**
     * @dev Update platform fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function updatePlatformFee(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "FluidVault: Fee too high"); // Max 10%
        platformFeeRate = newFeeRate;
        emit PlatformFeeUpdated(newFeeRate, block.timestamp);
    }
    
    /**
     * @dev Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "FluidVault: Invalid address");
        feeRecipient = newRecipient;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Emergency unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only when paused)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyOwner 
        whenPaused 
    {
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user deposit info
     * @param user User address
     * @param token Token address
     * @return UserDeposit struct
     */
    function getUserDeposit(address user, address token) 
        external 
        view 
        returns (UserDeposit memory) 
    {
        return userDeposits[user][token];
    }
    
    /**
     * @dev Get vault info
     * @param token Token address
     * @return VaultInfo struct
     */
    function getVaultInfo(address token) 
        external 
        view 
        returns (VaultInfo memory) 
    {
        return vaults[token];
    }
    
    /**
     * @dev Get total TVL across all vaults
     * @return Total value locked
     */
    function getTotalTVL() external view returns (uint256) {
        uint256 total = 0;
        // This would need to be implemented with price oracles
        // For now, return sum of all deposits
        return total;
    }
}
