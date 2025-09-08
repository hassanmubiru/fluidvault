import React from 'react';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Brain, 
  Globe, 
  Target,
  ArrowLeft,
  Home
} from 'lucide-react';

export default function Analytics() {
  return (
    <>
      <Head>
        <title>Analytics Dashboard - FluidVault</title>
        <meta name="description" content="Advanced analytics and insights for your DeFi portfolio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Navigation */}
              <div className="flex items-center space-x-4">
                <a href="/" className="flex items-center space-x-2">
                  <img src="/logo-icon.svg" alt="FluidVault" className="w-8 h-8" />
                  <span className="text-xl font-bold text-gray-900">FluidVault</span>
                </a>
                
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    <Home className="w-4 h-4" />
                    Home
                  </a>
                  <a href="/strategies" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    <Target className="w-4 h-4" />
                    Strategies
                  </a>
                  <a href="/cross-chain" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    <Globe className="w-4 h-4" />
                    Cross-Chain
                  </a>
                  <a href="/governance" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    <Shield className="w-4 h-4" />
                    Governance
                  </a>
                </nav>
              </div>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-4">
                <ConnectButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <a 
                href="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </a>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Analytics Dashboard
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive insights into your DeFi portfolio performance, risk assessment, 
                and AI-powered strategy recommendations.
              </p>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Portfolio Analytics</h3>
              </div>
              <p className="text-sm text-gray-600">
                Real-time portfolio performance tracking with detailed metrics and historical data.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
              </div>
              <p className="text-sm text-gray-600">
                Advanced risk metrics including portfolio, concentration, and market risk analysis.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">AI Insights</h3>
              </div>
              <p className="text-sm text-gray-600">
                Machine learning-powered strategy recommendations and market predictions.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Globe className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Cross-Chain</h3>
              </div>
              <p className="text-sm text-gray-600">
                Multi-chain portfolio overview with bridge analytics and gas optimization.
              </p>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard />

          {/* Additional Information */}
          <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Advanced Analytics Features</h2>
              <p className="text-blue-100 mb-6 max-w-3xl mx-auto">
                Our analytics engine provides comprehensive insights into your DeFi portfolio 
                with real-time data, AI-powered recommendations, and advanced risk assessment.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Performance Tracking</h3>
                  <p className="text-sm text-blue-100">
                    Monitor your portfolio performance with detailed metrics and historical analysis.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Recommendations</h3>
                  <p className="text-sm text-blue-100">
                    Get personalized strategy recommendations based on your risk profile and market conditions.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Risk Management</h3>
                  <p className="text-sm text-blue-100">
                    Comprehensive risk assessment with real-time monitoring and alerts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img src="/logo-icon.svg" alt="FluidVault" className="w-6 h-6" />
                <span className="text-lg font-semibold text-gray-900">FluidVault</span>
              </div>
              <p className="text-gray-600 text-sm">
                Advanced DeFi analytics and AI-powered strategy optimization
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
