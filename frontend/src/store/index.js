import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import placeReducer from './slices/placeSlice';
import userReducer from './slices/userSlice';
import auctionReducer from './slices/auctionSlice';
import geographyReducer from './slices/geographySlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    place: placeReducer,
    user: userReducer,
    auction: auctionReducer,
    geography: geographyReducer,
    admin: adminReducer,
  },
});

export default store;
