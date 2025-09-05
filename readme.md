# FluidVault 🏦

> A cutting-edge decentralized savings platform leveraging Somnia Network's unparalleled blockchain capabilities

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.19-blue)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black)](https://nextjs.org/)
[![Somnia Network](https://img.shields.io/badge/Somnia-Testnet-00D4FF)](https://somnia.network/)

## 🌟 Overview

FluidVault is a revolutionary decentralized savings platform that harnesses Somnia Network's high TPS (over 1 million transactions per second) and sub-second transaction finality to enable real-time interest accrual and instant withdrawals. Built with EVM compatibility, it seamlessly integrates with existing DeFi protocols and tooling.

## ✨ Key Features

- **⚡ Instant Withdrawals**: Leverage Somnia's sub-second finality for gas-efficient, instant withdrawals
- **📈 Real-time Interest**: Dynamic, continuously updating interest calculations visible to users in real-time
- **🪙 Multi-asset Support**: Deposit a range of popular cryptocurrencies (USDC, USDT, DAI, etc.)
- **🛡️ Secure & Transparent**: On-chain governance and auditable smart contracts ensure security
- **👥 Community Driven**: Decentralized governance allows community to shape platform parameters
- **📊 Scalable**: Support thousands of simultaneous users without performance degradation

## 🏗️ Technical Architecture

### Smart Contracts

#### 1. FluidVault.sol
The main vault contract that handles:
- User deposits and withdrawals
- Real-time interest accrual
- Multi-token support
- Security mechanisms (ReentrancyGuard, Pausable)
- Access control and governance integration

#### 2. InterestCalculator.sol
Advanced interest calculation engine supporting:
- Simple interest calculations
- Compound interest with configurable frequency
- Continuous compounding approximation
- Variable interest rates
- Real-time calculations optimized for Somnia's high TPS

#### 3. Governance.sol
On-chain governance system featuring:
- Proposal creation and voting
- Parameter updates
- Community-driven decision making
- Voting power management
- Proposal execution with time delays

### Frontend Architecture

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Web3 Integration**: Wagmi + RainbowKit for wallet connectivity
- **State Management**: React hooks for contract interactions
- **UI Components**: Custom components with glass morphism effects

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Wallet with Somnia testnet tokens

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/fluidvault.git
cd fluidvault
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
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
```

4. **Deploy smart contracts**
```bash
# Compile contracts
npm run compile

# Deploy to Somnia testnet
npm run deploy:testnet
```

5. **Start the frontend**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📋 Usage

### For Users

1. **Connect Wallet**: Use RainbowKit to connect your wallet
2. **Select Vault**: Choose from available token vaults
3. **Deposit**: Enter amount and deposit tokens
4. **Monitor**: Watch real-time interest accrual
5. **Withdraw**: Instant withdrawals with accrued interest

### For Developers

1. **Contract Integration**: Use the provided hooks and utilities
2. **Event Listening**: Subscribe to contract events for real-time updates
3. **Governance**: Create and vote on proposals
4. **Custom Vaults**: Deploy new vaults for additional tokens

## 🔧 Development

### Available Scripts

```bash
# Smart Contract Development
npm run compile          # Compile contracts
npm run test            # Run tests
npm run deploy:testnet  # Deploy to Somnia testnet
npm run deploy:local    # Deploy to local network

# Frontend Development
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Testing

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/FluidVault.test.js

# Run tests with coverage
npx hardhat coverage
```

## 🔒 Security Considerations

### Smart Contract Security

- **Reentrancy Protection**: All external calls protected with ReentrancyGuard
- **Access Control**: Role-based permissions with OpenZeppelin's Ownable
- **Pausable**: Emergency pause functionality for critical situations
- **Input Validation**: Comprehensive parameter validation
- **Rate Limiting**: Maximum interest rates and deposit limits

### Governance Security

- **Time Delays**: Execution delays prevent immediate execution of proposals
- **Quorum Requirements**: Minimum participation thresholds
- **Majority Rules**: Clear voting mechanisms
- **Proposal Validation**: Comprehensive proposal checking

### Frontend Security

- **Wallet Integration**: Secure wallet connection via RainbowKit
- **Input Sanitization**: All user inputs validated and sanitized
- **Error Handling**: Comprehensive error handling and user feedback

## 🌐 Network Configuration

### Somnia Testnet

- **Chain ID**: 1946
- **RPC URL**: https://testnet-rpc.somnia.network
- **Explorer**: https://testnet-explorer.somnia.network
- **Native Token**: SOM

### Supported Tokens

- USDC (Testnet)
- USDT (Testnet) 
- DAI (Testnet)
- Additional tokens can be added via governance

## 📊 Performance Optimizations

### Leveraging Somnia's Capabilities

1. **High TPS**: Handle thousands of simultaneous transactions
2. **Sub-second Finality**: Instant withdrawal confirmations
3. **EVM Compatibility**: Seamless integration with existing tools
4. **MultiStream Consensus**: Enhanced throughput and reliability
5. **IceDB Database**: Optimized data storage and retrieval

### Frontend Optimizations

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Efficient data caching strategies
- **Bundle Analysis**: Optimized bundle sizes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://fluidvault.app](https://fluidvault.app)
- **Documentation**: [https://docs.fluidvault.app](https://docs.fluidvault.app)
- **Discord**: [https://discord.gg/fluidvault](https://discord.gg/fluidvault)
- **Twitter**: [@FluidVault](https://twitter.com/FluidVault)

## 🙏 Acknowledgments

- Somnia Network for providing the high-performance blockchain infrastructure
- OpenZeppelin for secure smart contract libraries
- RainbowKit for seamless wallet integration
- The DeFi community for inspiration and feedback

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core vault functionality
- ✅ Basic governance
- ✅ Frontend interface
- ✅ Somnia testnet deployment

### Phase 2 (Q2 2024)
- 🔄 Advanced yield strategies
- 🔄 Cross-chain compatibility
- 🔄 Mobile application
- 🔄 Enhanced analytics

### Phase 3 (Q3 2024)
- 📋 Institutional features
- 📋 Advanced governance mechanisms
- 📋 Integration with major DeFi protocols
- 📋 Mainnet launch

---

**Built with ❤️ on Somnia Network**