import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  ArrowRightLeft, 
  Vote,
  User,
  Settings,
  Bell,
  Brain
} from 'lucide-react';
import { useAccount } from 'wagmi';

interface MobileNavigationProps {
  className?: string;
}

export default function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/strategies', label: 'Strategies', icon: TrendingUp },
    { href: '/cross-chain', label: 'Cross-Chain', icon: ArrowRightLeft },
    { href: '/analytics', label: 'Analytics', icon: Brain },
    { href: '/governance', label: 'Governance', icon: Vote },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ${className}`}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 right-0 w-80 max-w-sm bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/logo-icon.svg" alt="FluidVault Logo" className="w-8 h-8" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    FluidVault
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {isConnected && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">Connected</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                {!isConnected && (
                  <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200">
                    Connect Wallet
                  </button>
                )}
                
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm">Notifications</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
