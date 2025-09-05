// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Governance
 * @dev On-chain governance system for FluidVault
 * @notice Enables community-driven decision making for platform parameters
 */
contract Governance is ReentrancyGuard, Ownable {
    
    // ============ STRUCTS ============
    
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
        ProposalType proposalType;
        bytes data; // Encoded function call data
    }
    
    struct Vote {
        bool hasVoted;
        bool support; // true = for, false = against
        uint256 weight;
    }
    
    enum ProposalType {
        INTEREST_RATE_UPDATE,
        PLATFORM_FEE_UPDATE,
        VAULT_CREATION,
        VAULT_DEACTIVATION,
        OPERATOR_MANAGEMENT,
        EMERGENCY_PAUSE,
        PARAMETER_UPDATE
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256) public votingPower;
    mapping(address => bool) public authorizedVoters;
    
    uint256 public proposalCount;
    uint256 public votingPeriod = 3 days;
    uint256 public executionDelay = 1 days;
    uint256 public quorumThreshold = 1000; // 10% in basis points
    uint256 public majorityThreshold = 5000; // 50% in basis points
    
    address public fluidVault;
    address public interestCalculator;
    
    // ============ EVENTS ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalType proposalType,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor
    );
    
    event ProposalCancelled(
        uint256 indexed proposalId,
        address indexed canceller
    );
    
    event VotingPowerUpdated(
        address indexed voter,
        uint256 newPower
    );
    
    event ParametersUpdated(
        uint256 votingPeriod,
        uint256 executionDelay,
        uint256 quorumThreshold,
        uint256 majorityThreshold
    );

    // ============ MODIFIERS ============
    
    modifier onlyFluidVault() {
        require(msg.sender == fluidVault, "Governance: Only FluidVault");
        _;
    }
    
    modifier validProposal(uint256 proposalId) {
        require(proposalId < proposalCount, "Governance: Invalid proposal");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        Proposal memory proposal = proposals[proposalId];
        require(
            block.timestamp >= proposal.startTime && 
            block.timestamp <= proposal.endTime,
            "Governance: Proposal not active"
        );
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor() {
        authorizedVoters[msg.sender] = true;
        votingPower[msg.sender] = 10000; // 100% initial voting power
    }

    // ============ PROPOSAL FUNCTIONS ============
    
    /**
     * @dev Create a new governance proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param proposalType Type of proposal
     * @param data Encoded function call data
     */
    function createProposal(
        string memory title,
        string memory description,
        ProposalType proposalType,
        bytes memory data
    ) external onlyAuthorizedVoter returns (uint256) {
        require(bytes(title).length > 0, "Governance: Empty title");
        require(bytes(description).length > 0, "Governance: Empty description");
        
        uint256 proposalId = proposalCount;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + votingPeriod;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            cancelled: false,
            proposalType: proposalType,
            data: data
        });
        
        proposalCount++;
        
        emit ProposalCreated(
            proposalId,
            msg.sender,
            title,
            proposalType,
            startTime,
            endTime
        );
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId Proposal ID
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) 
        external 
        validProposal(proposalId)
        proposalActive(proposalId)
        onlyAuthorizedVoter
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Governance: Proposal already executed");
        require(!proposal.cancelled, "Governance: Proposal cancelled");
        
        Vote storage userVote = votes[proposalId][msg.sender];
        require(!userVote.hasVoted, "Governance: Already voted");
        
        uint256 weight = votingPower[msg.sender];
        require(weight > 0, "Governance: No voting power");
        
        userVote.hasVoted = true;
        userVote.support = support;
        userVote.weight = weight;
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev Execute a successful proposal
     * @param proposalId Proposal ID
     */
    function executeProposal(uint256 proposalId) 
        external 
        validProposal(proposalId)
        nonReentrant
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Governance: Already executed");
        require(!proposal.cancelled, "Governance: Proposal cancelled");
        require(
            block.timestamp >= proposal.endTime + executionDelay,
            "Governance: Execution delay not met"
        );
        
        // Check if proposal passed
        require(_isProposalPassed(proposalId), "Governance: Proposal failed");
        
        proposal.executed = true;
        
        // Execute the proposal based on type
        _executeProposalData(proposal);
        
        emit ProposalExecuted(proposalId, msg.sender);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId Proposal ID
     */
    function cancelProposal(uint256 proposalId) 
        external 
        validProposal(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Governance: Not authorized to cancel"
        );
        require(!proposal.executed, "Governance: Already executed");
        require(!proposal.cancelled, "Governance: Already cancelled");
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(proposalId, msg.sender);
    }

    // ============ VOTING POWER MANAGEMENT ============
    
    /**
     * @dev Update voting power for a user
     * @param voter Voter address
     * @param newPower New voting power
     */
    function updateVotingPower(address voter, uint256 newPower) 
        external 
        onlyOwner 
    {
        require(newPower <= 10000, "Governance: Power too high"); // Max 100%
        votingPower[voter] = newPower;
        
        if (newPower > 0) {
            authorizedVoters[voter] = true;
        } else {
            authorizedVoters[voter] = false;
        }
        
        emit VotingPowerUpdated(voter, newPower);
    }
    
    /**
     * @dev Add authorized voter
     * @param voter Voter address
     * @param power Voting power
     */
    function addAuthorizedVoter(address voter, uint256 power) external onlyOwner {
        require(power > 0 && power <= 10000, "Governance: Invalid power");
        authorizedVoters[voter] = true;
        votingPower[voter] = power;
        
        emit VotingPowerUpdated(voter, power);
    }
    
    /**
     * @dev Remove authorized voter
     * @param voter Voter address
     */
    function removeAuthorizedVoter(address voter) external onlyOwner {
        authorizedVoters[voter] = false;
        votingPower[voter] = 0;
        
        emit VotingPowerUpdated(voter, 0);
    }

    // ============ PARAMETER UPDATES ============
    
    /**
     * @dev Update governance parameters
     * @param _votingPeriod New voting period
     * @param _executionDelay New execution delay
     * @param _quorumThreshold New quorum threshold
     * @param _majorityThreshold New majority threshold
     */
    function updateParameters(
        uint256 _votingPeriod,
        uint256 _executionDelay,
        uint256 _quorumThreshold,
        uint256 _majorityThreshold
    ) external onlyOwner {
        require(_votingPeriod >= 1 days, "Governance: Voting period too short");
        require(_executionDelay >= 1 hours, "Governance: Execution delay too short");
        require(_quorumThreshold <= 5000, "Governance: Quorum too high"); // Max 50%
        require(_majorityThreshold <= 10000, "Governance: Invalid majority");
        
        votingPeriod = _votingPeriod;
        executionDelay = _executionDelay;
        quorumThreshold = _quorumThreshold;
        majorityThreshold = _majorityThreshold;
        
        emit ParametersUpdated(
            _votingPeriod,
            _executionDelay,
            _quorumThreshold,
            _majorityThreshold
        );
    }

    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check if a proposal has passed
     * @param proposalId Proposal ID
     * @return True if proposal passed
     */
    function _isProposalPassed(uint256 proposalId) internal view returns (bool) {
        Proposal memory proposal = proposals[proposalId];
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 totalVotingPower = _getTotalVotingPower();
        
        // Check quorum
        if ((totalVotes * 10000) / totalVotingPower < quorumThreshold) {
            return false;
        }
        
        // Check majority
        if (proposal.forVotes <= proposal.againstVotes) {
            return false;
        }
        
        uint256 forPercentage = (proposal.forVotes * 10000) / totalVotes;
        return forPercentage >= majorityThreshold;
    }
    
    /**
     * @dev Execute proposal data
     * @param proposal Proposal to execute
     */
    function _executeProposalData(Proposal memory proposal) internal {
        // This would contain the actual execution logic
        // For now, it's a placeholder that would interact with FluidVault
        // based on the proposal type and data
        
        if (proposal.proposalType == ProposalType.INTEREST_RATE_UPDATE) {
            // Execute interest rate update
        } else if (proposal.proposalType == ProposalType.PLATFORM_FEE_UPDATE) {
            // Execute platform fee update
        } else if (proposal.proposalType == ProposalType.VAULT_CREATION) {
            // Execute vault creation
        }
        // Add more cases as needed
    }
    
    /**
     * @dev Get total voting power
     * @return Total voting power
     */
    function _getTotalVotingPower() internal view returns (uint256) {
        // This would typically sum up all voting power
        // For simplicity, returning a fixed value
        return 10000;
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get proposal details
     * @param proposalId Proposal ID
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        validProposal(proposalId)
        returns (Proposal memory) 
    {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get user's vote on a proposal
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return Vote struct
     */
    function getUserVote(uint256 proposalId, address voter) 
        external 
        view 
        validProposal(proposalId)
        returns (Vote memory) 
    {
        return votes[proposalId][voter];
    }
    
    /**
     * @dev Check if proposal has passed
     * @param proposalId Proposal ID
     * @return True if passed
     */
    function isProposalPassed(uint256 proposalId) 
        external 
        view 
        validProposal(proposalId)
        returns (bool) 
    {
        return _isProposalPassed(proposalId);
    }
    
    /**
     * @dev Get proposal state
     * @param proposalId Proposal ID
     * @return State string
     */
    function getProposalState(uint256 proposalId) 
        external 
        view 
        validProposal(proposalId)
        returns (string memory) 
    {
        Proposal memory proposal = proposals[proposalId];
        
        if (proposal.cancelled) {
            return "Cancelled";
        }
        
        if (proposal.executed) {
            return "Executed";
        }
        
        if (block.timestamp < proposal.startTime) {
            return "Pending";
        }
        
        if (block.timestamp <= proposal.endTime) {
            return "Active";
        }
        
        if (block.timestamp < proposal.endTime + executionDelay) {
            return "Succeeded";
        }
        
        if (_isProposalPassed(proposalId)) {
            return "Queued";
        }
        
        return "Defeated";
    }

    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedVoter() {
        require(authorizedVoters[msg.sender], "Governance: Not authorized voter");
        _;
    }
}
