import { createConfig } from 'wagmi'
import { mainnet, sepolia, localhost } from 'wagmi/chains'

// Somnia testnet configuration
const somniaTestnet = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia Test Token',
    symbol: 'STT',
  },
  rpcUrls: {
    public: { http: ['https://dream-rpc.somnia.network/'] },
    default: { http: ['https://dream-rpc.somnia.network/'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network/' },
  },
  testnet: true,
};

// Create wagmi config
export const config = createConfig({
  chains: [somniaTestnet, mainnet, sepolia, localhost],
  connectors: [],
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}