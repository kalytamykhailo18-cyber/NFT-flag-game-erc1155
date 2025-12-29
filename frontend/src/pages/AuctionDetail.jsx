/**
 * AuctionDetail - Auction detail with bidding functionality
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuctionDetail, selectCurrentAuction, selectAuctionLoading } from '../store/slices/auctionSlice';
import IPFSImage from '../components/IPFSImage';
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
  const [ending, setEnding] = useState(false);

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

  const handleEndAuction = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!confirm('Are you sure you want to end this auction? This action cannot be undone.')) {
      return;
    }

    setEnding(true);
    try {
      await api.endAuction(id, address);
      dispatch(fetchAuctionDetail(id));
      alert('Auction ended successfully!');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to end auction');
    } finally {
      setEnding(false);
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

  const highestBid = auction.bids && auction.bids.length > 0
    ? Math.max(...auction.bids.map(b => parseFloat(b.amount)))
    : parseFloat(auction.min_price);
  const isActive = auction.status === 'active';
  const isSeller = address && auction.seller?.wallet_address?.toLowerCase() === address.toLowerCase();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-200 mb-6">
        <Link to="/auctions" className="hover:text-white">Auctions</Link>
        <span className="mx-2">/</span>
        <span className="text-white">Auction #{auction.id}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Place Info */}
        <div>
          <div className="aspect-video bg-dark rounded-lg overflow-hidden mb-4">
            <IPFSImage
              uri={auction.place?.base_image_uri}
              alt={auction.place?.name || 'Place'}
              className="w-full h-full object-cover"
              fallbackText="No Image"
            />
          </div>

          <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {auction.place?.name || `Place #${auction.place_id}`}
            </h1>
            <p className="text-gray-200">
              Token ID: {auction.place?.token_id}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Status:</span>
                <span className={`ml-2 capitalize ${
                  auction.status === 'active' ? 'text-green-400' :
                  auction.status === 'ended' ? 'text-blue-400' :
                  'text-red-400'
                }`}>
                  {auction.status}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Created by:</span>
                <span className="text-white ml-2">
                  {config.truncateAddress(auction.seller?.wallet_address)}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Start:</span>
                <span className="text-white ml-2">{formatDate(auction.start_time)}</span>
              </div>
              <div>
                <span className="text-gray-300">End:</span>
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
              <div className="text-gray-200 mb-2">
                {auction.status === 'completed' ? 'Final Price' : 'Highest Bid'}
              </div>
              <div className="text-4xl font-bold text-primary">
                {auction.final_price ? config.formatPrice(auction.final_price) : config.formatPrice(highestBid)} MATIC
              </div>
              <div className="text-gray-300 mt-2">
                Min Price: {config.formatPrice(auction.min_price)} MATIC
                {auction.max_price && (
                  <> | Buyout: {config.formatPrice(auction.max_price)} MATIC</>
                )}
              </div>
            </div>

            {isActive && (
              <div className="mt-6 space-y-4">
                {isSeller ? (
                  <>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                      <div className="text-yellow-400">You cannot bid on your own auction</div>
                    </div>
                    <button
                      onClick={handleEndAuction}
                      disabled={ending}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {ending ? 'Ending Auction...' : 'End Auction'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Bid Input */}
                    <div>
                      <label className="block text-gray-200 text-sm mb-2">Your Bid (MATIC)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Min: ${auction.min_price}`}
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
                  </>
                )}
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
              <div className="text-gray-300 text-center py-4">No bids yet</div>
            ) : (
              <div className="space-y-3">
                {[...auction.bids]
                  .sort((a, b) => {
                    // Sort by amount DESC, then by time ASC
                    const amountDiff = parseFloat(b.amount) - parseFloat(a.amount);
                    if (amountDiff !== 0) return amountDiff;
                    const timeA = new Date(a.created_at || a.createdAt);
                    const timeB = new Date(b.created_at || b.createdAt);
                    return timeA - timeB;
                  })
                  .map((bid, index) => {
                    const createdAt = bid.created_at || bid.createdAt;
                    return (
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
                          <div className="text-gray-300 text-sm">
                            {config.truncateAddress(bid.bidder?.wallet_address)}
                          </div>
                        </div>
                        <div className="text-gray-300 text-sm">
                          {createdAt ? new Date(createdAt).toLocaleTimeString() : 'N/A'}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
