/**
 * PlaceCard - Display card for a place
 */
import { Link } from 'react-router-dom';
import config from '../config';
import ProgressBar from './ProgressBar';
import IPFSImage from './IPFSImage';

const PlaceCard = ({ place, userProgress = null }) => {
  const getCategoryClass = (category) => {
    switch (category) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'plus':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const progress = userProgress || {
    completed_pairs: 0,
    pair_count: place.pair_count,
  };

  return (
    <Link
      to={`/places/${place.id}`}
      className="block bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
    >
      {/* Image */}
      <div className="aspect-video bg-dark relative">
        <IPFSImage
          uri={place.base_image_uri}
          alt={place.name}
          className="w-full h-full object-cover"
          fallbackText="No Image"
          hidden={place.base_image_hidden || false}
        />

        {/* Category badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs rounded border capitalize ${getCategoryClass(place.category)}`}>
            {place.category}
          </span>
        </div>

        {/* Claimed badge */}
        {place.is_claimed && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
              Claimed
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">{place.name}</h3>
        <p className="text-gray-200 text-sm truncate mt-1">
          {place.municipality?.name || 'Unknown location'}
        </p>

        {/* Progress */}
        <div className="mt-3">
          <ProgressBar
            current={progress.completed_pairs}
            total={progress.pair_count}
            label="Pairs"
          />
        </div>

        {/* Price and Interest */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-primary font-medium">
            {config.formatPrice(place.price)} MATIC
          </span>
          {place.interest_count > 0 && (
            <span className="text-gray-300 text-sm">
              {place.interest_count} interested
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PlaceCard;
