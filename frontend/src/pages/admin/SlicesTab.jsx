/**
 * SlicesTab - View and manage photo slices
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminData, selectAdminPlaces, selectAdminLoading } from '../../store/slices/adminSlice';
import api from '../../services/api';

const SlicesTab = () => {
  const dispatch = useDispatch();
  const places = useSelector(selectAdminPlaces);
  const loading = useSelector(selectAdminLoading);

  const [selectedPlace, setSelectedPlace] = useState('');
  const [slices, setSlices] = useState([]);
  const [loadingSlices, setLoadingSlices] = useState(false);

  const apiKey = useSelector(state => state.admin.apiKey);

  const handlePlaceChange = async (placeId) => {
    setSelectedPlace(placeId);
    if (!placeId) {
      setSlices([]);
      return;
    }

    setLoadingSlices(true);
    try {
      const response = await api.getPlaceSlices(placeId);
      setSlices(response.data || response || []);
    } catch (err) {
      console.error('Failed to load slices:', err);
      setSlices([]);
    } finally {
      setLoadingSlices(false);
    }
  };

  const selectedPlaceData = places.find(p => p.id === parseInt(selectedPlace));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Photo Slices</h2>
      </div>

      {/* Place Selector */}
      <div className="mb-6">
        <label className="block text-gray-200 text-sm mb-2">Select Place</label>
        <select
          value={selectedPlace}
          onChange={(e) => handlePlaceChange(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-dark-lighter border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
        >
          <option value="">Select a place to view slices...</option>
          {places.map((place) => (
            <option key={place.id} value={place.id}>
              {place.name} (Token ID: {place.token_id})
            </option>
          ))}
        </select>
      </div>

      {/* Slices Display */}
      {!selectedPlace ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-300 text-lg">Select a place to view its slices</div>
        </div>
      ) : loadingSlices ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-dark-lighter rounded animate-pulse" />
          ))}
        </div>
      ) : slices.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-300 text-lg">No slices found for this place</div>
          <p className="text-gray-500 mt-2">Generate slices using the "Generate Place" tab</p>
        </div>
      ) : (
        <div>
          {/* Place Info */}
          {selectedPlaceData && (
            <div className="bg-dark-lighter border border-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                {selectedPlaceData.base_image_uri && (
                  <img
                    src={selectedPlaceData.base_image_uri}
                    alt={selectedPlaceData.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="text-white font-semibold text-lg">{selectedPlaceData.name}</h3>
                  <p className="text-gray-200 text-sm">
                    {selectedPlaceData.pair_count} pairs ({selectedPlaceData.pair_count * 2} slices)
                  </p>
                  <p className="text-gray-300 text-sm capitalize">
                    Category: {selectedPlaceData.category} | Location: {selectedPlaceData.location_type}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slices Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slices.map((slice) => (
              <SliceCard key={slice.id} slice={slice} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SliceCard = ({ slice }) => {
  return (
    <div className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-square bg-dark">
        {slice.slice_uri ? (
          <img
            src={slice.slice_uri}
            alt={`Slice ${slice.pair_number}-${slice.slice_position}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">
            Pair {slice.pair_number}, Pos {slice.slice_position}
          </span>
          {slice.is_owned ? (
            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">Owned</span>
          ) : (
            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">Available</span>
          )}
        </div>
        <div className="text-gray-300 text-xs space-y-1">
          <p>ID: {slice.id}</p>
          <p>Price: {slice.price} MATIC</p>
          {slice.image_sha256 && (
            <p className="truncate" title={slice.image_sha256}>
              Hash: {slice.image_sha256.substring(0, 20)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlicesTab;
