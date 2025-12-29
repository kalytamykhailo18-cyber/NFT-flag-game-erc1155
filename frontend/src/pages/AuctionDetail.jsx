/**
 * AuctionDetail - Auction detail with bidding functionality
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuctionDetail, selectCurrentAuction, selectAuctionLoading } from '../store/slices/auctionSlice';
import config from '../config';
import api from '../services/api';

const AuctionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const auction = useSelector(selectCurrentAuction);
  const loading = useSelector(selectAuctionLoading);
  const { address, isConnected } = useSelector((state) => state.wallet);

  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchAuctionDetail(id));
    }
  }, [dispatch, id]);

  const handleBid = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    setBidding(true);
    try {
      await api.placeBid(id, address, bidAmount);
      dispatch(fetchAuctionDetail(id));
      setBidAmount('');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Bid failed');
    } finally {
      setBidding(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading || !auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-lighter rounded w-1/3 mb-4" />
          <div className="h-64 bg-dark-lighter rounded mb-6" />
        </div>
      </div>
    );
  }

  const currentBid = auction.current_price;
  const isActive = auction.status === 'active';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/auctions" className="hover:text-white">Auctions</Link>
        <span className="mx-2">/</span>
        <span className="text-white">Auction #{auction.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Place Info */}
        <div>
          <div className="aspect-video bg-dark rounded-lg overflow-hidden mb-4">
            {auction.place?.base_image_uri ? (
              <img
                src={config.ipfsToHttp(auction.place.base_image_uri)}
                alt={auction.place.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                No Image
              </div>
            )}
          </div>

          <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {auction.place?.name || `Place #${auction.place_id}`}
            </h1>
            <p className="text-gray-400">
              Token ID: {auction.place?.token_id}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 capitalize ${
                  auction.status === 'active' ? 'text-green-400' :
                  auction.status === 'ended' ? 'text-blue-400' :
                  'text-red-400'
                }`}>
                  {auction.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Created by:</span>
                <span className="text-white ml-2">
                  {config.truncateAddress(auction.seller?.wallet_address)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Start:</span>
                <span className="text-white ml-2">{formatDate(auction.start_time)}</span>
              </div>
              <div>
                <span className="text-gray-500">End:</span>
                <span className="text-white ml-2">{formatDate(auction.end_time)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bidding */}
        <div>
          {/* Current Price */}
          <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                {auction.status === 'ended' ? 'Final Price' : 'Current Bid'}
              </div>
              <div className="text-4xl font-bold text-primary">
                {config.formatPrice(currentBid)} MATIC
              </div>
              <div className="text-gray-500 mt-2">
                Starting: {config.formatPrice(auction.starting_price)} MATIC | Min Increment: {config.formatPrice(auction.min_increment)} MATIC
              </div>
            </div>

            {isActive && (
              <div className="mt-6 space-y-4">
                {/* Bid Input */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Your Bid (MATIC)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min: ${parseFloat(currentBid) + parseFloat(auction.min_increment || 0.001)}`}
                    className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleBid}
                  disabled={bidding || !isConnected}
                  className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {bidding ? 'Placing Bid...' : 'Place Bid'}
                </button>
              </div>
            )}

            {auction.status === 'ended' && auction.winner && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded">
                <div className="text-green-400 text-center">
                  Winner: {config.truncateAddress(auction.winner.wallet_address)}
                </div>
              </div>
            )}
          </div>

          {/* Bid History */}
          <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Bid History</h2>
            {!auction.bids || auction.bids.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No bids yet</div>
            ) : (
              <div className="space-y-3">
                {auction.bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`flex justify-between items-center p-3 rounded ${
                      index === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-dark'
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium">
                        {config.formatPrice(bid.amount)} MATIC
                      </div>
                      <div className="text-gray-500 text-sm">
                        {config.truncateAddress(bid.bidder?.wallet_address)}
                      </div>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {new Date(bid.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
