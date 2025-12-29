/**
 * WalletButton - Wallet connection button with status
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { disconnectWallet } from '../store/slices/walletSlice';
import config from '../config';
import WalletModal from './WalletModal';

const WalletButton = () => {
  const dispatch = useDispatch();
  const { address, isConnected, isConnecting, walletType, balance } = useSelector((state) => state.wallet);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
    setIsDropdownOpen(false);
  };

  const handleSwitchWallet = () => {
    dispatch(disconnectWallet());
    setIsDropdownOpen(false);
    setIsModalOpen(true);
  };

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-primary/50 text-white rounded-lg cursor-not-allowed"
      >
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          {/* Wallet Icon */}
          <span className="text-xl">
            {walletType === 'metamask' ? '🦊' : '👛'}
          </span>

          {/* Address & Balance */}
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs text-gray-400">{balance} MATIC</span>
            <span className="text-sm font-medium">
              {config.truncateAddress(address)}
            </span>
          </div>

          {/* Dropdown Arrow */}
          <svg
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Dropdown Content */}
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20">
              {/* Account Info */}
              <div className="p-4 border-b border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Connected with {walletType}</p>
                <p className="text-sm text-white font-medium break-all">{address}</p>
                <p className="text-xs text-gray-400 mt-2">{balance} MATIC</p>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleSwitchWallet}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
                >
                  Switch Wallet
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}

        {/* Wallet Modal */}
        <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/80 transition-colors"
      >
        Connect Wallet
      </button>

      {/* Wallet Modal */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default WalletButton;
