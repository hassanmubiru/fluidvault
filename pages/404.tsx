import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function Custom404() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Page Not Found - FluidVault</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FV</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent ml-3">
              FluidVault
            </span>
          </div>

          {/* 404 Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="mb-6">
              <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
              <p className="text-gray-600 mb-8">
                This page is no longer explorable! If you are lost, use the search bar to find what you are looking for.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for vaults, features, or help..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // You can implement search functionality here
                      console.log('Search:', e.currentTarget.value);
                    }
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/">
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center">
                  <Home className="w-5 h-5 mr-2" />
                  Go to Homepage
                </button>
              </Link>
              
              <button
                onClick={() => router.back()}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Quick Links:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Vaults
                </Link>
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Governance
                </Link>
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Analytics
                </Link>
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Documentation
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 FluidVault. All rights reserved.</p>
          </div>
        </div>
      </main>
    </>
  );
}
