/**
 * WalletModal - Modal for selecting wallet type
 */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet } from '../store/slices/walletSlice';
import { getAllWalletTypes, clearWalletCache } from '../services/walletDetector';

const WalletModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isConnecting, error } = useSelector((state) => state.wallet);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletTypes, setWalletTypes] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Clear cache and re-detect wallets when modal opens
      clearWalletCache();
      const wallets = getAllWalletTypes();
      setWalletTypes(wallets);
    }
  }, [isOpen]);

  const handleConnect = async (wallet) => {
    if (!wallet.installed) {
      // Open download page if wallet not installed
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setSelectedWallet(wallet.id);
    try {
      await dispatch(connectWallet(wallet.id)).unwrap();
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
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {walletTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No wallets detected. Please install a wallet extension.</p>
            </div>
          ) : (
            walletTypes.map((wallet) => {
              const isLoading = isConnecting && selectedWallet === wallet.id;

              return (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet)}
                  disabled={isConnecting}
                  className={`w-full p-4 rounded-sm border-2 transition-all ${
                    wallet.installed
                      ? 'bg-gray-700 border-primary/50 hover:border-primary hover:bg-gray-600 hover:scale-[1.02]'
                      : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                  } ${isLoading ? 'animate-pulse border-primary' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="text-4xl relative">
                      {wallet.icon}
                      {/* Installed badge */}
                      {wallet.installed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${wallet.installed ? 'text-white' : 'text-gray-400'}`}>
                          {wallet.name}
                        </h3>
                        {wallet.installed && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                            Installed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {isLoading
                          ? 'Connecting...'
                          : wallet.installed
                          ? wallet.description || 'Click to connect'
                          : 'Click to install'}
                      </p>
                    </div>

                    {/* Arrow or Download Icon */}
                    {wallet.installed ? (
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
                    ) : (
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
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
