/**
 * WalletButton - Wallet connection button with status
 */
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet } from '../store/slices/walletSlice';
import config from '../config';

const WalletButton = () => {
  const dispatch = useDispatch();
  const { address, isConnected, isConnecting, error } = useSelector((state) => state.wallet);

  const handleConnect = () => {
    dispatch(connectWallet());
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
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
      <div className="flex items-center gap-2">
        <span className="text-gray-200 text-sm hidden sm:inline">
          {config.truncateAddress(address)}
        </span>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/80 transition-colors"
    >
      Connect Wallet
    </button>
  );
};

export default WalletButton;
