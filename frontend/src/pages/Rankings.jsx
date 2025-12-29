/**
 * Rankings - User and place leaderboards
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';
import api from '../services/api';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [userRankings, setUserRankings] = useState([]);
  const [placeRankings, setPlaceRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        if (activeTab === 'users') {
          const response = await api.getUserRankings();
          setUserRankings(response.data || response || []);
        } else {
          const response = await api.getPlaceRankings();
          setPlaceRankings(response.data || response || []);
        }
      } catch (err) {
        console.error('Failed to fetch rankings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Rankings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-primary text-white'
              : 'bg-dark-lighter text-gray-200 hover:text-white'
          }`}
        >
          Top Collectors
        </button>
        <button
          onClick={() => setActiveTab('places')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'places'
              ? 'bg-primary text-white'
              : 'bg-dark-lighter text-gray-200 hover:text-white'
          }`}
        >
          Popular Places
        </button>
      </div>

      {/* Rankings Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-dark-lighter rounded-lg animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'users' ? (
        <UserRankings rankings={userRankings} />
      ) : (
        <PlaceRankings rankings={placeRankings} />
      )}
    </div>
  );
};

const UserRankings = ({ rankings }) => {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
        <div className="text-gray-300 text-lg">No rankings available</div>
      </div>
    );
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-300 text-black';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-dark text-gray-200';
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'premium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'special':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-200';
    }
  };

  return (
    <div className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-dark">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Category</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-200 uppercase">Places Claimed</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-200 uppercase">Slices Owned</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-200 uppercase">Reputation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rankings.map((user, index) => (
            <tr key={user.id} className="hover:bg-dark/50">
              <td className="px-4 py-4">
                <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold ${getRankBadge(index + 1)}`}>
                  {index + 1}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="text-white font-medium">
                  {user.username || config.truncateAddress(user.wallet_address)}
                </div>
                <div className="text-gray-300 text-sm">
                  {config.truncateAddress(user.wallet_address)}
                </div>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 py-1 text-xs rounded capitalize ${getCategoryBadge(user.category)}`}>
                  {user.category}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-white font-medium">
                {user.total_places_claimed}
              </td>
              <td className="px-4 py-4 text-right text-gray-200">
                {user.total_slices_owned}
              </td>
              <td className="px-4 py-4 text-right text-primary font-medium">
                {user.reputation_score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PlaceRankings = ({ rankings }) => {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
        <div className="text-gray-300 text-lg">No rankings available</div>
      </div>
    );
  }

  return (
    <div className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-dark">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Place</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Category</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-200 uppercase">Interest</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-200 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rankings.map((place, index) => (
            <tr key={place.id} className="hover:bg-dark/50">
              <td className="px-4 py-4">
                <span className="text-gray-200 font-medium">#{index + 1}</span>
              </td>
              <td className="px-4 py-4">
                <Link
                  to={`/places/${place.id}`}
                  className="flex items-center gap-3 hover:text-primary"
                >
                  <div className="w-12 h-12 bg-dark rounded overflow-hidden flex-shrink-0">
                    {place.base_image_uri ? (
                      <img
                        src={config.ipfsToHttp(place.base_image_uri)}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        -
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{place.name}</div>
                    <div className="text-gray-300 text-sm">{place.municipality?.name}</div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 py-1 text-xs rounded capitalize ${
                  place.category === 'premium' ? 'bg-yellow-500/20 text-yellow-400' :
                  place.category === 'special' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-200'
                }`}>
                  {place.category}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-primary font-medium">
                {place.interest_count || 0}
              </td>
              <td className="px-4 py-4 text-right">
                {place.is_claimed ? (
                  <span className="text-green-400">Claimed</span>
                ) : (
                  <span className="text-gray-200">Available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rankings;
