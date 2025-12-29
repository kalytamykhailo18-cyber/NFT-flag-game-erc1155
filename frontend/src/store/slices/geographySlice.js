import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  countries: [],
  regions: [],
  municipalities: [],
  currentCountry: null,
  currentRegion: null,
  currentMunicipality: null,
  loading: false,
  error: null,
};

export const fetchCountries = createAsyncThunk(
  'geography/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getCountries();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchCountryRegions = createAsyncThunk(
  'geography/fetchCountryRegions',
  async (countryId, { rejectWithValue }) => {
    try {
      const response = await api.getCountryRegions(countryId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchRegionMunicipalities = createAsyncThunk(
  'geography/fetchRegionMunicipalities',
  async (regionId, { rejectWithValue }) => {
    try {
      const response = await api.getRegionMunicipalities(regionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchMunicipalityPlaces = createAsyncThunk(
  'geography/fetchMunicipalityPlaces',
  async (municipalityId, { rejectWithValue }) => {
    try {
      const response = await api.getMunicipalityPlaces(municipalityId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

const geographySlice = createSlice({
  name: 'geography',
  initialState,
  reducers: {
    setCurrentCountry: (state, action) => {
      state.currentCountry = action.payload;
    },
    setCurrentRegion: (state, action) => {
      state.currentRegion = action.payload;
    },
    setCurrentMunicipality: (state, action) => {
      state.currentMunicipality = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCountryRegions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountryRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = action.payload;
      })
      .addCase(fetchCountryRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRegionMunicipalities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRegionMunicipalities.fulfilled, (state, action) => {
        state.loading = false;
        state.municipalities = action.payload;
      })
      .addCase(fetchRegionMunicipalities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentCountry, setCurrentRegion, setCurrentMunicipality, clearError } = geographySlice.actions;

export const selectCountries = (state) => state.geography.countries;
export const selectRegions = (state) => state.geography.regions;
export const selectMunicipalities = (state) => state.geography.municipalities;
export const selectCurrentCountry = (state) => state.geography.currentCountry;
export const selectCurrentRegion = (state) => state.geography.currentRegion;
export const selectCurrentMunicipality = (state) => state.geography.currentMunicipality;
export const selectGeographyLoading = (state) => state.geography.loading;
export const selectGeographyError = (state) => state.geography.error;

export default geographySlice.reducer;
