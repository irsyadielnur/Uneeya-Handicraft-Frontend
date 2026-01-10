import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/products/');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Gagal memuat produk');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      } else if (action.payload && Array.isArray(action.payload.data)) {
        state.items = action.payload.data;
      } else {
        console.error('Format data produk salah:', action.payload);
        state.items = [];
      }
    });
  },
});

export default productSlice.reducer;
