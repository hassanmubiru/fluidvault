# 🚀 Smart Contract Deployment Guide

## 🎯 **Current Status**
- ✅ **Deployment Scripts**: Ready and tested
- ✅ **Network Configuration**: Connected to Somnia testnet
- ✅ **Wallet Address**: `0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf`
- ❌ **STT Balance**: 0.000074 STT (Need at least 0.1 STT)

## 💰 **Step 1: Get STT Test Tokens**

### **Option A: Somnia Discord (Recommended)**
1. **Join Somnia Discord**: https://discord.com/invite/somnia
2. **Navigate to**: #faucet or #testnet channel
3. **Request tokens** for: `0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf`
4. **Ask for**: 2-3 STT tokens to cover deployment costs

### **Option B: Check Public Faucet**
1. **Visit**: https://shannon-explorer.somnia.network/
2. **Look for**: "Faucet" or "Get Test Tokens" section
3. **Enter your address**: `0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf`

### **Option C: Alternative Faucets**
- Check if there are other Somnia testnet faucets
- Look for community-run faucets

## 🔧 **Step 2: Verify Balance**

After getting tokens, check your balance:
```bash
npx hardhat run scripts/deploy-without-key.js --network somnia-testnet
```

You should see: `💰 Balance: X.XXXXXX STT` (where X > 0.1)

## 🚀 **Step 3: Deploy Contracts**

Once you have sufficient STT tokens:

```bash
npm run deploy:somnia
```

This will deploy:
1. **InterestCalculator** contract
2. **FluidVault** contract
3. **Update environment variables** with contract addresses

## 📋 **Step 4: Update Environment Variables**

After successful deployment, the script will:
- ✅ **Save contract addresses** to `deployments/somnia-testnet.json`
- ✅ **Update Vercel environment variables** automatically
- ✅ **Redeploy your application** with real contracts

## 🎉 **Step 5: Remove Demo Mode**

Once contracts are deployed:
- ✅ **Demo mode message** will automatically disappear
- ✅ **Real vault functionality** will be active
- ✅ **Users can deposit/withdraw** using actual contracts

## 🔍 **Expected Deployment Output**

```
🚀 Quick Deploy to Somnia Testnet
=====================================
🌐 Connected to network: somnia-testnet (Chain ID: 50312)
✅ Connected to Somnia testnet successfully!
📝 Deploying with account: 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf
💰 Account balance: 2.500000 STT
✅ Sufficient balance for deployment!

🏗️  Deploying contracts...
1️⃣  Deploying InterestCalculator...
✅ InterestCalculator deployed to: 0x...

2️⃣  Deploying FluidVault...
✅ FluidVault deployed to: 0x...

🎉 Deployment completed successfully!
📄 Contract addresses saved to: deployments/somnia-testnet.json
🌐 Updating Vercel environment variables...
✅ Environment variables updated!
🚀 Redeploying application...
✅ Application redeployed with real contracts!
```

## 🆘 **Troubleshooting**

### **"insufficient balance" Error**
- **Solution**: Get more STT tokens from Discord/faucet
- **Required**: At least 0.1 STT for gas fees

### **"Network not found" Error**
- **Solution**: Ensure you're connected to Somnia testnet
- **Check**: `hardhat.config.js` network configuration

### **"Private key not found" Error**
- **Solution**: Update `.env` file with your real private key
- **Format**: `PRIVATE_KEY=0xYourRealPrivateKeyHere`

## 📞 **Need Help?**

1. **Somnia Discord**: https://discord.com/invite/somnia
2. **Somnia Explorer**: https://shannon-explorer.somnia.network/
3. **Check your transaction**: Search your address on the explorer

## 🎯 **What Happens After Deployment**

- ✅ **Demo mode disappears**
- ✅ **Real vault contracts active**
- ✅ **Users can deposit/withdraw STT**
- ✅ **Interest calculations work**
- ✅ **Full DeFi functionality**

Your FluidVault will be **fully operational** with real smart contracts! 🚀
