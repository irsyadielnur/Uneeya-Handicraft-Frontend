import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/cart');
    return response.data.items;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Add cart
export const addItemToCart = createAsyncThunk('cart/addItem', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await api.post('/api/cart', payload);
    dispatch(fetchCart());
    return true;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Update Quantity
export const updateCartItemQty = createAsyncThunk('cart/updateQty', async ({ cart_id, qty }, { dispatch, rejectWithValue }) => {
  try {
    await api.put(`/api/cart/${cart_id}`, { qty });
    dispatch(fetchCart());
    return true;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Remove Product
export const removeCartItem = createAsyncThunk('cart/removeItem', async (cart_id, { dispatch, rejectWithValue }) => {
  try {
    await api.delete(`/api/cart/${cart_id}`);
    dispatch(fetchCart());
    return cart_id;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => {
      state.items = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
