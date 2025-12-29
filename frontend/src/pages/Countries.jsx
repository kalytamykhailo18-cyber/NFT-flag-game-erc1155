/**
 * Countries - List all countries
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries, selectCountries, selectGeographyLoading } from '../store/slices/geographySlice';

const Countries = () => {
  const dispatch = useDispatch();
  const countries = useSelector(selectCountries);
  const loading = useSelector(selectGeographyLoading);

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Countries</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-dark-lighter rounded-lg animate-pulse" />
          ))}
        </div>
      ) : countries.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-300 text-lg">No countries available</div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {countries.map((country) => (
            <Link
              key={country.id}
              to={`/countries/${country.id}/regions`}
              className="bg-dark-lighter flex-1 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white font-semibold text-lg">{country.name}</h2>
                  <p className="text-gray-200 text-sm">{country.code}</p>
                </div>
                <div className="text-right">
                  <div className="text-primary font-medium">
                    {country.region_count || 0}
                  </div>
                  <div className="text-gray-300 text-sm">regions</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Countries;
