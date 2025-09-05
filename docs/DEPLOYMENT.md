# FluidVault Deployment Guide

## Prerequisites

Before deploying FluidVault, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- A wallet with Somnia testnet tokens
- Access to Somnia testnet RPC

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fluidvault.git
cd fluidvault
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Somnia Testnet Configuration
PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://testnet-rpc.somnia.network
SOMNIA_CHAIN_ID=1946

# Contract Addresses (filled after deployment)
FLUID_VAULT_ADDRESS=
INTEREST_CALCULATOR_ADDRESS=
GOVERNANCE_ADDRESS=

# Frontend Configuration
NEXT_PUBLIC_SOMNIA_RPC_URL=https://testnet-rpc.somnia.network
NEXT_PUBLIC_SOMNIA_CHAIN_ID=1946
NEXT_PUBLIC_CONTRACT_ADDRESS=

# API Keys
SOMNIA_API_KEY=your_somnia_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Smart Contract Deployment

### 1. Compile Contracts

```bash
npm run compile
```

### 2. Run Tests

```bash
npm run test
```

### 3. Deploy to Somnia Testnet

```bash
npm run deploy:testnet
```

The deployment script will:
- Deploy InterestCalculator contract
- Deploy Governance contract
- Deploy FluidVault contract
- Create initial vaults for testing
- Set up governance permissions
- Save deployment information

### 4. Verify Contracts (Optional)

If contract verification is available:

```bash
npm run verify
```

## Frontend Deployment

### 1. Update Environment Variables

After contract deployment, update your `.env.local` with the deployed contract addresses.

### 2. Build the Application

```bash
npm run build
```

### 3. Start Production Server

```bash
npm run start
```

### 4. Deploy to Hosting Service

#### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

#### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `out` folder to Netlify

#### Other Hosting Services

The built application can be deployed to any static hosting service that supports Next.js.

## Post-Deployment Setup

### 1. Verify Deployment

- Check that all contracts are deployed correctly
- Verify contract addresses in the frontend
- Test basic functionality (connect wallet, view vaults)

### 2. Create Initial Vaults

If not created during deployment, create vaults for supported tokens:

```javascript
// Example: Create USDC vault with 5% APY
await fluidVault.createVault(usdcAddress, 500);
```

### 3. Set Up Governance

- Add initial governance participants
- Create first governance proposals
- Set up voting mechanisms

### 4. Monitor and Maintain

- Monitor contract events
- Track user interactions
- Update interest rates as needed
- Handle governance proposals

## Network Configuration

### Somnia Testnet Details

- **Chain ID**: 1946
- **RPC URL**: https://testnet-rpc.somnia.network
- **Explorer**: https://testnet-explorer.somnia.network
- **Native Token**: SOM
- **Block Time**: Sub-second finality

### Adding Network to Wallet

Users need to add Somnia testnet to their wallets:

```json
{
  "chainId": "0x79A",
  "chainName": "Somnia Testnet",
  "rpcUrls": ["https://testnet-rpc.somnia.network"],
  "nativeCurrency": {
    "name": "Somnia",
    "symbol": "SOM",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://testnet-explorer.somnia.network"]
}
```

## Troubleshooting

### Common Issues

#### 1. Deployment Fails

- Check private key configuration
- Verify RPC URL is accessible
- Ensure sufficient gas fees
- Check network connectivity

#### 2. Frontend Connection Issues

- Verify contract addresses
- Check network configuration
- Ensure wallet is connected to correct network
- Clear browser cache

#### 3. Transaction Failures

- Check gas limits
- Verify token approvals
- Ensure sufficient token balance
- Check contract state

### Debug Commands

```bash
# Check contract deployment
npx hardhat run scripts/deploy.js --network somnia-testnet --verbose

# Verify contract state
npx hardhat console --network somnia-testnet

# Check transaction details
npx hardhat verify --network somnia-testnet <contract-address>
```

## Security Considerations

### Pre-Deployment

- Audit smart contracts
- Test thoroughly on testnet
- Verify all configurations
- Check access controls

### Post-Deployment

- Monitor contract events
- Track unusual activity
- Regular security reviews
- Update dependencies

## Maintenance

### Regular Tasks

- Update interest rates
- Process governance proposals
- Monitor system performance
- Update documentation

### Emergency Procedures

- Pause contracts if needed
- Execute emergency withdrawals
- Update governance parameters
- Communicate with users

## Support

For deployment issues:

- Check the documentation
- Review error logs
- Contact the development team
- Join the community Discord

## Next Steps

After successful deployment:

1. Create user documentation
2. Set up monitoring tools
3. Plan marketing strategy
4. Prepare for mainnet launch
