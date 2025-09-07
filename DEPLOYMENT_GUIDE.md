# 🚀 FluidVault Deployment Guide

This guide will walk you through deploying the FluidVault smart contracts to Somnia testnet and updating the frontend to use real contract interactions.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Somnia Testnet STT tokens** for gas fees
4. **Private key** with STT tokens for deployment
5. **WalletConnect Project ID** (optional, for enhanced wallet support)

## 🔧 Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```bash
# Private key for deployment (NEVER commit this to version control)
PRIVATE_KEY=your_private_key_here

# Somnia Testnet Configuration
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
SOMNIA_CHAIN_ID=50312

# WalletConnect Configuration (optional)
WALLETCONNECT_PROJECT_ID=your_project_id_here

# Somnia API Key (for contract verification)
SOMNIA_API_KEY=your_api_key_here
```

### 3. Get STT Tokens
- Visit the Somnia testnet faucet to get STT tokens
- Ensure your deployment account has at least 1 STT for gas fees

## 🏗️ Smart Contract Deployment

### 1. Compile Contracts
```bash
npx hardhat compile
```

### 2. Deploy to Somnia Testnet
```bash
npx hardhat run scripts/deploy.js --network somnia-testnet
```

### 3. Verify Contracts (Optional)
```bash
npx hardhat verify --network somnia-testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## 📄 Deployment Output

After successful deployment, you'll get:

```
🎉 Deployment completed successfully!

📋 Contract Addresses:
FluidVault: 0x...
InterestCalculator: 0x...
Governance: 0x...

📄 Deployment info saved to: deployments/somnia-testnet.json
📄 Environment file created: .env.local
```

## 🔄 Frontend Integration

### 1. Update Environment Variables
The deployment script automatically creates a `.env.local` file with the contract addresses. If you need to update manually:

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # FluidVault address
NEXT_PUBLIC_INTEREST_CALCULATOR_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_ADDRESS=0x...
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
NEXT_PUBLIC_SOMNIA_CHAIN_ID=50312
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 2. Restart Development Server
```bash
npm run dev
```

### 3. Test Contract Integration
- Connect your wallet to Somnia testnet
- Try depositing and withdrawing from vaults
- Verify transactions on Shannon Explorer

## 🧪 Testing

### 1. Run Contract Tests
```bash
npx hardhat test
```

### 2. Test Frontend Integration
- Open http://localhost:3000
- Connect wallet to Somnia testnet
- Test deposit/withdraw functionality
- Verify transactions on block explorer

## 🔍 Verification

### 1. Check Contract Deployment
Visit Shannon Explorer and search for your contract addresses:
- https://shannon-explorer.somnia.network/

### 2. Verify Contract Functions
- Check that vaults are created correctly
- Verify governance permissions are set
- Test interest calculation functions

## 🚨 Troubleshooting

### Common Issues:

1. **Insufficient Gas**
   - Ensure your account has enough STT tokens
   - Check gas price settings in hardhat.config.js

2. **Network Connection Issues**
   - Verify RPC URL is correct
   - Check network configuration

3. **Contract Verification Fails**
   - Ensure constructor arguments are correct
   - Check if Somnia API key is valid

4. **Frontend Not Connecting**
   - Verify contract addresses in .env.local
   - Check network configuration in _app.tsx
   - Ensure wallet is connected to Somnia testnet

## 📊 Post-Deployment

### 1. Monitor Contract Activity
- Set up monitoring for contract events
- Track vault deposits and withdrawals
- Monitor governance proposals

### 2. Update Documentation
- Update contract addresses in documentation
- Create user guides for vault interactions
- Document governance processes

### 3. Security Considerations
- Review contract permissions
- Set up multi-sig for governance
- Implement emergency pause mechanisms

## 🔗 Useful Links

- **Somnia Testnet**: https://dream-rpc.somnia.network/
- **Shannon Explorer**: https://shannon-explorer.somnia.network/
- **Hardhat Documentation**: https://hardhat.org/docs
- **Wagmi Documentation**: https://wagmi.sh/

## 📞 Support

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review contract logs and error messages
3. Verify network connectivity and gas settings
4. Consult the Somnia testnet documentation

---

**⚠️ Important Security Notes:**
- Never commit private keys to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet deployment
- Implement proper access controls and governance