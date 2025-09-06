# 🚀 FluidVault Somnia Testnet Deployment Guide

This guide will walk you through deploying FluidVault smart contracts to the Somnia testnet and connecting your frontend application.

## 📋 Prerequisites

Before starting the deployment, ensure you have:

1. **Node.js 18+** installed
2. **npm** or **yarn** package manager
3. **Git** for version control
4. **MetaMask** or compatible wallet
5. **Somnia testnet tokens** (STT) for gas fees
6. **Private key** of your deployment wallet

## 🔧 Setup Steps

### 1. Environment Configuration

Create your environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Somnia Testnet Configuration
PRIVATE_KEY=your_private_key_here_without_0x_prefix
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
SOMNIA_CHAIN_ID=50312

# Contract Addresses (will be filled after deployment)
FLUID_VAULT_ADDRESS=
INTEREST_CALCULATOR_ADDRESS=
GOVERNANCE_ADDRESS=

# Frontend Configuration
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
NEXT_PUBLIC_SOMNIA_CHAIN_ID=50312
NEXT_PUBLIC_CONTRACT_ADDRESS=

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# API Keys (optional)
SOMNIA_API_KEY=your_somnia_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Get Somnia Testnet Tokens

You'll need STT (Somnia Test Token) for gas fees:

1. **Add Somnia Testnet to MetaMask:**
   - Network Name: `Somnia Testnet`
   - RPC URL: `https://dream-rpc.somnia.network/`
   - Chain ID: `50312`
   - Currency Symbol: `STT`
   - Block Explorer: `https://shannon-explorer.somnia.network/`

2. **Get Test Tokens:**
   - Join the [Somnia Discord](https://discord.gg/somnia)
   - Request test tokens in the faucet channel
   - Or use the official faucet if available

### 4. Compile Smart Contracts

```bash
npm run compile
```

This will compile all contracts and generate artifacts in the `artifacts/` directory.

### 5. Run Tests (Optional but Recommended)

```bash
npm run test
```

## 🚀 Deployment Process

### Deploy to Somnia Testnet

```bash
npm run deploy:testnet
```

This command will:

1. **Deploy InterestCalculator contract**
2. **Deploy Governance contract**
3. **Deploy FluidVault contract**
4. **Create initial vaults** for USDC, USDT, and DAI
5. **Set up governance permissions**
6. **Save deployment information** to `deployments/somnia-testnet.json`
7. **Update .env.local** with contract addresses

### Expected Output

```
🚀 Starting FluidVault deployment...
Deploying contracts with account: 0x1234...5678
Account balance: 1000000000000000000

📊 Deploying InterestCalculator...
InterestCalculator deployed to: 0xABC123...DEF456

🗳️ Deploying Governance...
Governance deployed to: 0xDEF456...GHI789

🏦 Deploying FluidVault...
FluidVault deployed to: 0xGHI789...JKL012

💰 Creating initial vaults...
Creating vault for USDC...
✅ USDC vault created with 5% APY
Creating vault for USDT...
✅ USDT vault created with 4.5% APY
Creating vault for DAI...
✅ DAI vault created with 4% APY

🔐 Setting up governance permissions...
✅ Governance permissions set up

📄 Deployment info saved to: deployments/somnia-testnet.json
📄 Environment file created: .env.local

🎉 Deployment completed successfully!

📋 Contract Addresses:
FluidVault: 0xGHI789...JKL012
InterestCalculator: 0xABC123...DEF456
Governance: 0xDEF456...GHI789
```

## 🔍 Verification

### 1. Verify Contracts on Block Explorer

Visit [Shannon Explorer](https://shannon-explorer.somnia.network/) and search for your contract addresses to verify they were deployed successfully.

### 2. Test Frontend Connection

Start your frontend application:

```bash
npm run dev
```

Visit `http://localhost:3000` and:

1. **Connect your wallet** using RainbowKit
2. **Switch to Somnia testnet** using the NetworkHelper component
3. **Test deposit/withdraw functionality** with the deployed contracts

### 3. Verify Contract Functions

You can interact with your deployed contracts using:

- **Block Explorer**: Direct contract interaction
- **Frontend Application**: Full UI testing
- **Hardhat Console**: Command-line interaction

```bash
npx hardhat console --network somnia-testnet
```

## 📊 Post-Deployment Configuration

### 1. Update Frontend Configuration

After deployment, your `.env.local` file will be automatically updated with contract addresses. The frontend will use these addresses to interact with your deployed contracts.

### 2. Create Governance Proposals

Use the deployed governance contract to:

- Update interest rates
- Add new token vaults
- Modify platform parameters
- Manage access controls

### 3. Monitor Contract Activity

Track your contracts using:

- **Block Explorer**: Transaction history and contract interactions
- **Event Logs**: Monitor deposits, withdrawals, and governance events
- **Analytics**: Track TVL, user activity, and performance metrics

## 🔧 Troubleshooting

### Common Issues

1. **Insufficient Gas Fees**
   - Ensure you have enough STT tokens
   - Check gas price settings in hardhat.config.js

2. **Network Connection Issues**
   - Verify RPC URL is correct: `https://dream-rpc.somnia.network/`
   - Check Chain ID: `50312`

3. **Contract Deployment Failures**
   - Check private key format (no 0x prefix)
   - Ensure sufficient account balance
   - Verify contract compilation

4. **Frontend Connection Issues**
   - Update contract addresses in .env.local
   - Restart development server
   - Clear browser cache

### Getting Help

- **Discord**: Join [Somnia Discord](https://discord.gg/somnia) for support
- **Documentation**: Check [Somnia Docs](https://docs.somnia.network/)
- **GitHub Issues**: Report bugs in the repository

## 📈 Next Steps

After successful deployment:

1. **Test all functionality** thoroughly
2. **Create governance proposals** for parameter updates
3. **Add more token vaults** as needed
4. **Monitor performance** and user activity
5. **Plan for mainnet deployment**

## 🔗 Useful Links

- **Somnia Network**: https://somnia.network/
- **Shannon Explorer**: https://shannon-explorer.somnia.network/
- **Somnia Discord**: https://discord.gg/somnia
- **FluidVault Repository**: https://github.com/your-username/fluidvault

---

**Happy Deploying! 🎉**

For questions or support, reach out to the Somnia community or create an issue in the repository.
