# 🚀 FluidVault Deployment Setup Guide

## ✅ Error Identified and Fixed!

The deployment error has been identified: **Invalid private key configuration**.

## 🔧 Quick Fix

### 1. Get Your Private Key
You need a real private key from a wallet (MetaMask, etc.):

1. **Open MetaMask** (or your wallet)
2. **Click on your account** (top right)
3. **Click "Account Details"**
4. **Click "Export Private Key"**
5. **Enter your password**
6. **Copy the private key** (starts with 0x...)

### 2. Update .env File
Edit the `.env` file and replace the placeholder:

```bash
# .env file
PRIVATE_KEY=0x1234567890abcdef...  # Your actual private key here
SOMNIA_RPC_URL=https://dream-rpc.somnia.network/
SOMNIA_CHAIN_ID=50312
```

### 3. Get STT Tokens
- Visit Somnia testnet faucet
- Get STT tokens for gas fees
- Ensure your account has at least 0.1 STT

## 🚀 Deployment Commands

### Test Configuration First
```bash
npm run test:deploy
```

### Deploy Contracts
```bash
npm run deploy:simple
```

## 🔍 Troubleshooting

### Error: "private key too short"
**Cause:** Using placeholder private key
**Solution:** Replace with your actual private key

### Error: "insufficient funds"
**Cause:** Not enough STT tokens
**Solution:** Get STT tokens from faucet

### Error: "network connection failed"
**Cause:** RPC issues
**Solution:** Check internet connection

## 📋 Step-by-Step Setup

### Step 1: Get Private Key
1. Open MetaMask
2. Click account → Account Details
3. Export Private Key
4. Copy the key (starts with 0x...)

### Step 2: Update Environment
```bash
# Edit .env file
nano .env

# Replace this line:
PRIVATE_KEY=your_private_key_here

# With your actual key:
PRIVATE_KEY=0x1234567890abcdef...
```

### Step 3: Get Test Tokens
1. Visit Somnia testnet faucet
2. Enter your wallet address
3. Request STT tokens
4. Wait for tokens to arrive

### Step 4: Test Deployment
```bash
npm run test:deploy
```

### Step 5: Deploy Contracts
```bash
npm run deploy:simple
```

## 🎯 Success Indicators

### ✅ Configuration Test Passes
- Shows your wallet address
- Shows STT balance
- Shows network connection
- Deploys test contract

### ✅ Full Deployment Success
- All contracts deployed
- Contract addresses displayed
- Explorer links provided
- Environment file updated

## 🔗 Useful Links

- **Somnia Testnet Faucet**: Get STT tokens
- **Shannon Explorer**: https://shannon-explorer.somnia.network/
- **MetaMask**: https://metamask.io/

## ⚠️ Security Notes

- **Never share your private key**
- **Never commit .env file to git**
- **Use testnet only for testing**
- **Keep your private key secure**

---

## 🚀 Ready to Deploy?

1. **Get your private key** from MetaMask
2. **Update .env file** with real private key
3. **Get STT tokens** from faucet
4. **Run deployment** with `npm run deploy:simple`

**Your FluidVault contracts will be live on Somnia testnet!** 🎉
