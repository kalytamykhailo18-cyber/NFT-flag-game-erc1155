/**
 * Home - Landing page
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountries, selectCountries, selectGeographyLoading } from '../store/slices/geographySlice';
import { fetchPlaces, selectPlaces, selectPlaceLoading } from '../store/slices/placeSlice';
import PlaceCard from '../components/PlaceCard';

const Home = () => {
  const dispatch = useDispatch();
  const countries = useSelector(selectCountries);
  const places = useSelector(selectPlaces);
  const loadingGeo = useSelector(selectGeographyLoading);
  const loadingPlaces = useSelector(selectPlaceLoading);
  const { address } = useSelector((state) => state.wallet);

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchPlaces({ params: { limit: 6 }, walletAddress: address }));
  }, [dispatch, address]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Collect Unique Place NFTs
        </h1>
        <p className="text-gray-200 text-lg max-w-2xl mx-auto">
          Discover and collect photo slices of amazing places around the world.
          Complete all pairs to claim the place as your own NFT!
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            to="/places"
            className="px-6 py-3 bg-primary text-white rounded-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Explore Places
          </Link>
          <Link
            to="/countries"
            className="px-6 py-3 bg-gray-700 text-white rounded-sm font-medium hover:bg-gray-600 transition-colors"
          >
            Browse by Country
          </Link>
        </div>
      </div>

      {/* Countries Preview */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Countries</h2>
          <Link to="/countries" className="text-primary hover:text-primary/80">
            View all
          </Link>
        </div>
        {loadingGeo ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-dark-lighter rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {countries.slice(0, 4).map((country) => (
              <Link
                key={country.id}
                to={`/countries/${country.id}/regions`}
                className="bg-dark-lighter border border-gray-800 rounded-sm p-4 hover:border-gray-700 transition-colors"
              >
                <div className="text-white font-medium">{country.name}</div>
                <div className="text-gray-200 text-sm">{country.code}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Places */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Featured Places</h2>
          <Link to="/places" className="text-primary hover:text-primary/80">
            View all
          </Link>
        </div>
        {loadingPlaces ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-dark-lighter rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.slice(0, 6).map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
