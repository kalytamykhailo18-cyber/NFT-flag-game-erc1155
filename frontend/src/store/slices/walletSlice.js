import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { connectWallet as connectWalletService, disconnectWallet, getBalance } from '../../services/web3';

const initialState = {
  address: null,
  balance: '0',
  isConnected: false,
  isConnecting: false,
  walletType: null,
  error: null,
};

export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (walletType = null, { rejectWithValue }) => {
    try {
      const result = await connectWalletService(walletType);
      const balance = await getBalance(result.address);
      return { ...result, balance };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshBalance = createAsyncThunk(
  'wallet/refreshBalance',
  async (address, { rejectWithValue }) => {
    try {
      const balance = await getBalance(address);
      return balance;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    disconnect: (state) => {
      disconnectWallet();
      state.address = null;
      state.balance = '0';
      state.isConnected = false;
      state.walletType = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.balance = action.payload.balance;
        state.walletType = action.payload.walletType;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload;
      })
      .addCase(refreshBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      });
  },
});

export const { disconnect, clearError } = walletSlice.actions;

export const selectWallet = (state) => state.wallet;
export const selectIsConnected = (state) => state.wallet.isConnected;
export const selectAddress = (state) => state.wallet.address;

export default walletSlice.reducer;
