/**
 * Places - List and filter places
 * Can show all places OR places for a specific municipality
 */
import { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaces, selectPlaces, selectPlaceLoading } from '../store/slices/placeSlice';
import { selectCurrentMunicipality } from '../store/slices/geographySlice';
import PlaceCard from '../components/PlaceCard';
import api from '../services/api';

const Places = () => {
  const { municipalityId } = useParams();
  const dispatch = useDispatch();
  const places = useSelector(selectPlaces);
  const municipality = useSelector(selectCurrentMunicipality);
  const loading = useSelector(selectPlaceLoading);
  const { address } = useSelector((state) => state.wallet);
  const [searchParams, setSearchParams] = useSearchParams();
  const [municipalityData, setMunicipalityData] = useState(null);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    is_claimed: searchParams.get('is_claimed') || '',
  });

  // Fetch municipality details if viewing municipality places
  useEffect(() => {
    if (municipalityId) {
      api.getMunicipality(municipalityId)
        .then(response => {
          setMunicipalityData(response.data);
        })
        .catch(err => {
          console.error('Failed to fetch municipality:', err);
        });
    }
  }, [municipalityId]);

  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.is_claimed) params.is_claimed = filters.is_claimed;

    // Add municipality filter if viewing specific municipality
    if (municipalityId) {
      params.municipality_id = municipalityId;
    }

    dispatch(fetchPlaces({ params, walletAddress: address }));
  }, [dispatch, filters, municipalityId, address]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.is_claimed) params.set('is_claimed', newFilters.is_claimed);
    setSearchParams(params);
  };

  const currentMunicipality = municipalityData || municipality;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb - only show if viewing municipality places */}
      {municipalityId && currentMunicipality && (
        <nav className="text-sm text-gray-200 mb-6">
          <Link to="/countries" className="hover:text-white">Countries</Link>
          <span className="mx-2">/</span>
          <Link
            to={`/countries/${currentMunicipality.region?.country_id || currentMunicipality.region?.country?.id}/regions`}
            className="hover:text-white"
          >
            {currentMunicipality.region?.country?.name || 'Country'}
          </Link>
          <span className="mx-2">/</span>
          <Link to={`/regions/${currentMunicipality.region_id}/municipalities`} className="hover:text-white">
            {currentMunicipality.region?.name || 'Region'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{currentMunicipality.name}</span>
        </nav>
      )}

      <h1 className="text-3xl font-bold text-white mb-6">
        {municipalityId && currentMunicipality ? `Places in ${currentMunicipality.name}` : 'All Places'}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-4 py-2 bg-dark-lighter border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Categories</option>
          <option value="standard">Standard</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
        </select>

        <select
          value={filters.is_claimed}
          onChange={(e) => handleFilterChange('is_claimed', e.target.value)}
          className="px-4 py-2 bg-dark-lighter border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Status</option>
          <option value="false">Available</option>
          <option value="true">Claimed</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-dark-lighter rounded-lg animate-pulse" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-300 text-lg">No places found</div>
          <p className="text-gray-500 mt-2">
            {municipalityId ? 'This municipality has no places' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Places;
