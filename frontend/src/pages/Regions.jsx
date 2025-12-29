/**
 * Regions - List regions for a country
 */
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountryRegions, selectRegions, selectGeographyLoading, selectCurrentCountry } from '../store/slices/geographySlice';

const Regions = () => {
  const { countryId } = useParams();
  const dispatch = useDispatch();
  const regions = useSelector(selectRegions);
  const country = useSelector(selectCurrentCountry);
  const loading = useSelector(selectGeographyLoading);

  useEffect(() => {
    if (countryId) {
      dispatch(fetchCountryRegions(countryId));
    }
  }, [dispatch, countryId]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-200 mb-6">
        <Link to="/countries" className="hover:text-white">Countries</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{country?.name || 'Loading...'}</span>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-6">
        Regions in {country?.name || 'Loading...'}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-dark-lighter rounded-lg animate-pulse" />
          ))}
        </div>
      ) : regions.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-300 text-lg">No regions available</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => (
            <Link
              key={region.id}
              to={`/regions/${region.id}/municipalities`}
              className="bg-dark-lighter border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white font-semibold text-lg">{region.name}</h2>
                  {region.code && (
                    <p className="text-gray-200 text-sm">{region.code}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-primary font-medium">
                    {region.municipality_count || 0}
                  </div>
                  <div className="text-gray-300 text-sm">municipalities</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Regions;
