/**
 * Auctions - List active and completed auctions
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuctions, selectAuctions, selectAuctionLoading } from '../store/slices/auctionSlice';
import config from '../config';

const Auctions = () => {
  const dispatch = useDispatch();
  const auctions = useSelector(selectAuctions);
  const loading = useSelector(selectAuctionLoading);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    dispatch(fetchAuctions({ status: filter }));
  }, [dispatch, filter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'ended':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTimeLeft = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Auctions</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['active', 'ended', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Auctions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-dark-lighter rounded-lg animate-pulse" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-500 text-lg">No {filter} auctions</div>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map((auction) => (
            <Link
              key={auction.id}
              to={`/auctions/${auction.id}`}
              className="block bg-dark-lighter border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-6">
                {/* Place Image */}
                <div className="w-24 h-24 bg-dark rounded flex-shrink-0 overflow-hidden">
                  {auction.place?.base_image_uri ? (
                    <img
                      src={config.ipfsToHttp(auction.place.base_image_uri)}
                      alt={auction.place.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                {/* Auction Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">
                      {auction.place?.name || `Place #${auction.place_id}`}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded capitalize ${getStatusBadge(auction.status)}`}>
                      {auction.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Starting Price:</span>
                      <span className="text-white ml-2">{config.formatPrice(auction.starting_price)} MATIC</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Bids:</span>
                      <span className="text-white ml-2">{auction.bids?.length || 0}</span>
                    </div>
                    {auction.status === 'active' && (
                      <div>
                        <span className="text-gray-500">Time Left:</span>
                        <span className="text-yellow-400 ml-2">{formatTimeLeft(auction.end_time)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Bid */}
                <div className="text-right">
                  <div className="text-gray-500 text-sm">
                    {auction.status === 'ended' ? 'Final Price' : 'Current Bid'}
                  </div>
                  <div className="text-primary font-bold text-xl">
                    {config.formatPrice(auction.current_price)} MATIC
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Auctions;
