import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';
import toast from 'react-hot-toast';

// Fetch Favorites
export const fetchFavorites = createAsyncThunk('favorites/fetchFavorites', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/favorites');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Gagal memuat favorite');
  }
});

// Toggle Favorite (Add/Remove)
export const toggleFavorite = createAsyncThunk('favorites/toggleFavorite', async (product, { getState, rejectWithValue }) => {
  const { auth, favorites } = getState();

  if (!auth.isAuthenticated) {
    toast.error('Silakan login untuk menyimpan produk');
    return rejectWithValue('Not authenticated');
  }

  const existingItem = favorites.items.find((item) => item.product_id === product.product_id);

  try {
    if (existingItem) {
      await api.delete(`/api/favorites/${product.product_id}`);
      return { product, type: 'remove' };
    } else {
      await api.post('/api/favorites', { product_id: product.product_id });
      return { product, type: 'add' };
    }
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Gagal update favorite');
  }
});

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { product, type } = action.payload;

        if (type === 'remove') {
          state.items = state.items.filter((item) => item.product_id !== product.product_id);
          toast.success('Dihapus dari Favorite');
        } else {
          state.items.push(product);
          toast.success('Ditambahkan ke Favorite');
        }
      });

    // .addCase(toggleFavorite.rejected, (state, action) => {
    //   if (action.payload !== 'Not authenticated') {
    //     toast.error(action.payload?.message || 'Gagal update favorite');
    //   }
    // });
  },
});

export default favoriteSlice.reducer;
