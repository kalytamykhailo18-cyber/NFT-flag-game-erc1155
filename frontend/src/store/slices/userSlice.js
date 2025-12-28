import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  user: null,
  ownedSlices: [],
  claimedPlaces: [],
  progress: [],
  loading: false,
  error: null,
};

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (walletAddress, { rejectWithValue }) => {
    try {
      const response = await api.getUser(walletAddress);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchUserSlices = createAsyncThunk(
  'user/fetchUserSlices',
  async (walletAddress, { rejectWithValue }) => {
    try {
      const response = await api.getUserSlices(walletAddress);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchUserPlaces = createAsyncThunk(
  'user/fetchUserPlaces',
  async (walletAddress, { rejectWithValue }) => {
    try {
      const response = await api.getUserPlaces(walletAddress);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  'user/fetchUserProgress',
  async (walletAddress, { rejectWithValue }) => {
    try {
      const response = await api.getUserProgress(walletAddress);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.ownedSlices = [];
      state.claimedPlaces = [];
      state.progress = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserSlices.fulfilled, (state, action) => {
        state.ownedSlices = action.payload;
      })
      .addCase(fetchUserPlaces.fulfilled, (state, action) => {
        state.claimedPlaces = action.payload;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
      });
  },
});

export const { clearUser, clearError } = userSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectOwnedSlices = (state) => state.user.ownedSlices;
export const selectClaimedPlaces = (state) => state.user.claimedPlaces;
export const selectUserProgress = (state) => state.user.progress;
export const selectUserLoading = (state) => state.user.loading;

export default userSlice.reducer;
