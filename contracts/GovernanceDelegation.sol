// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GovernanceDelegation
 * @dev Handles delegation of voting power in the FluidVault governance system
 * @author FluidVault Team
 */
contract GovernanceDelegation is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event DelegationCreated(address indexed delegator, address indexed delegate, uint256 amount);
    event DelegationUpdated(address indexed delegator, address indexed delegate, uint256 oldAmount, uint256 newAmount);
    event DelegationRemoved(address indexed delegator, address indexed delegate, uint256 amount);
    event DelegateRegistered(address indexed delegate, string name, string description);
    event DelegateUnregistered(address indexed delegate);
    
    // Structs
    struct Delegation {
        address delegate;
        uint256 amount;
        uint256 timestamp;
        bool active;
    }
    
    struct DelegateInfo {
        string name;
        string description;
        uint256 totalDelegated;
        uint256 delegatorCount;
        bool registered;
        uint256 registrationTime;
    }
    
    // State variables
    mapping(address => Delegation) public delegations; // delegator => delegation info
    mapping(address => DelegateInfo) public delegateInfo; // delegate => delegate info
    mapping(address => uint256) public totalDelegatedTo; // delegate => total delegated amount
    mapping(address => uint256) public totalDelegatedFrom; // delegator => total delegated amount
    
    address[] public registeredDelegates;
    mapping(address => bool) public isRegisteredDelegate;
    
    uint256 public constant MIN_DELEGATION = 1000 * 10**18; // Minimum 1000 tokens to delegate
    uint256 public constant MAX_DELEGATION_PERCENTAGE = 100; // 100% of balance can be delegated
    
    // External token contract (FluidVault token)
    address public immutable tokenContract;
    
    constructor(address _tokenContract) {
        require(_tokenContract != address(0), "Invalid token contract");
        tokenContract = _tokenContract;
    }
    
    /**
     * @dev Delegate voting power to another address
     * @param delegateAddress The address to delegate voting power to
     * @param amount The amount of tokens to delegate
     */
    function delegate(address delegateAddress, uint256 amount) external nonReentrant whenNotPaused {
        require(delegateAddress != address(0), "Invalid delegate address");
        require(delegateAddress != msg.sender, "Cannot delegate to self");
        require(amount >= MIN_DELEGATION, "Amount below minimum delegation");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check if delegate is registered (optional but recommended)
        require(delegateInfo[delegateAddress].registered || amount <= 10000 * 10**18, "Delegate not registered for large amounts");
        
        // Get current delegation
        Delegation storage currentDelegation = delegations[msg.sender];
        
        // Calculate new total delegation amount
        uint256 newTotalDelegated = totalDelegatedFrom[msg.sender] - currentDelegation.amount + amount;
        
        // Check delegation limits
        require(newTotalDelegated <= getMaxDelegationAmount(msg.sender), "Exceeds maximum delegation percentage");
        
        // Update delegate totals
        if (currentDelegation.active) {
            totalDelegatedTo[currentDelegation.delegate] -= currentDelegation.amount;
            delegateInfo[currentDelegation.delegate].totalDelegated -= currentDelegation.amount;
            if (currentDelegation.delegate != delegateAddress) {
                delegateInfo[currentDelegation.delegate].delegatorCount--;
            }
        }
        
        // Update new delegation
        totalDelegatedTo[delegateAddress] += amount;
        totalDelegatedFrom[msg.sender] = newTotalDelegated;
        delegateInfo[delegateAddress].totalDelegated += amount;
        
        if (!currentDelegation.active || currentDelegation.delegate != delegateAddress) {
            delegateInfo[delegateAddress].delegatorCount++;
        }
        
        // Update delegation record
        delegations[msg.sender] = Delegation({
            delegate: delegateAddress,
            amount: amount,
            timestamp: block.timestamp,
            active: true
        });
        
        if (currentDelegation.active && currentDelegation.delegate != delegateAddress) {
            emit DelegationUpdated(msg.sender, delegateAddress, currentDelegation.amount, amount);
        } else {
            emit DelegationCreated(msg.sender, delegateAddress, amount);
        }
    }
    
    /**
     * @dev Remove delegation
     */
    function undelegate() external nonReentrant whenNotPaused {
        Delegation storage delegation = delegations[msg.sender];
        require(delegation.active, "No active delegation");
        
        address delegateAddress = delegation.delegate;
        uint256 amount = delegation.amount;
        
        // Update totals
        totalDelegatedTo[delegateAddress] -= amount;
        totalDelegatedFrom[msg.sender] -= amount;
        delegateInfo[delegateAddress].totalDelegated -= amount;
        delegateInfo[delegateAddress].delegatorCount--;
        
        // Remove delegation
        delegation.active = false;
        delegation.amount = 0;
        delegation.delegate = address(0);
        
        emit DelegationRemoved(msg.sender, delegateAddress, amount);
    }
    
    /**
     * @dev Register as a delegate
     * @param name The delegate's name
     * @param description Description of the delegate's governance philosophy
     */
    function registerDelegate(string calldata name, string calldata description) external {
        require(!delegateInfo[msg.sender].registered, "Already registered");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        delegateInfo[msg.sender] = DelegateInfo({
            name: name,
            description: description,
            totalDelegated: 0,
            delegatorCount: 0,
            registered: true,
            registrationTime: block.timestamp
        });
        
        registeredDelegates.push(msg.sender);
        isRegisteredDelegate[msg.sender] = true;
        
        emit DelegateRegistered(msg.sender, name, description);
    }
    
    /**
     * @dev Unregister as a delegate
     */
    function unregisterDelegate() external {
        require(delegateInfo[msg.sender].registered, "Not registered");
        require(totalDelegatedTo[msg.sender] == 0, "Cannot unregister with active delegations");
        
        delegateInfo[msg.sender].registered = false;
        isRegisteredDelegate[msg.sender] = false;
        
        // Remove from registered delegates array
        for (uint256 i = 0; i < registeredDelegates.length; i++) {
            if (registeredDelegates[i] == msg.sender) {
                registeredDelegates[i] = registeredDelegates[registeredDelegates.length - 1];
                registeredDelegates.pop();
                break;
            }
        }
        
        emit DelegateUnregistered(msg.sender);
    }
    
    /**
     * @dev Get the effective voting power for an address (own tokens + delegated to them)
     * @param account The address to check
     * @return The total voting power
     */
    function getVotingPower(address account) external view returns (uint256) {
        // This would need to integrate with the actual token contract
        // For now, return the total delegated to this address
        return totalDelegatedTo[account];
    }
    
    /**
     * @dev Get delegation information for an address
     * @param delegator The delegator address
     * @return The delegation information
     */
    function getDelegation(address delegator) external view returns (Delegation memory) {
        return delegations[delegator];
    }
    
    /**
     * @dev Get delegate information
     * @param delegateAddress The delegate address
     * @return The delegate information
     */
    function getDelegateInfo(address delegateAddress) external view returns (DelegateInfo memory) {
        return delegateInfo[delegateAddress];
    }
    
    /**
     * @dev Get all registered delegates
     * @return Array of delegate addresses
     */
    function getRegisteredDelegates() external view returns (address[] memory) {
        return registeredDelegates;
    }
    
    /**
     * @dev Get delegates with pagination
     * @param offset Starting index
     * @param limit Maximum number of delegates to return
     * @return Array of delegate addresses
     */
    function getDelegatesPaginated(uint256 offset, uint256 limit) external view returns (address[] memory) {
        require(offset < registeredDelegates.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > registeredDelegates.length) {
            end = registeredDelegates.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = registeredDelegates[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get maximum delegation amount for an address
     * @param account The address to check
     * @return Maximum amount that can be delegated
     */
    function getMaxDelegationAmount(address account) public view returns (uint256) {
        // This would need to integrate with the actual token contract to get balance
        // For now, return a reasonable default
        return 1000000 * 10**18; // 1M tokens max
    }
    
    /**
     * @dev Get delegation statistics
     * @return totalDelegations Total number of active delegations
     * @return totalDelegated Total amount delegated across all delegations
     * @return registeredDelegateCount Number of registered delegates
     */
    function getDelegationStats() external view returns (uint256 totalDelegations, uint256 totalDelegated, uint256 registeredDelegateCount) {
        totalDelegated = 0;
        totalDelegations = 0;
        
        for (uint256 i = 0; i < registeredDelegates.length; i++) {
            address delegateAddress = registeredDelegates[i];
            totalDelegated += totalDelegatedTo[delegateAddress];
            totalDelegations += delegateInfo[delegateAddress].delegatorCount;
        }
        
        registeredDelegateCount = registeredDelegates.length;
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
     * @dev Update minimum delegation amount
     * @param newMinDelegation New minimum delegation amount
     */
    function updateMinDelegation(uint256 newMinDelegation) external onlyOwner {
        require(newMinDelegation > 0, "Invalid minimum delegation");
        // Note: This would need to be implemented as a state variable update
    }
}
