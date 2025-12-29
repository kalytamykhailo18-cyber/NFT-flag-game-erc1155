/**
 * PlacesTab - CRUD for places with minting
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminData, mintPlace, selectAdminPlaces, selectAdminMunicipalities, selectAdminLoading } from '../../store/slices/adminSlice';
import api from '../../services/api';

const PlacesTab = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const places = useSelector(selectAdminPlaces);
  const municipalities = useSelector(selectAdminMunicipalities);
  const loading = useSelector(selectAdminLoading);

  const [filter, setFilter] = useState('all');
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [mintingId, setMintingId] = useState(null);

  const apiKey = useSelector(state => state.admin.apiKey);

  const filteredPlaces = places
    .filter((place) => {
      const matchesMunicipality = !filterMunicipality || place.municipality_id === parseInt(filterMunicipality);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'minted' && place.is_minted) ||
        (filter === 'unminted' && !place.is_minted) ||
        filter === place.category;
      return matchesMunicipality && matchesFilter;
    });

  const handleMint = async (placeId) => {
    if (!window.confirm('Are you sure you want to mint this place?')) return;

    setMintingId(placeId);
    try {
      await dispatch(mintPlace(placeId)).unwrap();
      dispatch(fetchAdminData());
    } catch (err) {
      alert(err || 'Failed to mint place');
    } finally {
      setMintingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;

    try {
      await api.adminDeletePlace(apiKey, id);
      dispatch(fetchAdminData());
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const getMunicipalityName = (municipalityId) => {
    const municipality = municipalities.find(m => m.id === municipalityId);
    return municipality?.name || 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Places</h2>
        <p className="text-gray-400 text-sm">Use "Generate Place" tab to create new places</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterMunicipality}
          onChange={(e) => setFilterMunicipality(e.target.value)}
          className="px-4 py-2 bg-dark-lighter border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Municipalities</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
          <FilterButton active={filter === 'minted'} onClick={() => setFilter('minted')}>Minted</FilterButton>
          <FilterButton active={filter === 'unminted'} onClick={() => setFilter('unminted')}>Unminted</FilterButton>
          <FilterButton active={filter === 'standard'} onClick={() => setFilter('standard')}>Standard</FilterButton>
          <FilterButton active={filter === 'special'} onClick={() => setFilter('special')}>Special</FilterButton>
          <FilterButton active={filter === 'premium'} onClick={() => setFilter('premium')}>Premium</FilterButton>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-dark-lighter rounded animate-pulse" />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-500 text-lg">No places found</div>
        </div>
      ) : (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Place</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Municipality</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Pairs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Token ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-dark/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-dark rounded overflow-hidden flex-shrink-0">
                        {place.base_image_uri ? (
                          <img
                            src={place.base_image_uri}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                            -
                          </div>
                        )}
                      </div>
                      <span className="text-white font-medium">{place.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{getMunicipalityName(place.municipality_id)}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={place.category} />
                  </td>
                  <td className="px-4 py-3 text-white">{place.pair_count}</td>
                  <td className="px-4 py-3 text-gray-400">{place.token_id || '-'}</td>
                  <td className="px-4 py-3">
                    {place.is_minted ? (
                      <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Minted</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded">Not Minted</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/places/${place.id}`)}
                      className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors mr-2"
                    >
                      View
                    </button>
                    {!place.is_minted && (
                      <>
                        <button
                          onClick={() => handleMint(place.id)}
                          disabled={mintingId === place.id}
                          className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/80 transition-colors disabled:opacity-50 mr-2"
                        >
                          {mintingId === place.id ? 'Minting...' : 'Mint'}
                        </button>
                        <button
                          onClick={() => handleDelete(place.id)}
                          className="px-3 py-1 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
      active
        ? 'bg-primary text-white'
        : 'bg-dark text-gray-400 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const CategoryBadge = ({ category }) => {
  const classes = {
    premium: 'bg-yellow-500/20 text-yellow-400',
    plus: 'bg-blue-500/20 text-blue-400',
    standard: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded capitalize ${classes[category] || classes.standard}`}>
      {category}
    </span>
  );
};

export default PlacesTab;
