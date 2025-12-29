/**
 * IPFSImage - Optimized image component with fast loading and auto-fallback
 * Supports hidden/locked state for interest-based reveal
 */
import { useState, useEffect } from 'react';
import config from '../config';

const IPFSImage = ({ uri, alt, className = '', fallbackText = 'No Image', hidden = false }) => {
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Reset loading state when URI changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setGatewayIndex(0);
    setRetryCount(0);
  }, [uri]);

  const handleError = () => {
    // Try next gateway immediately
    const nextIndex = (gatewayIndex + 1) % config.IPFS_GATEWAYS.length;

    // If we've tried all gateways, show fallback
    if (nextIndex === 0 && retryCount > 0) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setGatewayIndex(nextIndex);
    setRetryCount(retryCount + 1);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Show locked/blurred placeholder for hidden images
  if (hidden) {
    return (
      <div className={`relative flex items-center justify-center bg-dark ${className}`}>
        {/* Blurred background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 opacity-50" />
        <div className="absolute inset-0 backdrop-blur-xl" />

        {/* Lock icon overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center text-gray-400">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-medium">Show Interest to View</span>
        </div>
      </div>
    );
  }

  if (!uri || hasError) {
    return (
      <div className={`flex items-center justify-center text-gray-500 bg-dark ${className}`}>
        {fallbackText}
      </div>
    );
  }

  const imageUrl = config.ipfsToHttp(uri, gatewayIndex);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        key={`${uri}-${gatewayIndex}`}
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
};

export default IPFSImage;
