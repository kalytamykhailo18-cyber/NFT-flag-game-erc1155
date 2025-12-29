/**
 * Profile - User profile with owned slices and claimed places
 */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import config from '../config';
import api from '../services/api';

const Profile = () => {
  const { address, isConnected } = useSelector((state) => state.wallet);
  const [user, setUser] = useState(null);
  const [ownedSlices, setOwnedSlices] = useState([]);
  const [claimedPlaces, setClaimedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('slices');

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
        setClaimedPlaces(placesResponse.data || placesResponse || []);
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
      case 'special':
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
      </div>

      {/* Content */}
      {activeTab === 'slices' ? (
        ownedSlices.length === 0 ? (
          <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
            <div className="text-gray-300 text-lg mb-2">No slices owned yet</div>
            <Link to="/places" className="text-primary hover:text-primary/80">
              Browse places to start collecting
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ownedSlices.map((slice) => (
              <Link
                key={slice.id}
                to={`/places/${slice.place_id}`}
                className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="aspect-square bg-dark">
                  {slice.slice_uri ? (
                    <img
                      src={config.ipfsToHttp(slice.slice_uri)}
                      alt={`Slice ${slice.pair_number}-${slice.slice_position}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <div className="text-white text-sm font-medium truncate">
                    {slice.place?.name || `Place #${slice.place_id}`}
                  </div>
                  <div className="text-gray-300 text-xs">
                    Pair {slice.pair_number}, Pos {slice.slice_position}
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
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="aspect-video bg-dark">
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
                <div className="p-4">
                  <h3 className="text-white font-semibold">{place.name}</h3>
                  <p className="text-gray-200 text-sm mt-1">
                    {place.municipality?.name}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-gray-300 text-sm">Token ID: {place.token_id}</span>
                    <span className="text-green-400 text-sm">Claimed</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
