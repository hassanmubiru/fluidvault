// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CrossChainBridge
 * @dev Cross-chain bridge for multi-chain asset transfers
 * @notice Enables seamless asset transfers between supported blockchain networks
 */
contract CrossChainBridge is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct ChainInfo {
        uint256 chainId;
        string name;
        bool isActive;
        address bridgeContract;
        uint256 minTransfer;
        uint256 maxTransfer;
        uint256 bridgeFee; // Basis points
    }
    
    struct BridgeRequest {
        uint256 requestId;
        address user;
        uint256 sourceChainId;
        uint256 targetChainId;
        address token;
        uint256 amount;
        address recipient;
        uint256 timestamp;
        BridgeStatus status;
        bytes32 txHash;
        uint256 nonce;
    }
    
    struct SupportedToken {
        address tokenAddress;
        string symbol;
        uint256 decimals;
        bool isActive;
        mapping(uint256 => address) chainMappings; // chainId => token address
    }

    // ============ ENUMS ============
    
    enum BridgeStatus {
        Pending,
        Confirmed,
        Executed,
        Failed,
        Cancelled
    }

    // ============ STATE VARIABLES ============
    
    mapping(uint256 => ChainInfo) public supportedChains;
    mapping(uint256 => BridgeRequest) public bridgeRequests;
    mapping(address => SupportedToken) public supportedTokens;
    mapping(bytes32 => bool) public processedTransactions;
    mapping(address => bool) public authorizedRelayers;
    
    uint256 public requestCount;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_BRIDGE_FEE = 500; // 5%
    
    address public feeRecipient;
    uint256 public platformFeeRate = 50; // 0.5%
    
    // ============ EVENTS ============
    
    event ChainAdded(
        uint256 indexed chainId,
        string name,
        address bridgeContract,
        uint256 minTransfer,
        uint256 maxTransfer
    );
    
    event ChainUpdated(
        uint256 indexed chainId,
        bool isActive,
        uint256 bridgeFee
    );
    
    event TokenSupported(
        address indexed token,
        string symbol,
        uint256 decimals
    );
    
    event TokenMappingUpdated(
        address indexed token,
        uint256 indexed chainId,
        address mappedToken
    );
    
    event BridgeRequested(
        uint256 indexed requestId,
        address indexed user,
        uint256 sourceChainId,
        uint256 targetChainId,
        address token,
        uint256 amount,
        address recipient
    );
    
    event BridgeConfirmed(
        uint256 indexed requestId,
        bytes32 indexed txHash,
        uint256 timestamp
    );
    
    event BridgeExecuted(
        uint256 indexed requestId,
        address indexed user,
        uint256 amount,
        uint256 fee
    );
    
    event BridgeFailed(
        uint256 indexed requestId,
        string reason
    );
    
    event RelayerAuthorized(
        address indexed relayer,
        bool authorized
    );

    // ============ MODIFIERS ============
    
    modifier onlyAuthorizedRelayer() {
        require(
            authorizedRelayers[msg.sender] || msg.sender == owner(),
            "CrossChainBridge: Not authorized relayer"
        );
        _;
    }
    
    modifier validChain(uint256 chainId) {
        require(supportedChains[chainId].isActive, "CrossChainBridge: Chain not supported");
        _;
    }
    
    modifier validRequest(uint256 requestId) {
        require(requestId < requestCount, "CrossChainBridge: Invalid request ID");
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
        authorizedRelayers[msg.sender] = true;
    }

    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add a supported chain
     * @param chainId Chain ID
     * @param name Chain name
     * @param bridgeContract Bridge contract address on target chain
     * @param minTransfer Minimum transfer amount
     * @param maxTransfer Maximum transfer amount
     * @param bridgeFee Bridge fee in basis points
     */
    function addSupportedChain(
        uint256 chainId,
        string memory name,
        address bridgeContract,
        uint256 minTransfer,
        uint256 maxTransfer,
        uint256 bridgeFee
    ) external onlyOwner {
        require(bridgeFee <= MAX_BRIDGE_FEE, "CrossChainBridge: Bridge fee too high");
        require(minTransfer > 0, "CrossChainBridge: Invalid min transfer");
        require(maxTransfer >= minTransfer, "CrossChainBridge: Invalid max transfer");
        
        supportedChains[chainId] = ChainInfo({
            chainId: chainId,
            name: name,
            isActive: true,
            bridgeContract: bridgeContract,
            minTransfer: minTransfer,
            maxTransfer: maxTransfer,
            bridgeFee: bridgeFee
        });
        
        emit ChainAdded(chainId, name, bridgeContract, minTransfer, maxTransfer);
    }
    
    /**
     * @dev Update chain status and fees
     * @param chainId Chain ID
     * @param isActive Active status
     * @param bridgeFee New bridge fee
     */
    function updateChain(
        uint256 chainId,
        bool isActive,
        uint256 bridgeFee
    ) external onlyOwner {
        require(supportedChains[chainId].chainId != 0, "CrossChainBridge: Chain not found");
        require(bridgeFee <= MAX_BRIDGE_FEE, "CrossChainBridge: Bridge fee too high");
        
        supportedChains[chainId].isActive = isActive;
        supportedChains[chainId].bridgeFee = bridgeFee;
        
        emit ChainUpdated(chainId, isActive, bridgeFee);
    }
    
    /**
     * @dev Add supported token
     * @param token Token address
     * @param symbol Token symbol
     * @param decimals Token decimals
     */
    function addSupportedToken(
        address token,
        string memory symbol,
        uint256 decimals
    ) external onlyOwner {
        supportedTokens[token].tokenAddress = token;
        supportedTokens[token].symbol = symbol;
        supportedTokens[token].decimals = decimals;
        supportedTokens[token].isActive = true;
        
        emit TokenSupported(token, symbol, decimals);
    }
    
    /**
     * @dev Update token mapping for a chain
     * @param token Source token address
     * @param chainId Target chain ID
     * @param mappedToken Mapped token address on target chain
     */
    function updateTokenMapping(
        address token,
        uint256 chainId,
        address mappedToken
    ) external onlyOwner {
        require(supportedTokens[token].isActive, "CrossChainBridge: Token not supported");
        require(supportedChains[chainId].isActive, "CrossChainBridge: Chain not supported");
        
        supportedTokens[token].chainMappings[chainId] = mappedToken;
        
        emit TokenMappingUpdated(token, chainId, mappedToken);
    }
    
    /**
     * @dev Authorize or deauthorize a relayer
     * @param relayer Relayer address
     * @param authorized Authorization status
     */
    function setAuthorizedRelayer(address relayer, bool authorized) external onlyOwner {
        authorizedRelayers[relayer] = authorized;
        emit RelayerAuthorized(relayer, authorized);
    }
    
    /**
     * @dev Update platform fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function updatePlatformFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 200, "CrossChainBridge: Fee rate too high"); // Max 2%
        platformFeeRate = newFeeRate;
    }
    
    /**
     * @dev Update fee recipient
     * @param newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "CrossChainBridge: Invalid address");
        feeRecipient = newFeeRecipient;
    }

    // ============ USER FUNCTIONS ============
    
    /**
     * @dev Initiate cross-chain transfer
     * @param targetChainId Target chain ID
     * @param token Token address
     * @param amount Transfer amount
     * @param recipient Recipient address on target chain
     */
    function initiateBridge(
        uint256 targetChainId,
        address token,
        uint256 amount,
        address recipient
    ) external nonReentrant validChain(targetChainId) {
        require(supportedTokens[token].isActive, "CrossChainBridge: Token not supported");
        require(amount >= supportedChains[targetChainId].minTransfer, "CrossChainBridge: Below minimum transfer");
        require(amount <= supportedChains[targetChainId].maxTransfer, "CrossChainBridge: Above maximum transfer");
        require(recipient != address(0), "CrossChainBridge: Invalid recipient");
        
        // Calculate fees
        uint256 bridgeFee = (amount * supportedChains[targetChainId].bridgeFee) / BASIS_POINTS;
        uint256 platformFee = (amount * platformFeeRate) / BASIS_POINTS;
        uint256 totalFee = bridgeFee + platformFee;
        uint256 transferAmount = amount - totalFee;
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Create bridge request
        uint256 requestId = requestCount;
        bridgeRequests[requestId] = BridgeRequest({
            requestId: requestId,
            user: msg.sender,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            token: token,
            amount: transferAmount,
            recipient: recipient,
            timestamp: block.timestamp,
            status: BridgeStatus.Pending,
            txHash: bytes32(0),
            nonce: uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp, requestId)))
        });
        
        requestCount++;
        
        // Transfer fees to fee recipient
        if (totalFee > 0) {
            IERC20(token).safeTransfer(feeRecipient, totalFee);
        }
        
        emit BridgeRequested(requestId, msg.sender, block.chainid, targetChainId, token, transferAmount, recipient);
    }
    
    /**
     * @dev Confirm bridge request (called by relayer)
     * @param requestId Request ID
     * @param txHash Transaction hash on target chain
     */
    function confirmBridge(
        uint256 requestId,
        bytes32 txHash
    ) external onlyAuthorizedRelayer validRequest(requestId) {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.Pending, "CrossChainBridge: Invalid request status");
        require(!processedTransactions[txHash], "CrossChainBridge: Transaction already processed");
        
        request.status = BridgeStatus.Confirmed;
        request.txHash = txHash;
        processedTransactions[txHash] = true;
        
        emit BridgeConfirmed(requestId, txHash, block.timestamp);
    }
    
    /**
     * @dev Execute bridge request (called by relayer after confirmation)
     * @param requestId Request ID
     */
    function executeBridge(
        uint256 requestId
    ) external onlyAuthorizedRelayer validRequest(requestId) {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.Confirmed, "CrossChainBridge: Request not confirmed");
        
        request.status = BridgeStatus.Executed;
        
        // In a real implementation, this would trigger the transfer on the target chain
        // For now, we'll just emit the event
        emit BridgeExecuted(requestId, request.user, request.amount, 0);
    }
    
    /**
     * @dev Mark bridge request as failed
     * @param requestId Request ID
     * @param reason Failure reason
     */
    function failBridge(
        uint256 requestId,
        string memory reason
    ) external onlyAuthorizedRelayer validRequest(requestId) {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.status == BridgeStatus.Pending || request.status == BridgeStatus.Confirmed, "CrossChainBridge: Invalid request status");
        
        request.status = BridgeStatus.Failed;
        
        // Refund tokens to user
        IERC20(request.token).safeTransfer(request.user, request.amount);
        
        emit BridgeFailed(requestId, reason);
    }
    
    /**
     * @dev Cancel bridge request (only by user)
     * @param requestId Request ID
     */
    function cancelBridge(
        uint256 requestId
    ) external validRequest(requestId) {
        BridgeRequest storage request = bridgeRequests[requestId];
        require(request.user == msg.sender, "CrossChainBridge: Not request owner");
        require(request.status == BridgeStatus.Pending, "CrossChainBridge: Cannot cancel confirmed request");
        
        request.status = BridgeStatus.Cancelled;
        
        // Refund tokens to user
        IERC20(request.token).safeTransfer(request.user, request.amount);
        
        emit BridgeFailed(requestId, "Cancelled by user");
    }

    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get chain information
     * @param chainId Chain ID
     * @return Chain information
     */
    function getChainInfo(uint256 chainId) external view returns (ChainInfo memory) {
        return supportedChains[chainId];
    }
    
    /**
     * @dev Get bridge request information
     * @param requestId Request ID
     * @return Bridge request information
     */
    function getBridgeRequest(uint256 requestId) external view returns (BridgeRequest memory) {
        return bridgeRequests[requestId];
    }
    
    /**
     * @dev Get supported token information
     * @param token Token address
     * @return Token symbol, decimals, and active status
     */
    function getSupportedToken(address token) external view returns (string memory, uint256, bool) {
        return (supportedTokens[token].symbol, supportedTokens[token].decimals, supportedTokens[token].isActive);
    }
    
    /**
     * @dev Get token mapping for a chain
     * @param token Source token address
     * @param chainId Target chain ID
     * @return Mapped token address
     */
    function getTokenMapping(address token, uint256 chainId) external view returns (address) {
        return supportedTokens[token].chainMappings[chainId];
    }
    
    /**
     * @dev Calculate bridge fees
     * @param targetChainId Target chain ID
     * @param amount Transfer amount
     * @return Bridge fee, platform fee, and total fee
     */
    function calculateFees(uint256 targetChainId, uint256 amount) external view returns (uint256, uint256, uint256) {
        uint256 bridgeFee = (amount * supportedChains[targetChainId].bridgeFee) / BASIS_POINTS;
        uint256 platformFee = (amount * platformFeeRate) / BASIS_POINTS;
        uint256 totalFee = bridgeFee + platformFee;
        
        return (bridgeFee, platformFee, totalFee);
    }
    
    /**
     * @dev Get user's bridge requests
     * @param user User address
     * @return Array of request IDs
     */
    function getUserBridgeRequests(address user) external view returns (uint256[] memory) {
        uint256[] memory userRequests = new uint256[](requestCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < requestCount; i++) {
            if (bridgeRequests[i].user == user) {
                userRequests[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userRequests[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get all supported chains
     * @return Array of chain IDs
     */
    function getSupportedChains() external view returns (uint256[] memory) {
        uint256[] memory chains = new uint256[](100); // Max 100 chains
        uint256 count = 0;
        
        for (uint256 i = 1; i <= 100; i++) {
            if (supportedChains[i].isActive) {
                chains[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = chains[i];
        }
        
        return result;
    }
}
