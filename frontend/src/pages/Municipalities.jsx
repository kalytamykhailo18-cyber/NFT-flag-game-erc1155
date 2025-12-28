/**
 * Municipalities - List municipalities for a region
 */
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRegionMunicipalities, selectMunicipalities, selectGeographyLoading, selectCurrentRegion } from '../store/slices/geographySlice';

const Municipalities = () => {
  const { regionId } = useParams();
  const dispatch = useDispatch();
  const municipalities = useSelector(selectMunicipalities);
  const region = useSelector(selectCurrentRegion);
  const loading = useSelector(selectGeographyLoading);

  useEffect(() => {
    if (regionId) {
      dispatch(fetchRegionMunicipalities(regionId));
    }
  }, [dispatch, regionId]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/countries" className="hover:text-white">Countries</Link>
        <span className="mx-2">/</span>
        {region?.country && (
          <>
            <Link to={`/countries/${region.country.id}/regions`} className="hover:text-white">
              {region.country.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-white">{region?.name || 'Loading...'}</span>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-6">
        Municipalities in {region?.name || 'Loading...'}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-dark-lighter rounded-lg animate-pulse" />
          ))}
        </div>
      ) : municipalities.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-500 text-lg">No municipalities available</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {municipalities.map((municipality) => (
            <Link
              key={municipality.id}
              to={`/municipalities/${municipality.id}/places`}
              className="bg-dark-lighter border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white font-semibold text-lg">{municipality.name}</h2>
                  {municipality.latitude && municipality.longitude && (
                    <p className="text-gray-500 text-sm">
                      {municipality.latitude.toFixed(4)}, {municipality.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-primary font-medium">
                    {municipality.place_count || 0}
                  </div>
                  <div className="text-gray-500 text-sm">places</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Municipalities;
