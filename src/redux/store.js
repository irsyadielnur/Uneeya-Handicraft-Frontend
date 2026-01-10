import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import favoriteReducer from './slices/favoriteSlice';
import rajaOngkirReducer from './slices/rajaOngkirSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    favorites: favoriteReducer,
    rajaOngkir: rajaOngkirReducer,
  },
});

export default store;
