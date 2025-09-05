# FluidVault Architecture

## System Overview

FluidVault is a decentralized savings platform built on Somnia Network, designed to leverage the network's high TPS and sub-second finality for optimal user experience.

## Smart Contract Architecture

### Core Contracts

#### 1. FluidVault.sol
- **Purpose**: Main vault contract managing user deposits and withdrawals
- **Key Features**:
  - Multi-token support
  - Real-time interest accrual
  - Instant withdrawal mechanisms
  - Security controls (ReentrancyGuard, Pausable)
  - Governance integration

#### 2. InterestCalculator.sol
- **Purpose**: Advanced interest calculation engine
- **Key Features**:
  - Simple interest calculations
  - Compound interest with configurable frequency
  - Continuous compounding approximation
  - Variable interest rates
  - Optimized for high-frequency updates

#### 3. Governance.sol
- **Purpose**: On-chain governance system
- **Key Features**:
  - Proposal creation and voting
  - Parameter updates
  - Community-driven decisions
  - Voting power management
  - Time-delayed execution

### Contract Interactions

```
User → FluidVault → InterestCalculator
  ↓
Governance ← FluidVault
```

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Web3**: Wagmi + RainbowKit for wallet connectivity
- **State Management**: React hooks for contract interactions

### Component Structure

```
pages/
├── _app.tsx          # App wrapper with Web3 providers
└── index.tsx         # Main dashboard

components/
├── VaultCard.tsx     # Individual vault display
└── StatsCard.tsx     # Statistics display

hooks/
└── useFluidVault.ts  # Contract interaction hooks

styles/
└── globals.css       # Global styles and utilities
```

## Data Flow

### Deposit Flow
1. User connects wallet via RainbowKit
2. User selects vault and enters amount
3. Frontend calls `deposit()` on FluidVault contract
4. Contract transfers tokens and updates user balance
5. Interest calculation begins immediately
6. UI updates with new balance and interest

### Withdrawal Flow
1. User initiates withdrawal
2. Contract calculates accrued interest
3. Tokens transferred back to user
4. Balance updated in real-time
5. UI reflects new state

### Interest Calculation
1. InterestCalculator receives principal, rate, and time
2. Calculates interest using appropriate method
3. Updates user's accumulated interest
4. Emits InterestAccrued event
5. Frontend listens and updates UI

## Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: All external calls protected
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter checking
- **Rate Limiting**: Maximum rates and limits
- **Emergency Controls**: Pause functionality

### Frontend Security
- **Wallet Integration**: Secure connection via RainbowKit
- **Input Sanitization**: All inputs validated
- **Error Handling**: Comprehensive error management
- **HTTPS**: Secure communication

## Performance Optimizations

### Leveraging Somnia Network
- **High TPS**: Handle thousands of transactions
- **Sub-second Finality**: Instant confirmations
- **EVM Compatibility**: Seamless tool integration
- **MultiStream Consensus**: Enhanced reliability

### Frontend Optimizations
- **Code Splitting**: Lazy loading components
- **Caching**: Efficient data caching
- **Bundle Optimization**: Minimized bundle sizes
- **Real-time Updates**: Event-driven UI updates

## Deployment Architecture

### Network Configuration
- **Somnia Testnet**: Chain ID 1946
- **RPC**: https://testnet-rpc.somnia.network
- **Explorer**: https://testnet-explorer.somnia.network

### Deployment Process
1. Compile contracts with Hardhat
2. Deploy to Somnia testnet
3. Verify contracts on explorer
4. Update environment variables
5. Deploy frontend to hosting service

## Monitoring and Analytics

### Contract Events
- Deposit events
- Withdrawal events
- Interest accrual events
- Governance events

### Frontend Analytics
- User interactions
- Transaction success rates
- Performance metrics
- Error tracking

## Future Enhancements

### Phase 2 Features
- Cross-chain compatibility
- Advanced yield strategies
- Mobile application
- Enhanced analytics

### Phase 3 Features
- Institutional features
- Advanced governance
- Protocol integrations
- Mainnet launch
