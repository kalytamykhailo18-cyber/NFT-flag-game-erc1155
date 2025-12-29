import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  isAuthenticated: false,
  apiKey: null,
  countries: [],
  regions: [],
  municipalities: [],
  places: [],
  stats: null,
  ipfsStatus: null,
  nftGenerationResult: null,
  nftGenerating: false,
  checkingImageAvailability: false,
  imageAvailable: null,
  previewImages: [],
  loading: false,
  actionLoading: false,
  message: null,
  error: null,
};

// Admin authentication
export const adminLogin = createAsyncThunk(
  'admin/login',
  async (apiKey, { rejectWithValue }) => {
    try {
      // Test authentication by fetching stats
      const response = await api.adminGetStats(apiKey);
      return { apiKey, stats: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || 'Invalid admin key');
    }
  }
);

// Fetch admin data
export const fetchAdminData = createAsyncThunk(
  'admin/fetchData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const apiKey = getState().admin.apiKey;
      const [countries, regions, municipalities, places, stats, ipfsStatus] = await Promise.all([
        api.adminGetCountries(apiKey),
        api.adminGetRegions(apiKey),
        api.adminGetMunicipalities(apiKey),
        api.adminGetPlaces(apiKey),
        api.adminGetStats(apiKey),
        api.adminGetIpfsStatus(apiKey),
      ]);
      return {
        countries: countries.data,
        regions: regions.data,
        municipalities: municipalities.data,
        places: places.data,
        stats: stats.data,
        ipfsStatus: ipfsStatus.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

// Create place from coordinates
export const createPlaceFromCoordinates = createAsyncThunk(
  'admin/createPlaceFromCoordinates',
  async (data, { getState, rejectWithValue }) => {
    try {
      const apiKey = getState().admin.apiKey;
      const response = await api.adminCreatePlaceFromCoordinates(apiKey, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

// Check image availability
export const checkImageAvailability = createAsyncThunk(
  'admin/checkImageAvailability',
  async (data, { getState, rejectWithValue }) => {
    try {
      const apiKey = getState().admin.apiKey;
      const response = await api.adminCheckImageAvailability(apiKey, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

// Generate slices preview
export const generateSlicesPreview = createAsyncThunk(
  'admin/generateSlicesPreview',
  async (data, { getState, rejectWithValue }) => {
    try {
      const apiKey = getState().admin.apiKey;
      const response = await api.adminGenerateSlicesPreview(apiKey, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

// Mint place
export const mintPlace = createAsyncThunk(
  'admin/mintPlace',
  async (placeId, { getState, rejectWithValue }) => {
    try {
      const apiKey = getState().admin.apiKey;
      const response = await api.adminMintPlace(apiKey, placeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.apiKey = null;
      state.countries = [];
      state.regions = [];
      state.municipalities = [];
      state.places = [];
      state.stats = null;
    },
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    clearNftResult: (state) => {
      state.nftGenerationResult = null;
      state.previewImages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.apiKey = action.payload.apiKey;
        state.stats = action.payload.stats;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload.countries;
        state.regions = action.payload.regions;
        state.municipalities = action.payload.municipalities;
        state.places = action.payload.places;
        state.stats = action.payload.stats;
        state.ipfsStatus = action.payload.ipfsStatus;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPlaceFromCoordinates.pending, (state) => {
        state.nftGenerating = true;
        state.error = null;
      })
      .addCase(createPlaceFromCoordinates.fulfilled, (state, action) => {
        state.nftGenerating = false;
        state.nftGenerationResult = action.payload;
        state.message = 'Place created successfully';
      })
      .addCase(createPlaceFromCoordinates.rejected, (state, action) => {
        state.nftGenerating = false;
        state.error = action.payload;
      })
      .addCase(checkImageAvailability.pending, (state) => {
        state.checkingImageAvailability = true;
      })
      .addCase(checkImageAvailability.fulfilled, (state, action) => {
        state.checkingImageAvailability = false;
        state.imageAvailable = action.payload.available;
      })
      .addCase(checkImageAvailability.rejected, (state, action) => {
        state.checkingImageAvailability = false;
        state.error = action.payload;
      })
      .addCase(generateSlicesPreview.fulfilled, (state, action) => {
        state.previewImages = action.payload.previews;
      })
      .addCase(mintPlace.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(mintPlace.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.message = 'Place minted successfully';
      })
      .addCase(mintPlace.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearMessage, clearNftResult } = adminSlice.actions;

export const selectAdminAuth = (state) => state.admin.isAuthenticated;
export const selectAdminApiKey = (state) => state.admin.apiKey;
export const selectAdminCountries = (state) => state.admin.countries;
export const selectAdminRegions = (state) => state.admin.regions;
export const selectAdminMunicipalities = (state) => state.admin.municipalities;
export const selectAdminPlaces = (state) => state.admin.places;
export const selectAdminStats = (state) => state.admin.stats;
export const selectAdminIpfsStatus = (state) => state.admin.ipfsStatus;
export const selectNftGenerationResult = (state) => state.admin.nftGenerationResult;
export const selectNftGenerating = (state) => state.admin.nftGenerating;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminMessage = (state) => state.admin.message;

export default adminSlice.reducer;
