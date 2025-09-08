// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AdvancedVoting
 * @dev Implements advanced voting mechanisms including quadratic and weighted voting
 * @author FluidVault Team
 */
contract AdvancedVoting is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint8 proposalType,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint8 votingType,
        uint256[] options,
        uint256[] weights,
        uint256 votingPower
    );
    
    event ProposalExecuted(uint256 indexed proposalId, bool success);
    event VotingPowerUpdated(address indexed voter, uint256 newPower);
    
    // Enums
    enum ProposalType {
        Standard,      // 0: Simple yes/no vote
        MultiOption,   // 1: Multiple choice vote
        Quadratic,     // 2: Quadratic voting
        Weighted,      // 3: Weighted voting
        Ranked         // 4: Ranked choice voting
    }
    
    enum VotingType {
        Standard,      // 0: Standard vote
        Quadratic,     // 1: Quadratic vote
        Weighted,      // 2: Weighted vote
        Ranked         // 3: Ranked vote
    }
    
    // Structs
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        uint256 startTime;
        uint256 endTime;
        uint256 executionTime;
        bool executed;
        bool cancelled;
        uint256 totalVotingPower;
        uint256 quorumRequired;
        uint256 minVotingPower;
    }
    
    struct Vote {
        address voter;
        VotingType votingType;
        uint256[] options;
        uint256[] weights;
        uint256 votingPower;
        uint256 timestamp;
    }
    
    struct VotingResult {
        uint256 totalVotes;
        uint256 totalVotingPower;
        mapping(uint256 => uint256) optionVotes;
        mapping(uint256 => uint256) optionVotingPower;
        mapping(address => bool) hasVoted;
    }
    
    // State variables
    uint256 public nextProposalId = 1;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => VotingResult) public votingResults;
    mapping(uint256 => Vote[]) public proposalVotes;
    mapping(address => uint256) public votingPower;
    mapping(address => uint256) public lastVotingPowerUpdate;
    
    uint256 public constant VOTING_DURATION = 3 days;
    uint256 public constant EXECUTION_DELAY = 1 days;
    uint256 public constant MIN_PROPOSAL_POWER = 10000 * 10**18; // Minimum tokens to create proposal
    uint256 public constant QUORUM_PERCENTAGE = 20; // 20% quorum required
    
    // External contracts
    address public immutable tokenContract;
    address public immutable delegationContract;
    
    constructor(address _tokenContract, address _delegationContract) {
        require(_tokenContract != address(0), "Invalid token contract");
        require(_delegationContract != address(0), "Invalid delegation contract");
        tokenContract = _tokenContract;
        delegationContract = _delegationContract;
    }
    
    /**
     * @dev Create a new proposal
     * @param title Proposal title
     * @param description Proposal description
     * @param proposalType Type of proposal (standard, multi-option, etc.)
     * @param quorumRequired Required quorum percentage (0-100)
     */
    function createProposal(
        string calldata title,
        string calldata description,
        ProposalType proposalType,
        uint256 quorumRequired
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(quorumRequired <= 100, "Invalid quorum percentage");
        require(getVotingPower(msg.sender) >= MIN_PROPOSAL_POWER, "Insufficient voting power to create proposal");
        
        uint256 proposalId = nextProposalId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + VOTING_DURATION;
        uint256 executionTime = endTime + EXECUTION_DELAY;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            proposalType: proposalType,
            startTime: startTime,
            endTime: endTime,
            executionTime: executionTime,
            executed: false,
            cancelled: false,
            totalVotingPower: 0,
            quorumRequired: quorumRequired,
            minVotingPower: MIN_PROPOSAL_POWER
        });
        
        emit ProposalCreated(proposalId, msg.sender, title, uint8(proposalType), startTime, endTime);
        
        return proposalId;
    }
    
    /**
     * @dev Cast a standard vote
     * @param proposalId The proposal ID
     * @param option The option to vote for (0 = against, 1 = for)
     */
    function voteStandard(uint256 proposalId, uint256 option) external nonReentrant whenNotPaused {
        require(option <= 1, "Invalid option for standard vote");
        uint256[] memory options = new uint256[](1);
        uint256[] memory weights = new uint256[](1);
        options[0] = option;
        weights[0] = 1;
        _castVote(proposalId, VotingType.Standard, options, weights);
    }
    
    /**
     * @dev Cast a multi-option vote
     * @param proposalId The proposal ID
     * @param option The option to vote for
     */
    function voteMultiOption(uint256 proposalId, uint256 option) external nonReentrant whenNotPaused {
        require(option > 0, "Invalid option for multi-option vote");
        uint256[] memory options = new uint256[](1);
        uint256[] memory weights = new uint256[](1);
        options[0] = option;
        weights[0] = 1;
        _castVote(proposalId, VotingType.Standard, options, weights);
    }
    
    /**
     * @dev Cast a quadratic vote
     * @param proposalId The proposal ID
     * @param options Array of options to vote for
     * @param weights Array of weights for each option (sum of squares must not exceed voting power)
     */
    function voteQuadratic(
        uint256 proposalId,
        uint256[] calldata options,
        uint256[] calldata weights
    ) external nonReentrant whenNotPaused {
        require(options.length == weights.length, "Options and weights length mismatch");
        require(options.length > 0, "Must vote for at least one option");
        
        uint256 totalWeightSquared = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            totalWeightSquared += weights[i] * weights[i];
        }
        
        uint256 userVotingPower = getVotingPower(msg.sender);
        require(totalWeightSquared <= userVotingPower, "Total weight squared exceeds voting power");
        
        _castVote(proposalId, VotingType.Quadratic, options, weights);
    }
    
    /**
     * @dev Cast a weighted vote
     * @param proposalId The proposal ID
     * @param options Array of options to vote for
     * @param weights Array of weights for each option (sum must not exceed voting power)
     */
    function voteWeighted(
        uint256 proposalId,
        uint256[] calldata options,
        uint256[] calldata weights
    ) external nonReentrant whenNotPaused {
        require(options.length == weights.length, "Options and weights length mismatch");
        require(options.length > 0, "Must vote for at least one option");
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
        }
        
        uint256 userVotingPower = getVotingPower(msg.sender);
        require(totalWeight <= userVotingPower, "Total weight exceeds voting power");
        
        _castVote(proposalId, VotingType.Weighted, options, weights);
    }
    
    /**
     * @dev Cast a ranked vote
     * @param proposalId The proposal ID
     * @param options Array of options in ranked order (first is highest preference)
     * @param weights Array of weights for each option
     */
    function voteRanked(
        uint256 proposalId,
        uint256[] calldata options,
        uint256[] calldata weights
    ) external nonReentrant whenNotPaused {
        require(options.length == weights.length, "Options and weights length mismatch");
        require(options.length > 0, "Must vote for at least one option");
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
        }
        
        uint256 userVotingPower = getVotingPower(msg.sender);
        require(totalWeight <= userVotingPower, "Total weight exceeds voting power");
        
        _castVote(proposalId, VotingType.Ranked, options, weights);
    }
    
    /**
     * @dev Internal function to cast a vote
     */
    function _castVote(
        uint256 proposalId,
        VotingType votingType,
        uint256[] memory options,
        uint256[] memory weights
    ) internal {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.startTime, "Voting has not started");
        require(block.timestamp <= proposal.endTime, "Voting has ended");
        require(!proposal.cancelled, "Proposal has been cancelled");
        require(!proposal.executed, "Proposal has been executed");
        
        VotingResult storage result = votingResults[proposalId];
        require(!result.hasVoted[msg.sender], "Already voted");
        
        uint256 userVotingPower = getVotingPower(msg.sender);
        require(userVotingPower > 0, "No voting power");
        
        // Record the vote
        Vote memory newVote = Vote({
            voter: msg.sender,
            votingType: votingType,
            options: options,
            weights: weights,
            votingPower: userVotingPower,
            timestamp: block.timestamp
        });
        
        proposalVotes[proposalId].push(newVote);
        result.hasVoted[msg.sender] = true;
        result.totalVotes++;
        result.totalVotingPower += userVotingPower;
        
        // Update option results
        for (uint256 i = 0; i < options.length; i++) {
            uint256 option = options[i];
            uint256 weight = weights[i];
            
            result.optionVotes[option]++;
            result.optionVotingPower[option] += weight;
        }
        
        emit VoteCast(msg.sender, proposalId, uint8(votingType), options, weights, userVotingPower);
    }
    
    /**
     * @dev Execute a proposal
     * @param proposalId The proposal ID to execute
     */
    function executeProposal(uint256 proposalId) external nonReentrant whenNotPaused {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(block.timestamp >= proposal.executionTime, "Execution time not reached");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal has been cancelled");
        
        VotingResult storage result = votingResults[proposalId];
        require(result.totalVotingPower > 0, "No votes cast");
        
        // Check quorum
        uint256 requiredQuorum = (proposal.quorumRequired * getTotalVotingPower()) / 100;
        require(result.totalVotingPower >= requiredQuorum, "Quorum not met");
        
        proposal.executed = true;
        
        // Here you would implement the actual proposal execution logic
        // For now, we'll just mark it as executed
        
        emit ProposalExecuted(proposalId, true);
    }
    
    /**
     * @dev Cancel a proposal (only proposer or owner)
     * @param proposalId The proposal ID to cancel
     */
    function cancelProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal already cancelled");
        
        proposal.cancelled = true;
    }
    
    /**
     * @dev Get voting power for an address
     * @param account The address to check
     * @return The voting power
     */
    function getVotingPower(address account) public view returns (uint256) {
        // This would integrate with the token contract and delegation contract
        // For now, return a mock value
        return 100000 * 10**18; // 100k tokens
    }
    
    /**
     * @dev Get total voting power across all holders
     * @return The total voting power
     */
    function getTotalVotingPower() public view returns (uint256) {
        // This would integrate with the token contract
        // For now, return a mock value
        return 10000000 * 10**18; // 10M tokens
    }
    
    /**
     * @dev Get proposal information
     * @param proposalId The proposal ID
     * @return The proposal information
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    /**
     * @dev Get voting results for a proposal
     * @param proposalId The proposal ID
     * @param option The option to get results for
     * @return votes Number of votes for this option
     * @return optionVotingPower Total voting power for this option
     */
    function getVotingResults(uint256 proposalId, uint256 option) external view returns (uint256 votes, uint256 optionVotingPower) {
        VotingResult storage result = votingResults[proposalId];
        return (result.optionVotes[option], result.optionVotingPower[option]);
    }
    
    /**
     * @dev Get all votes for a proposal
     * @param proposalId The proposal ID
     * @return Array of votes
     */
    function getProposalVotes(uint256 proposalId) external view returns (Vote[] memory) {
        return proposalVotes[proposalId];
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     * @param proposalId The proposal ID
     * @param voter The voter address
     * @return Whether the address has voted
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return votingResults[proposalId].hasVoted[voter];
    }
    
    /**
     * @dev Get proposal status
     * @param proposalId The proposal ID
     * @return status The current status of the proposal
     */
    function getProposalStatus(uint256 proposalId) external view returns (string memory status) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.id == 0) {
            return "Non-existent";
        }
        
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
        
        if (block.timestamp < proposal.executionTime) {
            return "Succeeded";
        }
        
        return "Ready for Execution";
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
