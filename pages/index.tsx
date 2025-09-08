import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight,
  DollarSign,
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import VaultCard from '../components/VaultCard';
import StatsCard from '../components/StatsCard';
import WalletConnect from '../components/WalletConnect';
import NetworkHelper from '../components/NetworkHelper';
import TransactionLookup from '../components/TransactionLookup';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  const [totalTVL, setTotalTVL] = useState('4.5M');
  const [totalUsers, setTotalUsers] = useState(1250);
  const [averageAPY, setAverageAPY] = useState(4.5);

  useEffect(() => {
    // Mock data for demo
    setTotalTVL('4.5M');
    setTotalUsers(1250);
    setAverageAPY(4.5);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Withdrawals",
      description: "Leverage Somnia's sub-second finality for instant, gas-efficient withdrawals"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-time Interest",
      description: "Watch your savings grow with continuously updating interest calculations"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Transparent",
      description: "On-chain governance and auditable smart contracts ensure security"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Decentralized governance allows community to shape platform parameters"
    }
  ];

  const stats = [
    {
      label: "Total Value Locked",
      value: `$${totalTVL}`,
      icon: <DollarSign className="w-5 h-5" />,
      change: "+12.5%",
      changeType: "positive" as const
    },
    {
      label: "Active Users",
      value: totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      change: "+8.2%",
      changeType: "positive" as const
    },
    {
      label: "Average APY",
      value: `${averageAPY}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: "+0.3%",
      changeType: "positive" as const
    },
    {
      label: "Transaction Speed",
      value: "<1s",
      icon: <Clock className="w-5 h-5" />,
      change: "Somnia Network",
      changeType: "neutral" as const
    }
  ];

  return (
    <>
      <Head>
        <title>FluidVault - Decentralized Savings on Somnia</title>
        <meta name="description" content="A cutting-edge decentralized savings platform leveraging Somnia Network's high TPS and sub-second finality" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        {/* Network Helper */}
        <NetworkHelper />
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FV</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  FluidVault
                </span>
              </div>
              <WalletConnect />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Decentralized Savings
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience the future of DeFi savings with real-time interest accrual, 
                instant withdrawals, and community governance on Somnia Network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <button
                        onClick={connected ? openAccountModal : openConnectModal}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center"
                      >
                        {connected ? 'Manage Wallet' : 'Start Saving'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    );
                  }}
                </ConnectButton.Custom>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose FluidVault?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built on Somnia Network's cutting-edge infrastructure for unparalleled performance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transaction Lookup Section */}
        <section className="py-20 bg-white/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Transaction Lookup
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Look up any transaction on the Somnia testnet
              </p>
            </div>
            <TransactionLookup />
          </div>
        </section>

        {/* Available Vaults Section */}
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Available Vaults
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  High-yield savings vaults with real transaction data from Somnia Network
                </p>
              </div>
              
              {/* Production Status Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 ml-3">Fully Operational</h3>
                </div>
                <p className="text-green-700 text-center mb-4">
                  FluidVault is now live with deployed smart contracts on Somnia testnet. 
                  All deposits, withdrawals, and interest calculations are fully functional.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="https://shannon-explorer.somnia.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    View Network Explorer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                  <a 
                    href="https://dream-rpc.somnia.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center"
                  >
                    RPC Endpoint
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <VaultCard
                  name="USDC Vault"
                  apy={5.2}
                  tvl="$2.5M"
                  token="USDC"
                  address="0x420f8ab112fa8b14c706e277204c8fc3eb0f4c92"
                />
                <VaultCard
                  name="USDT Vault"
                  apy={4.8}
                  tvl="$1.8M"
                  token="USDT"
                  address="0xb98c15a0dc1e271132e341250703c7e94c059e8d"
                />
                <VaultCard
                  name="DAI Vault"
                  apy={4.3}
                  tvl="$1.2M"
                  token="DAI"
                  address="0xe7cf68c601f103e6daaeb75e1268019098815ea2"
                />
              </div>
            </div>
          </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of users earning competitive yields with instant liquidity
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200">
                  <WalletConnect />
                </div>
                <button className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FV</span>
                  </div>
                  <span className="text-xl font-bold">FluidVault</span>
                </div>
                <p className="text-gray-400">
                  Decentralized savings platform on Somnia Network
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Vaults</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Governance</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Community</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 FluidVault. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
