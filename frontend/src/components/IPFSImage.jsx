/**
 * IPFSImage - Image component with automatic gateway fallback
 * Handles IPFS gateway rate limits by trying multiple gateways
 */
import { useState } from 'react';
import config from '../config';

const IPFSImage = ({ uri, alt, className = '', fallbackText = 'No Image' }) => {
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    const nextIndex = config.getNextGateway(gatewayIndex);

    // If we've tried all gateways, show fallback
    if (nextIndex === 0) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Try next gateway
    setGatewayIndex(nextIndex);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (!uri || hasError) {
    return (
      <div className={`flex items-center justify-center text-gray-500 bg-dark ${className}`}>
        {fallbackText}
      </div>
    );
  }

  const imageUrl = config.ipfsToHttp(uri, gatewayIndex);

  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center text-gray-500 bg-dark ${className}`}>
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
};

export default IPFSImage;
