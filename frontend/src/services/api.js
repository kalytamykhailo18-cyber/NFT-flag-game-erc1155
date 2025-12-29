/**
 * API Service - All API calls
 * Uses config for API_URL - NEVER hardcode URLs
 */
import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== Geography (Public) ====================

export const getCountries = () => api.get('/countries');

export const getCountry = (id) => api.get(`/countries/${id}`);

export const getCountryRegions = (countryId) => api.get(`/countries/${countryId}/regions`);

export const getRegion = (id) => api.get(`/regions/${id}`);

export const getRegionMunicipalities = (regionId) => api.get(`/regions/${regionId}/municipalities`);

export const getMunicipality = (id) => api.get(`/municipalities/${id}`);

export const getMunicipalityPlaces = (municipalityId) => api.get(`/municipalities/${municipalityId}/places`);

// ==================== Places (Public) ====================

export const getPlaces = (params = {}) => api.get('/places', { params });

export const getPlace = (id) => api.get(`/places/${id}`);

export const getPlaceSlices = (placeId) => api.get(`/places/${placeId}/slices`);

export const addInterest = (placeId, walletAddress) =>
  api.post(`/places/${placeId}/interest`, { wallet_address: walletAddress });

export const removeInterest = (placeId, walletAddress) =>
  api.delete(`/places/${placeId}/interest`, { data: { wallet_address: walletAddress } });

export const getInterestedUsers = (placeId) => api.get(`/places/${placeId}/interested-users`);

export const claimPlace = (placeId, walletAddress) =>
  api.post(`/places/${placeId}/claim`, { wallet_address: walletAddress });

// ==================== Slices (Public) ====================

export const getSlice = (id) => api.get(`/slices/${id}`);

export const purchaseSlice = (sliceId, walletAddress, txHash = null) =>
  api.post(`/slices/${sliceId}/purchase`, { wallet_address: walletAddress, tx_hash: txHash });

// ==================== Users (Public) ====================

export const getUser = (walletAddress) => api.get(`/users/${walletAddress}`);

export const getUserSlices = (walletAddress) => api.get(`/users/${walletAddress}/slices`);

export const getUserPlaces = (walletAddress) => api.get(`/users/${walletAddress}/places`);

export const getUserProgress = (walletAddress) => api.get(`/users/${walletAddress}/progress`);

export const getUserPlaceProgress = (walletAddress, placeId) =>
  api.get(`/users/${walletAddress}/places/${placeId}/progress`);

// ==================== Auctions (Public) ====================

export const getAuctions = (params = {}) => api.get('/auctions', { params });

export const getAuction = (id) => api.get(`/auctions/${id}`);

export const createAuction = (data) => api.post('/auctions', data);

export const placeBid = (auctionId, walletAddress, amount) =>
  api.post(`/auctions/${auctionId}/bid`, { wallet_address: walletAddress, amount });

export const cancelAuction = (auctionId) => api.delete(`/auctions/${auctionId}`);

// ==================== Rankings (Public) ====================

export const getUserRankings = () => api.get('/rankings/users');

export const getPlaceRankings = () => api.get('/rankings/places');

// ==================== Admin ====================

const adminApi = (apiKey) => ({
  // Geography CRUD
  createCountry: (data) => api.post('/admin/countries', data, { headers: { 'X-Admin-Key': apiKey } }),
  getCountries: () => api.get('/admin/countries', { headers: { 'X-Admin-Key': apiKey } }),
  getCountry: (id) => api.get(`/admin/countries/${id}`, { headers: { 'X-Admin-Key': apiKey } }),
  updateCountry: (id, data) => api.put(`/admin/countries/${id}`, data, { headers: { 'X-Admin-Key': apiKey } }),
  deleteCountry: (id) => api.delete(`/admin/countries/${id}`, { headers: { 'X-Admin-Key': apiKey } }),

  createRegion: (data) => api.post('/admin/regions', data, { headers: { 'X-Admin-Key': apiKey } }),
  getRegions: (params = {}) => api.get('/admin/regions', { params, headers: { 'X-Admin-Key': apiKey } }),
  getRegion: (id) => api.get(`/admin/regions/${id}`, { headers: { 'X-Admin-Key': apiKey } }),
  updateRegion: (id, data) => api.put(`/admin/regions/${id}`, data, { headers: { 'X-Admin-Key': apiKey } }),
  deleteRegion: (id) => api.delete(`/admin/regions/${id}`, { headers: { 'X-Admin-Key': apiKey } }),

  createMunicipality: (data) => api.post('/admin/municipalities', data, { headers: { 'X-Admin-Key': apiKey } }),
  getMunicipalities: (params = {}) => api.get('/admin/municipalities', { params, headers: { 'X-Admin-Key': apiKey } }),
  getMunicipality: (id) => api.get(`/admin/municipalities/${id}`, { headers: { 'X-Admin-Key': apiKey } }),
  updateMunicipality: (id, data) => api.put(`/admin/municipalities/${id}`, data, { headers: { 'X-Admin-Key': apiKey } }),
  deleteMunicipality: (id) => api.delete(`/admin/municipalities/${id}`, { headers: { 'X-Admin-Key': apiKey } }),

  // Place CRUD
  createPlace: (data) => api.post('/admin/places', data, { headers: { 'X-Admin-Key': apiKey } }),
  getPlaces: (params = {}) => api.get('/admin/places', { params, headers: { 'X-Admin-Key': apiKey } }),
  getPlace: (id) => api.get(`/admin/places/${id}`, { headers: { 'X-Admin-Key': apiKey } }),
  updatePlace: (id, data) => api.put(`/admin/places/${id}`, data, { headers: { 'X-Admin-Key': apiKey } }),
  deletePlace: (id) => api.delete(`/admin/places/${id}`, { headers: { 'X-Admin-Key': apiKey } }),
  mintPlace: (id) => api.post(`/admin/places/${id}/mint`, {}, { headers: { 'X-Admin-Key': apiKey } }),

  // Slice CRUD
  addSlice: (placeId, data) => api.post(`/admin/places/${placeId}/slices`, data, { headers: { 'X-Admin-Key': apiKey } }),
  getPlaceSlices: (placeId) => api.get(`/admin/places/${placeId}/slices`, { headers: { 'X-Admin-Key': apiKey } }),
  updateSlice: (id, data) => api.put(`/admin/slices/${id}`, data, { headers: { 'X-Admin-Key': apiKey } }),
  deleteSlice: (id) => api.delete(`/admin/slices/${id}`, { headers: { 'X-Admin-Key': apiKey } }),

  // Generation
  placeFromCoordinates: (data) => api.post('/admin/place-from-coordinates', data, { headers: { 'X-Admin-Key': apiKey } }),
  checkImageAvailability: (data) => api.post('/admin/check-image-availability', data, { headers: { 'X-Admin-Key': apiKey } }),
  generateSlicesPreview: (data) => api.post('/admin/generate-slices-preview', data, { headers: { 'X-Admin-Key': apiKey } }),

  // Database
  seed: () => api.post('/admin/seed', {}, { headers: { 'X-Admin-Key': apiKey } }),
  reset: () => api.post('/admin/reset', {}, { headers: { 'X-Admin-Key': apiKey } }),
  getStats: () => api.get('/admin/stats', { headers: { 'X-Admin-Key': apiKey } }),
  getIpfsStatus: () => api.get('/admin/ipfs-status', { headers: { 'X-Admin-Key': apiKey } }),
});

// Also export admin methods directly for use with apiKey
export const adminCreateCountry = (apiKey, data) => adminApi(apiKey).createCountry(data);
export const adminGetCountries = (apiKey) => adminApi(apiKey).getCountries();
export const adminUpdateCountry = (apiKey, id, data) => adminApi(apiKey).updateCountry(id, data);
export const adminDeleteCountry = (apiKey, id) => adminApi(apiKey).deleteCountry(id);

export const adminCreateRegion = (apiKey, data) => adminApi(apiKey).createRegion(data);
export const adminGetRegions = (apiKey, params) => adminApi(apiKey).getRegions(params);
export const adminUpdateRegion = (apiKey, id, data) => adminApi(apiKey).updateRegion(id, data);
export const adminDeleteRegion = (apiKey, id) => adminApi(apiKey).deleteRegion(id);

export const adminCreateMunicipality = (apiKey, data) => adminApi(apiKey).createMunicipality(data);
export const adminGetMunicipalities = (apiKey, params) => adminApi(apiKey).getMunicipalities(params);
export const adminUpdateMunicipality = (apiKey, id, data) => adminApi(apiKey).updateMunicipality(id, data);
export const adminDeleteMunicipality = (apiKey, id) => adminApi(apiKey).deleteMunicipality(id);

export const adminCreatePlace = (apiKey, data) => adminApi(apiKey).createPlace(data);
export const adminGetPlaces = (apiKey, params) => adminApi(apiKey).getPlaces(params);
export const adminGetPlace = (apiKey, id) => adminApi(apiKey).getPlace(id);
export const adminUpdatePlace = (apiKey, id, data) => adminApi(apiKey).updatePlace(id, data);
export const adminDeletePlace = (apiKey, id) => adminApi(apiKey).deletePlace(id);
export const adminMintPlace = (apiKey, id) => adminApi(apiKey).mintPlace(id);

export const adminAddSlice = (apiKey, placeId, data) => adminApi(apiKey).addSlice(placeId, data);
export const adminGetPlaceSlices = (apiKey, placeId) => adminApi(apiKey).getPlaceSlices(placeId);
export const adminUpdateSlice = (apiKey, id, data) => adminApi(apiKey).updateSlice(id, data);
export const adminDeleteSlice = (apiKey, id) => adminApi(apiKey).deleteSlice(id);

export const adminPlaceFromCoordinates = (apiKey, data) => adminApi(apiKey).placeFromCoordinates(data);
export const adminCreatePlaceFromCoordinates = (apiKey, data) => adminApi(apiKey).placeFromCoordinates(data); // Alias
export const adminCheckImageAvailability = (apiKey, data) => adminApi(apiKey).checkImageAvailability(data);
export const adminGenerateSlicesPreview = (apiKey, data) => adminApi(apiKey).generateSlicesPreview(data);

export const adminSeed = (apiKey) => adminApi(apiKey).seed();
export const adminReset = (apiKey) => adminApi(apiKey).reset();
export const adminGetStats = (apiKey) => adminApi(apiKey).getStats();
export const adminGetIpfsStatus = (apiKey) => adminApi(apiKey).getIpfsStatus();

export default {
  // Geography
  getCountries,
  getCountry,
  getCountryRegions,
  getRegion,
  getRegionMunicipalities,
  getMunicipality,
  getMunicipalityPlaces,
  // Places
  getPlaces,
  getPlace,
  getPlaceSlices,
  addInterest,
  removeInterest,
  getInterestedUsers,
  claimPlace,
  // Slices
  getSlice,
  purchaseSlice,
  // Users
  getUser,
  getUserSlices,
  getUserPlaces,
  getUserProgress,
  getUserPlaceProgress,
  // Auctions
  getAuctions,
  getAuction,
  createAuction,
  placeBid,
  cancelAuction,
  // Rankings
  getUserRankings,
  getPlaceRankings,
  // Admin
  adminCreateCountry,
  adminGetCountries,
  adminUpdateCountry,
  adminDeleteCountry,
  adminCreateRegion,
  adminGetRegions,
  adminUpdateRegion,
  adminDeleteRegion,
  adminCreateMunicipality,
  adminGetMunicipalities,
  adminUpdateMunicipality,
  adminDeleteMunicipality,
  adminCreatePlace,
  adminGetPlaces,
  adminGetPlace,
  adminUpdatePlace,
  adminDeletePlace,
  adminMintPlace,
  adminAddSlice,
  adminGetPlaceSlices,
  adminUpdateSlice,
  adminDeleteSlice,
  adminPlaceFromCoordinates,
  adminCreatePlaceFromCoordinates,
  adminCheckImageAvailability,
  adminGenerateSlicesPreview,
  adminSeed,
  adminReset,
  adminGetStats,
  adminGetIpfsStatus,
};
