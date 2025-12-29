/**
 * Wallet Detector - Detects all installed wallets in the browser
 */

/**
 * Get all available wallet providers from window.ethereum.providers (EIP-6963)
 * This handles cases where multiple wallets are installed
 */
export const detectWallets = () => {
  const wallets = [];

  if (typeof window === 'undefined') {
    return wallets;
  }

  // Check if there are multiple providers (EIP-5749)
  if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
    // Multiple wallets detected - check each one
    window.ethereum.providers.forEach((provider) => {
      addWalletIfDetected(provider, wallets);
    });
  } else if (window.ethereum) {
    // Single provider or default
    addWalletIfDetected(window.ethereum, wallets);
  }

  // Check for wallets that use their own namespace

  // Phantom (has its own namespace)
  if (window.phantom?.ethereum) {
    wallets.push({
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      provider: window.phantom.ethereum,
      installed: true,
    });
  }

  // OKX Wallet (has its own namespace)
  if (window.okxwallet) {
    wallets.push({
      id: 'okx',
      name: 'OKX Wallet',
      icon: '⭕',
      provider: window.okxwallet,
      installed: true,
    });
  }

  // Binance Wallet (has its own namespace)
  if (window.BinanceChain) {
    wallets.push({
      id: 'binance',
      name: 'Binance Wallet',
      icon: '🟡',
      provider: window.BinanceChain,
      installed: true,
    });
  }

  return wallets;
};

/**
 * Helper function to identify and add a wallet provider
 */
function addWalletIfDetected(provider, wallets) {
  // MetaMask
  if (provider.isMetaMask && !provider.isBraveWallet) {
    wallets.push({
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      provider: provider,
      installed: true,
    });
    return;
  }

  // Coinbase Wallet
  if (provider.isCoinbaseWallet) {
    wallets.push({
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '💙',
      provider: provider,
      installed: true,
    });
    return;
  }

  // Trust Wallet
  if (provider.isTrust) {
    wallets.push({
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      provider: provider,
      installed: true,
    });
    return;
  }

  // Brave Wallet
  if (provider.isBraveWallet) {
    wallets.push({
      id: 'brave',
      name: 'Brave Wallet',
      icon: '🦁',
      provider: provider,
      installed: true,
    });
    return;
  }

  // Rabby Wallet
  if (provider.isRabby) {
    wallets.push({
      id: 'rabby',
      name: 'Rabby Wallet',
      icon: '🐰',
      provider: provider,
      installed: true,
    });
    return;
  }

  // TokenPocket
  if (provider.isTokenPocket) {
    wallets.push({
      id: 'tokenpocket',
      name: 'TokenPocket',
      icon: '🎫',
      provider: provider,
      installed: true,
    });
    return;
  }

  // Math Wallet
  if (provider.isMathWallet) {
    wallets.push({
      id: 'mathwallet',
      name: 'Math Wallet',
      icon: '➗',
      provider: provider,
      installed: true,
    });
    return;
  }

  // BitKeep
  if (provider.isBitKeep) {
    wallets.push({
      id: 'bitkeep',
      name: 'BitKeep',
      icon: '🔑',
      provider: provider,
      installed: true,
    });
    return;
  }

  // Generic provider (unknown wallet)
  if (!wallets.some(w => w.provider === provider)) {
    wallets.push({
      id: 'ethereum',
      name: 'Browser Wallet',
      icon: '💼',
      provider: provider,
      installed: true,
    });
  }
}

/**
 * Get all possible wallets (installed + not installed)
 */
export const getAllWalletTypes = () => {
  const installedWallets = detectWallets();
  const installedIds = new Set(installedWallets.map((w) => w.id));

  const allWallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Most popular Ethereum wallet',
      downloadUrl: 'https://metamask.io/download/',
      installed: installedIds.has('metamask'),
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '💙',
      description: 'Coinbase official wallet',
      downloadUrl: 'https://www.coinbase.com/wallet',
      installed: installedIds.has('coinbase'),
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Secure multi-chain wallet',
      downloadUrl: 'https://trustwallet.com/',
      installed: installedIds.has('trust'),
    },
    {
      id: 'brave',
      name: 'Brave Wallet',
      icon: '🦁',
      description: 'Built into Brave browser',
      downloadUrl: 'https://brave.com/wallet/',
      installed: installedIds.has('brave'),
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Multi-chain crypto wallet',
      downloadUrl: 'https://phantom.app/',
      installed: installedIds.has('phantom'),
    },
    {
      id: 'rabby',
      name: 'Rabby Wallet',
      icon: '🐰',
      description: 'Better DeFi wallet',
      downloadUrl: 'https://rabby.io/',
      installed: installedIds.has('rabby'),
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '⭕',
      description: 'OKX official wallet',
      downloadUrl: 'https://www.okx.com/web3',
      installed: installedIds.has('okx'),
    },
    {
      id: 'binance',
      name: 'Binance Wallet',
      icon: '🟡',
      description: 'Binance Chain wallet',
      downloadUrl: 'https://www.binance.com/en/wallet-direct',
      installed: installedIds.has('binance'),
    },
    {
      id: 'tokenpocket',
      name: 'TokenPocket',
      icon: '🎫',
      description: 'Multi-chain wallet',
      downloadUrl: 'https://www.tokenpocket.pro/',
      installed: installedIds.has('tokenpocket'),
    },
    {
      id: 'mathwallet',
      name: 'Math Wallet',
      icon: '➗',
      description: 'Multi-platform wallet',
      downloadUrl: 'https://mathwallet.org/',
      installed: installedIds.has('mathwallet'),
    },
    {
      id: 'bitkeep',
      name: 'BitKeep',
      icon: '🔑',
      description: 'Decentralized wallet',
      downloadUrl: 'https://bitkeep.com/',
      installed: installedIds.has('bitkeep'),
    },
  ];

  // Add any detected wallets that aren't in the list
  installedWallets.forEach((wallet) => {
    if (!installedIds.has(wallet.id) || wallet.id === 'ethereum') {
      allWallets.push({
        id: wallet.id,
        name: wallet.name,
        icon: wallet.icon,
        description: 'Browser wallet extension',
        installed: true,
      });
    }
  });

  // Sort: installed first, then by name
  return allWallets.sort((a, b) => {
    if (a.installed && !b.installed) return -1;
    if (!a.installed && b.installed) return 1;
    return a.name.localeCompare(b.name);
  });
};

// Cache detected wallets to maintain provider references
let cachedWallets = null;

/**
 * Get cached detected wallets (maintains provider references)
 */
export const getCachedWallets = () => {
  if (!cachedWallets) {
    cachedWallets = detectWallets();
  }
  return cachedWallets;
};

/**
 * Clear wallet cache (useful when wallets change)
 */
export const clearWalletCache = () => {
  cachedWallets = null;
};

/**
 * Get provider for specific wallet
 */
export const getWalletProvider = (walletId) => {
  const installedWallets = getCachedWallets();
  const wallet = installedWallets.find((w) => w.id === walletId);

  if (!wallet) {
    console.error(`Wallet ${walletId} not found in installed wallets`);
    return null;
  }

  return wallet.provider;
};
