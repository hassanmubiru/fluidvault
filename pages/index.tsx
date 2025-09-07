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
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center">
                  Start Saving
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
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

        {/* Recent Transactions Section */}
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Recent Transactions
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Live transaction data from the Somnia testnet network
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TX</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Contract Interaction</h3>
                        <p className="text-sm text-gray-500">Block 0xa1f7720</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">From:</span>
                      <span className="font-mono text-xs text-gray-800">0xe7cf...5ea2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">To:</span>
                      <span className="font-mono text-xs text-gray-800">0x420f...4c92</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gas Used:</span>
                      <span className="text-gray-800">9,170,082</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="text-gray-800">0 STT</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a 
                      href="https://shannon-explorer.somnia.network/tx/0xd14546ac7e5e0156e3dc66bf31f0fd81aef17700791fa0195dbc6252ddc35ee2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center text-sm"
                    >
                      View on Explorer
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TX</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Contract Interaction</h3>
                        <p className="text-sm text-gray-500">Block 0xa1f7720</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">From:</span>
                      <span className="font-mono text-xs text-gray-800">0x025d...e421</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">To:</span>
                      <span className="font-mono text-xs text-gray-800">0xb98c...9e8d</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gas Used:</span>
                      <span className="text-gray-800">1,545,590</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="text-gray-800">0 STT</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a 
                      href="https://shannon-explorer.somnia.network/tx/0x4a35bc7791fe8106ff0d0141a68ecb4b95786289b8c6931b8b5f00c64ed5d191"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center text-sm"
                    >
                      View on Explorer
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TX</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Contract Interaction</h3>
                        <p className="text-sm text-gray-500">Block 0xa1f771e</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">From:</span>
                      <span className="font-mono text-xs text-gray-800">0x3807...fdc3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">To:</span>
                      <span className="font-mono text-xs text-gray-800">Contract</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gas Used:</span>
                      <span className="text-gray-800">Recent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Value:</span>
                      <span className="text-gray-800">0 STT</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a 
                      href="https://shannon-explorer.somnia.network/tx/0x380784dc566e0224f36ba077d197a3a6f29b40034f13fc6375e911d94586fdc3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center text-sm"
                    >
                      View on Explorer
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
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
