/**
 * WalletModal - Modal for selecting wallet type
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet } from '../store/slices/walletSlice';

const WALLET_TYPES = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect with MetaMask wallet',
    checkInstalled: () => typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect with WalletConnect',
    checkInstalled: () => true, // Always available
    disabled: true, // Not implemented yet
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '💙',
    description: 'Connect with Coinbase Wallet',
    checkInstalled: () => typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet,
    disabled: true, // Not implemented yet
  },
];

const WalletModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isConnecting, error } = useSelector((state) => state.wallet);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const handleConnect = async (walletType) => {
    setSelectedWallet(walletType);
    try {
      await dispatch(connectWallet(walletType)).unwrap();
      onClose();
    } catch (err) {
      console.error('Connection error:', err);
      setSelectedWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Wallet List */}
        <div className="space-y-3">
          {WALLET_TYPES.map((wallet) => {
            const isInstalled = wallet.checkInstalled();
            const isDisabled = wallet.disabled || !isInstalled;
            const isLoading = isConnecting && selectedWallet === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => !isDisabled && handleConnect(wallet.id)}
                disabled={isDisabled || isConnecting}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  isDisabled
                    ? 'bg-gray-700/50 border-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 border-gray-600 hover:border-primary hover:bg-gray-600'
                } ${isLoading ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="text-4xl">{wallet.icon}</div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">{wallet.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {!isInstalled
                        ? 'Not installed'
                        : wallet.disabled
                        ? 'Coming soon'
                        : isLoading
                        ? 'Connecting...'
                        : wallet.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {!isDisabled && (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            New to wallets?{' '}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
