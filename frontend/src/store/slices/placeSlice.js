import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  places: [],
  currentPlace: null,
  slices: [],
  loading: false,
  error: null,
};

export const fetchPlaces = createAsyncThunk(
  'place/fetchPlaces',
  async ({ params = {}, walletAddress = null } = {}, { rejectWithValue }) => {
    try {
      const response = await api.getPlaces(params, walletAddress);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchPlace = createAsyncThunk(
  'place/fetchPlace',
  async ({ id, walletAddress }, { rejectWithValue }) => {
    try {
      const response = await api.getPlace(id, walletAddress);
      return response; // Return full response to include has_interest
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const purchaseSlice = createAsyncThunk(
  'place/purchaseSlice',
  async ({ sliceId, walletAddress, txHash }, { rejectWithValue }) => {
    try {
      const response = await api.purchaseSlice(sliceId, walletAddress, txHash);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const claimPlace = createAsyncThunk(
  'place/claimPlace',
  async ({ placeId, walletAddress }, { rejectWithValue }) => {
    try {
      const response = await api.claimPlace(placeId, walletAddress);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const addInterest = createAsyncThunk(
  'place/addInterest',
  async ({ placeId, walletAddress }, { rejectWithValue }) => {
    try {
      const response = await api.addInterest(placeId, walletAddress);
      return { placeId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

const placeSlice = createSlice({
  name: 'place',
  initialState,
  reducers: {
    clearCurrentPlace: (state) => {
      state.currentPlace = null;
      state.slices = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.places = action.payload;
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlace.fulfilled, (state, action) => {
        state.loading = false;
        // Merge place data with has_interest flag
        state.currentPlace = {
          ...action.payload.data,
          has_interest: action.payload.has_interest,
        };
        state.slices = action.payload.data.slices || [];
      })
      .addCase(fetchPlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(purchaseSlice.fulfilled, (state, action) => {
        // Update slice in state
        const sliceId = action.meta.arg.sliceId;
        const sliceIndex = state.slices.findIndex(s => s.id === sliceId);
        if (sliceIndex !== -1) {
          state.slices[sliceIndex].is_owned = true;
        }
      })
      .addCase(claimPlace.fulfilled, (state, action) => {
        if (state.currentPlace) {
          state.currentPlace.is_claimed = true;
        }
      });
  },
});

export const { clearCurrentPlace, clearError } = placeSlice.actions;

// Alias for component compatibility
export const fetchPlaceDetail = fetchPlace;

export const selectPlaces = (state) => state.place.places;
export const selectCurrentPlace = (state) => state.place.currentPlace;
export const selectSlices = (state) => state.place.slices;
export const selectPlaceLoading = (state) => state.place.loading;
export const selectPlaceError = (state) => state.place.error;

export default placeSlice.reducer;
