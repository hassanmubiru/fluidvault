// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title GovernanceTimelock
 * @dev Implements timelock and execution queue for governance proposals
 * @author FluidVault Team
 */
contract GovernanceTimelock is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event ProposalScheduled(
        uint256 indexed proposalId,
        uint256 indexed eta,
        uint256 delay,
        string description
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        uint256 indexed eta,
        bool success
    );
    
    event ProposalCancelled(
        uint256 indexed proposalId,
        uint256 indexed eta
    );
    
    event EmergencyProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor,
        string reason
    );
    
    event DelayUpdated(uint256 oldDelay, uint256 newDelay);
    event EmergencyDelayUpdated(uint256 oldDelay, uint256 newDelay);
    
    // Structs
    struct QueuedProposal {
        uint256 proposalId;
        uint256 eta;
        bool executed;
        bool cancelled;
        string description;
        address proposer;
        uint256 timestamp;
    }
    
    struct EmergencyProposal {
        uint256 proposalId;
        address executor;
        string reason;
        uint256 timestamp;
        bool executed;
    }
    
    // State variables
    uint256 public constant MIN_DELAY = 1 hours;
    uint256 public constant MAX_DELAY = 30 days;
    uint256 public constant EMERGENCY_MIN_DELAY = 15 minutes;
    uint256 public constant EMERGENCY_MAX_DELAY = 2 hours;
    
    uint256 public delay = 2 days; // Default delay
    uint256 public emergencyDelay = 30 minutes; // Emergency delay
    
    mapping(uint256 => QueuedProposal) public queuedProposals;
    mapping(uint256 => EmergencyProposal) public emergencyProposals;
    
    uint256[] public queuedProposalIds;
    uint256 public nextEmergencyProposalId = 1;
    
    // External contracts
    address public immutable governanceContract;
    address public immutable votingContract;
    
    // Emergency executors (multisig or trusted addresses)
    mapping(address => bool) public emergencyExecutors;
    
    constructor(
        address _governanceContract,
        address _votingContract,
        uint256 _delay,
        uint256 _emergencyDelay
    ) {
        require(_governanceContract != address(0), "Invalid governance contract");
        require(_votingContract != address(0), "Invalid voting contract");
        require(_delay >= MIN_DELAY && _delay <= MAX_DELAY, "Invalid delay");
        require(_emergencyDelay >= EMERGENCY_MIN_DELAY && _emergencyDelay <= EMERGENCY_MAX_DELAY, "Invalid emergency delay");
        
        governanceContract = _governanceContract;
        votingContract = _votingContract;
        delay = _delay;
        emergencyDelay = _emergencyDelay;
        
        // Owner is automatically an emergency executor
        emergencyExecutors[msg.sender] = true;
    }
    
    /**
     * @dev Schedule a proposal for execution
     * @param proposalId The proposal ID
     * @param description Description of the proposal
     */
    function scheduleProposal(
        uint256 proposalId,
        string calldata description
    ) external nonReentrant whenNotPaused {
        require(msg.sender == governanceContract || msg.sender == votingContract, "Unauthorized");
        require(queuedProposals[proposalId].proposalId == 0, "Proposal already queued");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        uint256 eta = block.timestamp + delay;
        
        queuedProposals[proposalId] = QueuedProposal({
            proposalId: proposalId,
            eta: eta,
            executed: false,
            cancelled: false,
            description: description,
            proposer: msg.sender,
            timestamp: block.timestamp
        });
        
        queuedProposalIds.push(proposalId);
        
        emit ProposalScheduled(proposalId, eta, delay, description);
    }
    
    /**
     * @dev Execute a queued proposal
     * @param proposalId The proposal ID to execute
     */
    function executeProposal(uint256 proposalId) external nonReentrant whenNotPaused {
        QueuedProposal storage proposal = queuedProposals[proposalId];
        require(proposal.proposalId != 0, "Proposal not found");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal has been cancelled");
        require(block.timestamp >= proposal.eta, "Proposal not ready for execution");
        
        proposal.executed = true;
        
        // Here you would implement the actual proposal execution logic
        // This would typically involve calling functions on other contracts
        // For now, we'll just mark it as executed
        
        bool success = true; // This would be determined by the actual execution
        
        emit ProposalExecuted(proposalId, proposal.eta, success);
    }
    
    /**
     * @dev Cancel a queued proposal
     * @param proposalId The proposal ID to cancel
     */
    function cancelProposal(uint256 proposalId) external {
        QueuedProposal storage proposal = queuedProposals[proposalId];
        require(proposal.proposalId != 0, "Proposal not found");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal already cancelled");
        
        // Only the proposer or owner can cancel
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(proposalId, proposal.eta);
    }
    
    /**
     * @dev Execute an emergency proposal
     * @param proposalId The proposal ID
     * @param reason Reason for emergency execution
     */
    function executeEmergencyProposal(
        uint256 proposalId,
        string calldata reason
    ) external nonReentrant whenNotPaused {
        require(emergencyExecutors[msg.sender], "Not an emergency executor");
        require(bytes(reason).length > 0, "Reason cannot be empty");
        
        QueuedProposal storage proposal = queuedProposals[proposalId];
        require(proposal.proposalId != 0, "Proposal not found");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal has been cancelled");
        
        // Emergency proposals can be executed after emergency delay
        require(
            block.timestamp >= proposal.timestamp + emergencyDelay,
            "Emergency delay not met"
        );
        
        proposal.executed = true;
        
        // Record emergency execution
        uint256 emergencyId = nextEmergencyProposalId++;
        emergencyProposals[emergencyId] = EmergencyProposal({
            proposalId: proposalId,
            executor: msg.sender,
            reason: reason,
            timestamp: block.timestamp,
            executed: true
        });
        
        emit EmergencyProposalExecuted(proposalId, msg.sender, reason);
        emit ProposalExecuted(proposalId, proposal.eta, true);
    }
    
    /**
     * @dev Add an emergency executor
     * @param executor The address to add as emergency executor
     */
    function addEmergencyExecutor(address executor) external onlyOwner {
        require(executor != address(0), "Invalid executor address");
        require(!emergencyExecutors[executor], "Already an emergency executor");
        
        emergencyExecutors[executor] = true;
    }
    
    /**
     * @dev Remove an emergency executor
     * @param executor The address to remove as emergency executor
     */
    function removeEmergencyExecutor(address executor) external onlyOwner {
        require(emergencyExecutors[executor], "Not an emergency executor");
        require(executor != owner(), "Cannot remove owner as emergency executor");
        
        emergencyExecutors[executor] = false;
    }
    
    /**
     * @dev Update the execution delay
     * @param newDelay The new delay in seconds
     */
    function updateDelay(uint256 newDelay) external onlyOwner {
        require(newDelay >= MIN_DELAY && newDelay <= MAX_DELAY, "Invalid delay");
        require(newDelay != delay, "Delay unchanged");
        
        uint256 oldDelay = delay;
        delay = newDelay;
        
        emit DelayUpdated(oldDelay, newDelay);
    }
    
    /**
     * @dev Update the emergency delay
     * @param newEmergencyDelay The new emergency delay in seconds
     */
    function updateEmergencyDelay(uint256 newEmergencyDelay) external onlyOwner {
        require(
            newEmergencyDelay >= EMERGENCY_MIN_DELAY && newEmergencyDelay <= EMERGENCY_MAX_DELAY,
            "Invalid emergency delay"
        );
        require(newEmergencyDelay != emergencyDelay, "Emergency delay unchanged");
        
        uint256 oldEmergencyDelay = emergencyDelay;
        emergencyDelay = newEmergencyDelay;
        
        emit EmergencyDelayUpdated(oldEmergencyDelay, newEmergencyDelay);
    }
    
    /**
     * @dev Get queued proposal information
     * @param proposalId The proposal ID
     * @return The queued proposal information
     */
    function getQueuedProposal(uint256 proposalId) external view returns (QueuedProposal memory) {
        return queuedProposals[proposalId];
    }
    
    /**
     * @dev Get all queued proposal IDs
     * @return Array of queued proposal IDs
     */
    function getQueuedProposalIds() external view returns (uint256[] memory) {
        return queuedProposalIds;
    }
    
    /**
     * @dev Get queued proposals with pagination
     * @param offset Starting index
     * @param limit Maximum number of proposals to return
     * @return Array of queued proposal IDs
     */
    function getQueuedProposalsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        require(offset < queuedProposalIds.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > queuedProposalIds.length) {
            end = queuedProposalIds.length;
        }
        
        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = queuedProposalIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get emergency proposal information
     * @param emergencyId The emergency proposal ID
     * @return The emergency proposal information
     */
    function getEmergencyProposal(uint256 emergencyId) external view returns (EmergencyProposal memory) {
        return emergencyProposals[emergencyId];
    }
    
    /**
     * @dev Check if a proposal is ready for execution
     * @param proposalId The proposal ID
     * @return Whether the proposal is ready for execution
     */
    function isProposalReady(uint256 proposalId) external view returns (bool) {
        QueuedProposal storage proposal = queuedProposals[proposalId];
        return proposal.proposalId != 0 && 
               !proposal.executed && 
               !proposal.cancelled && 
               block.timestamp >= proposal.eta;
    }
    
    /**
     * @dev Get time until proposal can be executed
     * @param proposalId The proposal ID
     * @return Time in seconds until execution (0 if ready or not found)
     */
    function getTimeUntilExecution(uint256 proposalId) external view returns (uint256) {
        QueuedProposal storage proposal = queuedProposals[proposalId];
        
        if (proposal.proposalId == 0 || proposal.executed || proposal.cancelled) {
            return 0;
        }
        
        if (block.timestamp >= proposal.eta) {
            return 0;
        }
        
        return proposal.eta - block.timestamp;
    }
    
    /**
     * @dev Get timelock statistics
     * @return totalQueued Total number of queued proposals
     * @return totalExecuted Total number of executed proposals
     * @return totalCancelled Total number of cancelled proposals
     * @return totalEmergency Total number of emergency executions
     */
    function getTimelockStats() external view returns (
        uint256 totalQueued,
        uint256 totalExecuted,
        uint256 totalCancelled,
        uint256 totalEmergency
    ) {
        totalQueued = queuedProposalIds.length;
        totalExecuted = 0;
        totalCancelled = 0;
        totalEmergency = nextEmergencyProposalId - 1;
        
        for (uint256 i = 0; i < queuedProposalIds.length; i++) {
            QueuedProposal storage proposal = queuedProposals[queuedProposalIds[i]];
            if (proposal.executed) {
                totalExecuted++;
            } else if (proposal.cancelled) {
                totalCancelled++;
            }
        }
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
