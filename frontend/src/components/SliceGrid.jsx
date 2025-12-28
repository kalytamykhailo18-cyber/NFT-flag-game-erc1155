/**
 * SliceGrid - Grid display of place slices organized by pairs
 */
import config from '../config';

const SliceGrid = ({ slices, pairCount, userOwnedSliceIds = [], onPurchase, disabled = false }) => {
  // Group slices by pair_number
  const slicesByPair = {};
  for (let i = 1; i <= pairCount; i++) {
    slicesByPair[i] = { 1: null, 2: null };
  }

  slices.forEach((slice) => {
    if (slicesByPair[slice.pair_number]) {
      slicesByPair[slice.pair_number][slice.slice_position] = slice;
    }
  });

  const isOwnedByUser = (sliceId) => userOwnedSliceIds.includes(sliceId);

  const getSliceStatus = (slice) => {
    if (!slice) return 'missing';
    if (isOwnedByUser(slice.id)) return 'owned_by_user';
    if (slice.is_owned) return 'owned';
    return 'available';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'owned_by_user':
        return 'border-blue-500 bg-blue-500/10';
      case 'owned':
        return 'border-gray-600 bg-gray-600/10 opacity-50';
      case 'available':
        return 'border-green-500 bg-green-500/10 hover:border-green-400';
      default:
        return 'border-gray-700 bg-gray-700/10';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'owned_by_user':
        return 'Owned by you';
      case 'owned':
        return 'Owned';
      case 'available':
        return 'Available';
      default:
        return 'Missing';
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(slicesByPair).map(([pairNumber, positions]) => (
        <div key={pairNumber} className="bg-dark-lighter border border-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Pair {pairNumber}</h4>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((position) => {
              const slice = positions[position];
              const status = getSliceStatus(slice);
              const canPurchase = status === 'available' && !disabled;

              return (
                <div
                  key={position}
                  className={`border-2 rounded-lg overflow-hidden transition-colors ${getStatusStyles(status)}`}
                >
                  {/* Image */}
                  <div className="aspect-square bg-dark">
                    {slice?.slice_uri ? (
                      <img
                        src={config.ipfsToHttp(slice.slice_uri)}
                        alt={`Slice ${pairNumber}-${position}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Position {position}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        status === 'available' ? 'bg-green-500/20 text-green-400' :
                        status === 'owned_by_user' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    {slice && (
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">
                          {config.formatPrice(slice.price)} MATIC
                        </span>
                        {canPurchase && onPurchase && (
                          <button
                            onClick={() => onPurchase(slice)}
                            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SliceGrid;
