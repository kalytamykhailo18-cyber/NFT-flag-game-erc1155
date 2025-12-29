/**
 * Profile - User profile with owned slices and claimed places
 */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import IPFSImage from '../components/IPFSImage';
import config from '../config';
import api from '../services/api';

const Profile = () => {
  const { address, isConnected } = useSelector((state) => state.wallet);
  const [user, setUser] = useState(null);
  const [ownedSlices, setOwnedSlices] = useState([]);
  const [claimedPlaces, setClaimedPlaces] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('slices');
  const [activeAuctions, setActiveAuctions] = useState(new Set());

  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get user info
        const userResponse = await api.getUser(address);
        setUser(userResponse.data || userResponse);

        // Get owned slices
        const slicesResponse = await api.getUserSlices(address);
        setOwnedSlices(slicesResponse.data || slicesResponse || []);

        // Get claimed places
        const placesResponse = await api.getUserPlaces(address);
        const places = placesResponse.data || placesResponse || [];
        setClaimedPlaces(places);

        // Check for active auctions on claimed places
        const auctionsResponse = await api.getAuctions({ status: 'active' });
        const auctions = auctionsResponse.data || auctionsResponse || [];
        const activePlaceIds = new Set(auctions.map(a => a.place_id));
        setActiveAuctions(activePlaceIds);

        // Get won auctions (where user is the winner)
        const allAuctionsResponse = await api.getAuctions({});
        const allAuctions = allAuctionsResponse.data || allAuctionsResponse || [];
        const won = allAuctions.filter(
          a => a.winner && a.winner.wallet_address?.toLowerCase() === address.toLowerCase()
        );
        setWonAuctions(won);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-300 text-lg mb-4">Connect your wallet to view your profile</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-dark-lighter rounded-lg mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-dark-lighter rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'plus':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user?.username || 'Unnamed Collector'}
            </h1>
            <p className="text-gray-200 mt-1">
              {config.truncateAddress(address)}
            </p>
          </div>
          <span className={`px-4 py-2 text-sm rounded border capitalize ${getCategoryBadge(user?.category || 'standard')}`}>
            {user?.category || 'standard'} Member
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-dark rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {user?.total_places_claimed || 0}
            </div>
            <div className="text-gray-200 text-sm">Places Claimed</div>
          </div>
          <div className="bg-dark rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {user?.total_slices_owned || 0}
            </div>
            <div className="text-gray-200 text-sm">Slices Owned</div>
          </div>
          <div className="bg-dark rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {user?.reputation_score || 0}
            </div>
            <div className="text-gray-200 text-sm">Reputation</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('slices')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'slices'
              ? 'bg-primary text-white'
              : 'bg-dark-lighter text-gray-200 hover:text-white'
          }`}
        >
          Owned Slices ({ownedSlices.length})
        </button>
        <button
          onClick={() => setActiveTab('places')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'places'
              ? 'bg-primary text-white'
              : 'bg-dark-lighter text-gray-200 hover:text-white'
          }`}
        >
          Claimed Places ({claimedPlaces.length})
        </button>
        <button
          onClick={() => setActiveTab('won-auctions')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'won-auctions'
              ? 'bg-primary text-white'
              : 'bg-dark-lighter text-gray-200 hover:text-white'
          }`}
        >
          Won Auctions ({wonAuctions.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'won-auctions' ? (
        wonAuctions.length === 0 ? (
          <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
            <div className="text-gray-300 text-lg mb-2">No auctions won yet</div>
            <Link to="/auctions" className="text-primary hover:text-primary/80">
              Browse auctions to start bidding
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wonAuctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden"
              >
                <Link to={`/auctions/${auction.id}`} className="block hover:opacity-80 transition-opacity">
                  <div className="aspect-video bg-dark relative">
                    <IPFSImage
                      uri={auction.place?.base_image_uri}
                      alt={auction.place?.name}
                      className="w-full h-full object-cover"
                      fallbackText="No Image"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 text-white text-xs rounded">
                      Won
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/auctions/${auction.id}`} className="block hover:text-primary transition-colors">
                    <h3 className="text-white font-semibold">{auction.place?.name || `Place #${auction.place_id}`}</h3>
                  </Link>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Final Price:</span>
                      <span className="text-primary font-bold">{config.formatPrice(auction.final_price)} MATIC</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Status:</span>
                      <span className="text-green-400 capitalize">{auction.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Bids:</span>
                      <span className="text-white">{auction.bids?.length || 0}</span>
                    </div>
                  </div>
                  <Link
                    to={`/auctions/${auction.id}`}
                    className="block w-full mt-4 px-4 py-2 bg-primary text-white text-center rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'slices' ? (
        ownedSlices.length === 0 ? (
          <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
            <div className="text-gray-300 text-lg mb-2">No slices owned yet</div>
            <Link to="/places" className="text-primary hover:text-primary/80">
              Browse places to start collecting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ownedSlices
              .sort((a, b) => {
                // Sort by place_id first
                if (a.place_id !== b.place_id) return a.place_id - b.place_id;
                // Then by pair_number
                if (a.slice?.pair_number !== b.slice?.pair_number) {
                  return (a.slice?.pair_number || 0) - (b.slice?.pair_number || 0);
                }
                // Then by position (left before right)
                const posOrder = { left: 0, right: 1 };
                return (posOrder[a.slice?.slice_position] || 0) - (posOrder[b.slice?.slice_position] || 0);
              })
              .map((userSlice) => (
              <Link
                key={userSlice.id}
                to={`/places/${userSlice.place_id}`}
                className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="aspect-square bg-dark">
                  <IPFSImage
                    uri={userSlice.slice?.slice_uri}
                    alt={`Slice ${userSlice.slice?.pair_number}-${userSlice.slice?.slice_position}`}
                    className="w-full h-full object-cover"
                    fallbackText="No Image"
                  />
                </div>
                <div className="p-2">
                  <div className="text-white text-sm font-medium truncate">
                    {userSlice.place?.name || `Place #${userSlice.place_id}`}
                  </div>
                  <div className="text-gray-300 text-xs">
                    Pair {userSlice.slice?.pair_number}, Pos {userSlice.slice?.slice_position}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        claimedPlaces.length === 0 ? (
          <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
            <div className="text-gray-300 text-lg mb-2">No places claimed yet</div>
            <p className="text-gray-500">Complete all pairs of a place to claim it</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claimedPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden"
              >
                <Link to={`/places/${place.id}`} className="block hover:opacity-80 transition-opacity">
                  <div className="aspect-video bg-dark">
                    <IPFSImage
                      uri={place.base_image_uri}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      fallbackText="No Image"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/places/${place.id}`} className="block hover:text-primary transition-colors">
                    <h3 className="text-white font-semibold">{place.name}</h3>
                    <p className="text-gray-200 text-sm mt-1">
                      {place.municipality?.name}
                    </p>
                  </Link>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-gray-300 text-sm">Token ID: {place.token_id}</span>
                    <span className="text-green-400 text-sm">Claimed</span>
                  </div>
                  {!activeAuctions.has(place.id) ? (
                    <Link
                      to="/auctions"
                      state={{ placeId: place.id, placeName: place.name }}
                      className="block w-full mt-4 px-4 py-2 bg-primary text-white text-center rounded-lg hover:bg-primary/80 transition-colors"
                    >
                      Create Auction
                    </Link>
                  ) : (
                    <div className="block w-full mt-4 px-4 py-2 bg-gray-700 text-gray-300 text-center rounded-lg border border-gray-600">
                      Active Auction Exists
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
