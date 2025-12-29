/**
 * Auctions - List active and completed auctions
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuctions, selectAuctions, selectAuctionLoading } from '../store/slices/auctionSlice';
import IPFSImage from '../components/IPFSImage';
import config from '../config';
import api from '../services/api';

const Auctions = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const auctions = useSelector(selectAuctions);
  const loading = useSelector(selectAuctionLoading);
  const { address, isConnected } = useSelector((state) => state.wallet);
  const [filter, setFilter] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    place_id: '',
    min_price: '',
    max_price: '',
    duration_hours: '24',
  });

  // Auto-open modal if coming from Profile with placeId
  useEffect(() => {
    if (location.state?.placeId) {
      setFormData({
        ...formData,
        place_id: location.state.placeId.toString(),
      });
      setShowCreateModal(true);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    dispatch(fetchAuctions({ status: filter }));
  }, [dispatch, filter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-200';
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

  const handleCreateAuction = async (e) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setCreateLoading(true);
    try {
      await api.createAuction({
        ...formData,
        wallet_address: address,
      });
      alert('Auction created successfully!');
      setShowCreateModal(false);
      setFormData({ place_id: '', min_price: '', max_price: '', duration_hours: '24' });
      dispatch(fetchAuctions({ status: filter }));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create auction');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Auctions</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['active', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-sm font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-200 hover:text-white'
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
          <div className="text-gray-300 text-lg">No {filter} auctions</div>
        </div>
      ) : (
        <div className="space-y-4">
          {auctions.map((auction) => (
            <Link
              key={auction.id}
              to={`/auctions/${auction.id}`}
              className="block bg-dark-lighter border border-gray-800 rounded-sm p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-6">
                {/* Place Image */}
                <div className="w-24 h-24 bg-dark rounded flex-shrink-0 overflow-hidden">
                  <IPFSImage
                    uri={auction.place?.base_image_uri}
                    alt={auction.place?.name || 'Place'}
                    className="w-full h-full object-cover"
                    fallbackText="No Image"
                  />
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
                      <span className="text-gray-300">Min Price:</span>
                      <span className="text-white ml-2">{config.formatPrice(auction.min_price)} MATIC</span>
                    </div>
                    {auction.max_price && (
                      <div>
                        <span className="text-gray-300">Buyout:</span>
                        <span className="text-yellow-400 ml-2">{config.formatPrice(auction.max_price)} MATIC</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-300">Bids:</span>
                      <span className="text-white ml-2">{auction.bids?.length || 0}</span>
                    </div>
                    {auction.status === 'active' && (
                      <div>
                        <span className="text-gray-300">Time Left:</span>
                        <span className="text-yellow-400 ml-2">{formatTimeLeft(auction.end_time)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final/Current Price */}
                <div className="text-right">
                  <div className="text-gray-300 text-sm">
                    {auction.status === 'completed' ? 'Final Price' : 'Highest Bid'}
                  </div>
                  <div className="text-primary font-bold text-xl">
                    {auction.final_price ? config.formatPrice(auction.final_price) : (auction.bids && auction.bids.length > 0 ? config.formatPrice(Math.max(...auction.bids.map(b => parseFloat(b.amount)))) : config.formatPrice(auction.min_price))} MATIC
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Create Auction</h2>
            <form onSubmit={handleCreateAuction} className="space-y-4">
              <div>
                <label className="block text-gray-200 text-sm mb-2">Place</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={location.state?.placeName ? `${location.state.placeName} (ID: ${formData.place_id})` : `Place ID: ${formData.place_id}`}
                    className="flex-1 px-3 py-2 bg-dark border border-gray-700 rounded text-gray-300 cursor-not-allowed"
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  You can only create auctions for places you own
                </p>
              </div>
              <div>
                <label className="block text-gray-200 text-sm mb-2">Minimum Price (MATIC)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={formData.min_price}
                  onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded text-white focus:border-primary outline-none"
                  placeholder="0.05"
                />
              </div>
              <div>
                <label className="block text-gray-200 text-sm mb-2">Buyout Price (MATIC) - Optional</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.max_price}
                  onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded text-white focus:border-primary outline-none"
                  placeholder="0.10"
                />
              </div>
              <div>
                <label className="block text-gray-200 text-sm mb-2">Duration (hours)</label>
                <select
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded text-white focus:border-primary outline-none"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">3 days</option>
                  <option value="168">1 week</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-sm hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Creating...' : 'Create Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auctions;
