import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Brain,
  RefreshCw,
  AlertCircle,
  Info,
  Target,
  Activity,
  PieChart,
  LineChart,
  DollarSign,
  Clock,
  Users,
  Layers
} from 'lucide-react';
import { useAnalytics, formatAPY, formatRiskScore, formatYield, formatValue, getRiskLevel, getRiskColor } from '../hooks/useAnalytics';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const {
    portfolioMetrics,
    riskMetrics,
    yieldAnalytics,
    crossChainAnalytics,
    aiStrategies,
    userProfile,
    latestRecommendation,
    marketConditions,
    loading,
    error,
    isConnected,
    isAnalyticsDeployed,
    isAIEngineDeployed,
    refreshAll,
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'strategies' | 'risk' | 'cross-chain' | 'ai'>('overview');

  if (!isConnected) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to view analytics and insights.</p>
        </div>
      </div>
    );
  }

  if (!isAnalyticsDeployed || !isAIEngineDeployed) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <Info className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            Advanced analytics and AI-powered insights are being deployed. 
            This will include portfolio analytics, risk assessment, and strategy recommendations.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What's Coming:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Real-time portfolio performance tracking</li>
              <li>• AI-powered strategy recommendations</li>
              <li>• Advanced risk analytics</li>
              <li>• Cross-chain portfolio insights</li>
              <li>• Market condition analysis</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshAll}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'strategies', label: 'Strategies', icon: Target },
    { id: 'risk', label: 'Risk', icon: Shield },
    { id: 'cross-chain', label: 'Cross-Chain', icon: Globe },
    { id: 'ai', label: 'AI Insights', icon: Brain },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Comprehensive insights into your DeFi portfolio</p>
          </div>
          <button
            onClick={refreshAll}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Portfolio Value</p>
                        <p className="text-2xl font-bold">
                          {portfolioMetrics ? formatValue(portfolioMetrics.totalValue) : '0'} ETH
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Total Yield Earned</p>
                        <p className="text-2xl font-bold">
                          {portfolioMetrics ? formatValue(portfolioMetrics.totalYield) : '0'} ETH
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Active Strategies</p>
                        <p className="text-2xl font-bold">
                          {portfolioMetrics ? portfolioMetrics.activeStrategies.toString() : '0'}
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-purple-200" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Cross-Chain Positions</p>
                        <p className="text-2xl font-bold">
                          {portfolioMetrics ? portfolioMetrics.crossChainPositions.toString() : '0'}
                        </p>
                      </div>
                      <Globe className="w-8 h-8 text-orange-200" />
                    </div>
                  </div>
                </div>

                {/* Performance Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 mx-auto mb-2" />
                      <p>Performance chart will be displayed here</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Deposit to Strategy #1</span>
                        <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Cross-chain bridge to Polygon</span>
                        <span className="text-xs text-gray-500 ml-auto">5 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Yield claimed from Strategy #2</span>
                        <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendation</h3>
                    {latestRecommendation && latestRecommendation.strategyId > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Strategy #{latestRecommendation.strategyId.toString()}</span>
                          <span className="text-sm text-gray-500">
                            ({latestRecommendation.confidence.toString()}% confidence)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{latestRecommendation.reasoning}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Expected APY: {formatAPY(latestRecommendation.expectedAPY)}</span>
                          <span>Risk: {getRiskLevel(latestRecommendation.riskScore)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No recommendations available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Breakdown</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChart className="w-12 h-12 mx-auto mb-2" />
                        <p>Portfolio breakdown chart</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Metrics</h3>
                    {portfolioMetrics ? (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Deposits</span>
                          <span className="font-medium">{formatValue(portfolioMetrics.totalDeposits)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Withdrawals</span>
                          <span className="font-medium">{formatValue(portfolioMetrics.totalWithdrawals)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Yield</span>
                          <span className="font-medium text-green-600">{formatValue(portfolioMetrics.totalYield)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Strategies</span>
                          <span className="font-medium">{portfolioMetrics.activeStrategies.toString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cross-Chain Positions</span>
                          <span className="font-medium">{portfolioMetrics.crossChainPositions.toString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No portfolio data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Strategies Tab */}
            {activeTab === 'strategies' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Strategies</h3>
                    {aiStrategies && aiStrategies.length > 0 ? (
                      <div className="space-y-4">
                        {aiStrategies.slice(0, 3).map((strategy) => (
                          <div key={strategy.strategyId.toString()} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{strategy.name}</h4>
                              <span className="text-sm text-gray-500">Risk: {strategy.riskLevel.toString()}/10</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span>Target APY: {formatAPY(strategy.targetAPY)}</span>
                              <span>Min: {formatValue(strategy.minDeposit)} ETH</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No AI strategies available</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategy Performance</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Strategy performance chart</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Tab */}
            {activeTab === 'risk' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
                    {riskMetrics ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Portfolio Risk</span>
                          <span className={`font-medium ${getRiskColor(riskMetrics.portfolioRisk)}`}>
                            {getRiskLevel(riskMetrics.portfolioRisk)} ({formatRiskScore(riskMetrics.portfolioRisk)})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Concentration Risk</span>
                          <span className={`font-medium ${getRiskColor(riskMetrics.concentrationRisk)}`}>
                            {getRiskLevel(riskMetrics.concentrationRisk)} ({formatRiskScore(riskMetrics.concentrationRisk)})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Liquidity Risk</span>
                          <span className={`font-medium ${getRiskColor(riskMetrics.liquidityRisk)}`}>
                            {getRiskLevel(riskMetrics.liquidityRisk)} ({formatRiskScore(riskMetrics.liquidityRisk)})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Smart Contract Risk</span>
                          <span className={`font-medium ${getRiskColor(riskMetrics.smartContractRisk)}`}>
                            {getRiskLevel(riskMetrics.smartContractRisk)} ({formatRiskScore(riskMetrics.smartContractRisk)})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Market Risk</span>
                          <span className={`font-medium ${getRiskColor(riskMetrics.marketRisk)}`}>
                            {getRiskLevel(riskMetrics.marketRisk)} ({formatRiskScore(riskMetrics.marketRisk)})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No risk data available</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Shield className="w-12 h-12 mx-auto mb-2" />
                        <p>Risk assessment chart</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cross-Chain Tab */}
            {activeTab === 'cross-chain' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Chain Analytics</h3>
                    {crossChainAnalytics ? (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Chains</span>
                          <span className="font-medium">{crossChainAnalytics.totalChains.toString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bridges</span>
                          <span className="font-medium">{crossChainAnalytics.totalBridges.toString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bridge Volume</span>
                          <span className="font-medium">{formatValue(crossChainAnalytics.totalBridgeVolume)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Success Rate</span>
                          <span className="font-medium">{crossChainAnalytics.bridgeSuccessRate.toString()}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gas Optimization</span>
                          <span className="font-medium">{crossChainAnalytics.gasOptimization.toString()}%</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No cross-chain data available</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Chain Overview</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Globe className="w-12 h-12 mx-auto mb-2" />
                        <p>Cross-chain network map</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Conditions</h3>
                    {marketConditions ? (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Market Volatility</span>
                          <span className="font-medium">{marketConditions.marketVolatility.toString()}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Yield Environment</span>
                          <span className="font-medium">{marketConditions.yieldEnvironment.toString()}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Liquidity Conditions</span>
                          <span className="font-medium">{marketConditions.liquidityConditions.toString()}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gas Prices</span>
                          <span className="font-medium">{marketConditions.gasPrices.toString()}%</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No market data available</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Brain className="w-12 h-12 mx-auto mb-2" />
                        <p>AI insights and predictions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
