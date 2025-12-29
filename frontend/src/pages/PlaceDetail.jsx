/**
 * PlaceDetail - Place detail with slices and progress
 *
 * Section 7.1 Requirements:
 * - Place name, location, category badge
 * - Base image (complete)
 * - Slice grid: pair_count rows, 2 columns
 * - Each slice shows: image, pair number, status, price, buy button
 * - Progress bar: {completed_pairs}/{pair_count} pairs complete
 * - Claim button (enabled only if is_ready_to_claim and wallet connected)
 * - Interest count and button
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaceDetail, selectCurrentPlace, selectPlaceLoading } from '../store/slices/placeSlice';
import { selectUserProgress } from '../store/slices/userSlice';
import SliceGrid from '../components/SliceGrid';
import ProgressBar from '../components/ProgressBar';
import config from '../config';
import api from '../services/api';

const PlaceDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const place = useSelector(selectCurrentPlace);
  const loading = useSelector(selectPlaceLoading);
  const { address, isConnected } = useSelector((state) => state.wallet);
  const userProgress = useSelector((state) => selectUserProgress(state, id));

  const [purchasing, setPurchasing] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPlaceDetail(id));
    }
  }, [dispatch, id]);

  const getCategoryClass = (category) => {
    switch (category) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'special':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const handlePurchaseSlice = async (slice) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setPurchasing(slice.id);
    try {
      await api.purchaseSlice(slice.id, address);
      dispatch(fetchPlaceDetail(id));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const handleClaim = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setClaiming(true);
    try {
      await api.claimPlace(id, address);
      dispatch(fetchPlaceDetail(id));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  const handleToggleInterest = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setInterestLoading(true);
    try {
      if (isInterested) {
        await api.removeInterest(id, address);
        setIsInterested(false);
      } else {
        await api.addInterest(id, address);
        setIsInterested(true);
      }
      dispatch(fetchPlaceDetail(id));
    } catch (err) {
      console.error('Interest toggle failed:', err);
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading || !place) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-lighter rounded w-1/3 mb-4" />
          <div className="h-64 bg-dark-lighter rounded mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-dark-lighter rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progress = userProgress || {
    owned_slices: 0,
    total_slices: place.pair_count * 2,
    completed_pairs: 0,
    pair_count: place.pair_count,
    is_ready_to_claim: false,
  };

  const userOwnedSliceIds = place.slices
    ?.filter((s) => s.owned_by === address)
    .map((s) => s.id) || [];

  const canClaim = progress.is_ready_to_claim && isConnected && !place.is_claimed;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-200 mb-6">
        <Link to="/places" className="hover:text-white">Places</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{place.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Image and Info */}
        <div>
          {/* Base Image */}
          <div className="aspect-video bg-dark rounded-lg overflow-hidden mb-4">
            {place.base_image_uri ? (
              <img
                src={config.ipfsToHttp(place.base_image_uri)}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Place Info */}
          <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{place.name}</h1>
                <p className="text-gray-200">
                  {place.municipality?.name}, {place.municipality?.region?.name}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm rounded border capitalize ${getCategoryClass(place.category)}`}>
                {place.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Location Type:</span>
                <span className="text-white ml-2">{place.location_type}</span>
              </div>
              <div>
                <span className="text-gray-300">Token ID:</span>
                <span className="text-white ml-2">{place.token_id}</span>
              </div>
              <div>
                <span className="text-gray-300">Price:</span>
                <span className="text-primary ml-2">{config.formatPrice(place.price)} MATIC</span>
              </div>
            </div>

            {/* Interest */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-gray-200">
                {place.interest_count || 0} people interested
              </span>
              {!place.is_claimed && (
                <button
                  onClick={handleToggleInterest}
                  disabled={interestLoading || !isConnected}
                  className={`px-4 py-2 rounded text-sm transition-colors ${
                    isInterested
                      ? 'bg-primary/20 text-primary border border-primary'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isInterested ? 'Interested' : 'Add Interest'}
                </button>
              )}
            </div>

            {place.is_claimed && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
                <span className="text-green-400">
                  Claimed by {config.truncateAddress(place.claimer?.wallet_address)}
                </span>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Progress</h2>
              <span className="text-gray-200 text-sm">{place.pair_count} pairs total</span>
            </div>
            <ProgressBar
              current={progress.completed_pairs}
              total={progress.pair_count}
              label="Pairs complete"
            />
            <p className="text-gray-200 text-sm mt-2">
              {progress.owned_slices} of {progress.total_slices} slices owned
            </p>

            {/* Claim Button */}
            <button
              onClick={handleClaim}
              disabled={!canClaim || claiming}
              className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors ${
                canClaim
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-700 text-gray-200 cursor-not-allowed'
              }`}
            >
              {claiming
                ? 'Claiming...'
                : place.is_claimed
                ? 'Already Claimed'
                : canClaim
                ? 'Claim This Place!'
                : 'Complete all pairs to claim'}
            </button>
          </div>
        </div>

        {/* Right: Slices Grid */}
        <div>
          <SliceGrid
            slices={place.slices || []}
            pairCount={place.pair_count}
            userOwnedSliceIds={userOwnedSliceIds}
            onPurchase={handlePurchaseSlice}
            disabled={place.is_claimed || purchasing !== null}
          />
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
