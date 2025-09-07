import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Custom500() {
  const router = useRouter();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>Server Error - FluidVault</title>
        <meta name="description" content="Something went wrong on our end." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">FV</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent ml-3">
              FluidVault
            </span>
          </div>

          {/* 500 Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-6xl font-bold text-gray-900 mb-2">500</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Server Error</h2>
              <p className="text-gray-600 mb-8">
                Something went wrong on our end. We're working to fix this issue. Please try again in a few moments.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleRefresh}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
              
              <Link href="/">
                <button className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center">
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

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Still having issues?</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Contact Support
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Status Page
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Discord
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Twitter
                </a>
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
