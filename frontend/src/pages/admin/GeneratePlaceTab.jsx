/**
 * GeneratePlaceTab - Create place from coordinates with auto-generated slices
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  checkImageAvailability,
  generateSlicesPreview,
  createPlaceFromCoordinates,
  mintPlace,
  clearNftResult,
  fetchAdminData,
  selectAdminMunicipalities,
  selectNftGenerating,
  selectNftGenerationResult,
  selectAdminError,
} from '../../store/slices/adminSlice';

const GeneratePlaceTab = () => {
  const dispatch = useDispatch();
  const municipalities = useSelector(selectAdminMunicipalities);
  const generating = useSelector(selectNftGenerating);
  const result = useSelector(selectNftGenerationResult);
  const error = useSelector(selectAdminError);

  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    municipality_id: '',
    location_type: 'standardlocation',
    category: 'standard',
    pair_count: 2,
    custom_name: '',
  });

  const [step, setStep] = useState(1);
  const [imageAvailable, setImageAvailable] = useState(null);
  const [previewSlices, setPreviewSlices] = useState([]);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);

  // Auto-set category based on location_type
  const handleLocationTypeChange = (value) => {
    const categoryMap = {
      'standardlocation': 'standard',
      'pluslocation': 'plus',
      'premiumlocation': 'premium',
    };
    setFormData({
      ...formData,
      location_type: value,
      category: categoryMap[value],
    });
  };

  const handleCheckImage = async () => {
    if (!formData.latitude || !formData.longitude) {
      alert('Please enter coordinates');
      return;
    }

    try {
      const res = await dispatch(checkImageAvailability({
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        municipality_id: parseInt(formData.municipality_id),
      })).unwrap();

      setImageAvailable(res.available);
      if (res.available) {
        setStep(2);
      }
    } catch (err) {
      alert(err || 'Failed to check image availability');
    }
  };

  const handleGeneratePreview = async () => {
    try {
      const res = await dispatch(generateSlicesPreview({
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        pair_count: formData.pair_count,
        municipality_id: parseInt(formData.municipality_id),
      })).unwrap();

      setPreviewSlices(res.previews || []);
      setStep(3);
    } catch (err) {
      alert(err || 'Failed to generate preview');
    }
  };

  const handleCreate = async () => {
    try {
      await dispatch(createPlaceFromCoordinates({
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        municipality_id: parseInt(formData.municipality_id),
        location_type: formData.location_type,
        category: formData.category,
        pair_count: formData.pair_count,
        custom_name: formData.custom_name || undefined,
      })).unwrap();

      dispatch(fetchAdminData());
      setStep(4);
    } catch (err) {
      alert(err || 'Failed to create place');
    }
  };

  const handleMint = async () => {
    if (!result?.place?.id) return;

    setMinting(true);
    try {
      const mintRes = await dispatch(mintPlace(result.place.id)).unwrap();
      setMintResult(mintRes);
      dispatch(fetchAdminData());
    } catch (err) {
      alert(err || 'Failed to mint place');
    } finally {
      setMinting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      latitude: '',
      longitude: '',
      municipality_id: '',
      location_type: 'standardlocation',
      category: 'standard',
      pair_count: 2,
      custom_name: '',
    });
    setStep(1);
    setImageAvailable(null);
    setPreviewSlices([]);
    setMintResult(null);
    dispatch(clearNftResult());
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Generate Place from Coordinates</h2>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <StepIndicator number={1} active={step >= 1} completed={step > 1}>Coordinates</StepIndicator>
        <StepConnector completed={step > 1} />
        <StepIndicator number={2} active={step >= 2} completed={step > 2}>Configure</StepIndicator>
        <StepConnector completed={step > 2} />
        <StepIndicator number={3} active={step >= 3} completed={step > 3}>Preview</StepIndicator>
        <StepConnector completed={step > 3} />
        <StepIndicator number={4} active={step >= 4} completed={step > 4}>Complete</StepIndicator>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Coordinates & Municipality */}
      {step === 1 && (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Enter Location Details</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-200 text-sm mb-2">Latitude *</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 40.4168"
                required
                className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-gray-200 text-sm mb-2">Longitude *</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., -3.7038"
                required
                className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-200 text-sm mb-2">Municipality *</label>
            <select
              value={formData.municipality_id}
              onChange={(e) => setFormData({ ...formData, municipality_id: e.target.value })}
              required
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
            >
              <option value="">Select Municipality</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-200 text-sm mb-2">Custom Name (optional)</label>
            <input
              type="text"
              value={formData.custom_name}
              onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
              placeholder="Leave empty for auto-generated name"
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          {imageAvailable === false && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
              No suitable images found. Try different coordinates.
            </div>
          )}

          <button
            onClick={handleCheckImage}
            disabled={generating || !formData.latitude || !formData.longitude || !formData.municipality_id}
            className="w-full py-3 bg-primary text-white rounded font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {generating ? 'Checking...' : 'Check Image Availability'}
          </button>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Configure Place</h3>

          <div className="mb-4">
            <label className="block text-gray-200 text-sm mb-2">Location Type *</label>
            <div className="flex gap-4">
              {['standardlocation', 'pluslocation', 'premiumlocation'].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="location_type"
                    value={type}
                    checked={formData.location_type === type}
                    onChange={(e) => handleLocationTypeChange(e.target.value)}
                    className="text-primary"
                  />
                  <span className="text-white capitalize">{type.replace('location', '')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-200 text-sm mb-2">Category (auto-set)</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
            >
              <option value="standard">Standard (0% discount)</option>
              <option value="plus">Plus (50% discount)</option>
              <option value="premium">Premium (75% discount)</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-200 text-sm mb-2">Number of Pairs *</label>
            <select
              value={formData.pair_count}
              onChange={(e) => setFormData({ ...formData, pair_count: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} pairs ({n * 2} slices)</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleGeneratePreview}
              disabled={generating}
              className="flex-1 py-3 bg-primary text-white rounded font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Preview Slices'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preview Slices</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {previewSlices.map((slice, index) => (
              <div key={index} className="aspect-square bg-dark rounded overflow-hidden">
                {slice.preview_url ? (
                  <img
                    src={slice.preview_url}
                    alt={`Slice ${slice.pair_number}-${slice.slice_position}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Pair {slice.pair_number}, Pos {slice.slice_position}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6 p-4 bg-dark rounded">
            <h4 className="text-white font-semibold mb-2">Summary</h4>
            <div className="space-y-1 text-sm">
              <p className="text-gray-200">Name: <span className="text-white">{formData.custom_name || 'Auto-generated'}</span></p>
              <p className="text-gray-200">Location Type: <span className="text-white capitalize">{formData.location_type}</span></p>
              <p className="text-gray-200">Category: <span className="text-white capitalize">{formData.category}</span></p>
              <p className="text-gray-200">Pairs: <span className="text-white">{formData.pair_count}</span></p>
              <p className="text-gray-200">Total Slices: <span className="text-white">{formData.pair_count * 2}</span></p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={generating}
              className="flex-1 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {generating ? 'Creating...' : 'Create Place'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">Place Created!</h3>
          <p className="text-gray-200 mb-6">
            The place has been created and is ready for minting.
          </p>

          {result && (
            <div className="mb-6 p-4 bg-dark rounded text-left">
              <p className="text-gray-200 text-sm">Place ID: <span className="text-white">{result.place?.id}</span></p>
              <p className="text-gray-200 text-sm">Token ID: <span className="text-white">{result.place?.token_id}</span></p>
              <p className="text-gray-200 text-sm">Slices: <span className="text-white">{result.slices?.length || 0}</span></p>
              {result.metadata_uri && (
                <p className="text-gray-200 text-sm truncate">
                  Metadata: <a href={result.metadata_uri} target="_blank" rel="noopener noreferrer" className="text-primary">{result.metadata_uri}</a>
                </p>
              )}
            </div>
          )}

          {mintResult ? (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded text-left">
              <p className="text-green-400 font-semibold mb-2">NFT Minted!</p>
              {mintResult.transaction?.hash && (
                <p className="text-gray-200 text-sm truncate">
                  Tx Hash: <span className="text-white">{mintResult.transaction.hash}</span>
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={handleMint}
              disabled={minting}
              className="w-full py-3 bg-primary text-white rounded font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50 mb-4"
            >
              {minting ? 'Minting NFT...' : 'Mint NFT'}
            </button>
          )}

          <button
            onClick={handleReset}
            className="w-full py-3 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition-colors"
          >
            Create Another
          </button>
        </div>
      )}
    </div>
  );
};

const StepIndicator = ({ number, active, completed, children }) => (
  <div className="flex flex-col items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
      completed ? 'bg-green-500 text-white' : active ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200'
    }`}>
      {completed ? '✓' : number}
    </div>
    <span className={`text-xs mt-1 ${active ? 'text-white' : 'text-gray-300'}`}>{children}</span>
  </div>
);

const StepConnector = ({ completed }) => (
  <div className={`flex-1 h-0.5 mx-2 ${completed ? 'bg-green-500' : 'bg-gray-700'}`} />
);

export default GeneratePlaceTab;
