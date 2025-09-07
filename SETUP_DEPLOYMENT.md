# 🚀 FluidVault Deployment Setup

## ⚠️ Deployment Error Fixed!

The deployment error has been resolved. Here's how to set up and deploy your contracts:

## 🔧 Quick Setup

### 1. Create Environment File
Create a `.env` file in the root directory:

```bash
# Copy the example file
cp env.example .env
```

### 2. Add Your Private Key
Edit the `.env` file and add your private key:

```bash
# .env file
PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
SOMNIA_CHAIN_ID=50312
```

### 3. Get STT Tokens
- Visit the Somnia testnet faucet to get STT tokens
- Ensure your account has at least 0.1 STT for gas fees

## 🚀 Deployment Commands

### Simple Deployment (Recommended)
```bash
npm run deploy:simple
```

### Full Deployment
```bash
npm run deploy:somnia
```

### Test Deployment
```bash
npm run deploy:test
```

## 🔍 Troubleshooting

### Error: "Cannot read properties of undefined"
**Cause:** No private key configured
**Solution:** Create `.env` file with your private key

### Error: "insufficient funds"
**Cause:** Not enough STT tokens
**Solution:** Get STT tokens from Somnia testnet faucet

### Error: "network connection failed"
**Cause:** RPC connection issues
**Solution:** Check internet connection and RPC URL

## 📋 Deployment Checklist

- [ ] Create `.env` file with private key
- [ ] Get STT tokens from faucet
- [ ] Run deployment command
- [ ] Save contract addresses
- [ ] Update frontend configuration
- [ ] Test application

## 🎯 Next Steps After Deployment

1. **Save Contract Addresses** - Copy the addresses from deployment output
2. **Update Frontend** - Add addresses to `.env.local`
3. **Restart Server** - Run `npm run dev`
4. **Test Application** - Connect wallet and test functionality

## 🔗 Useful Links

- **Somnia Testnet Faucet**: Get STT tokens
- **Shannon Explorer**: https://shannon-explorer.somnia.network/
- **Somnia RPC**: https://dream-rpc.somnia.network/

---

**Ready to deploy? Run:**
```bash
npm run deploy:simple
```
