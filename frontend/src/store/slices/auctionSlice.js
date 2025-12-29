import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  auctions: [],
  currentAuction: null,
  loading: false,
  error: null,
};

export const fetchAuctions = createAsyncThunk(
  'auction/fetchAuctions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getAuctions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchAuction = createAsyncThunk(
  'auction/fetchAuction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getAuction(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const createAuction = createAsyncThunk(
  'auction/createAuction',
  async (auctionData, { rejectWithValue }) => {
    try {
      const response = await api.createAuction(auctionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const placeBid = createAsyncThunk(
  'auction/placeBid',
  async ({ auctionId, walletAddress, amount }, { rejectWithValue }) => {
    try {
      const response = await api.placeBid(auctionId, walletAddress, amount);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const buyout = createAsyncThunk(
  'auction/buyout',
  async ({ auctionId, walletAddress }, { rejectWithValue }) => {
    try {
      const response = await api.buyout(auctionId, walletAddress);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.auctions = action.payload;
      })
      .addCase(fetchAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAuction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAuction = action.payload;
      })
      .addCase(fetchAuction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        // Refresh auction after bid
        if (state.currentAuction) {
          state.currentAuction.bids = [...(state.currentAuction.bids || []), action.payload];
        }
      });
  },
});

export const { clearCurrentAuction, clearError } = auctionSlice.actions;

// Alias for component compatibility
export const fetchAuctionDetail = fetchAuction;

export const selectAuctions = (state) => state.auction.auctions;
export const selectCurrentAuction = (state) => state.auction.currentAuction;
export const selectAuctionLoading = (state) => state.auction.loading;
export const selectAuctionError = (state) => state.auction.error;

export default auctionSlice.reducer;
