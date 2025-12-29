/**
 * Places - List and filter places
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaces, selectPlaces, selectPlaceLoading } from '../store/slices/placeSlice';
import PlaceCard from '../components/PlaceCard';

const Places = () => {
  const dispatch = useDispatch();
  const places = useSelector(selectPlaces);
  const loading = useSelector(selectPlaceLoading);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    is_claimed: searchParams.get('is_claimed') || '',
  });

  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.is_claimed) params.is_claimed = filters.is_claimed;
    dispatch(fetchPlaces(params));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.is_claimed) params.set('is_claimed', newFilters.is_claimed);
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">All Places</h1>

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
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
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
