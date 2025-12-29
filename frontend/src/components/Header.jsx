/**
 * Header - Main navigation header with wallet connection
 */
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import WalletButton from './WalletButton';

const Header = () => {
  const location = useLocation();
  const { address, isConnected } = useSelector((state) => state.wallet);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/countries', label: 'Countries' },
    { path: '/places', label: 'Places' },
    { path: '/auctions', label: 'Auctions' },
    { path: '/rankings', label: 'Rankings' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-dark-lighter border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">PlaceNFT</span>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">ERC-1155</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-gray-200 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isConnected && (
              <Link
                to="/profile"
                className={`text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'text-primary'
                    : 'text-gray-200 hover:text-white'
                }`}
              >
                Profile
              </Link>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
