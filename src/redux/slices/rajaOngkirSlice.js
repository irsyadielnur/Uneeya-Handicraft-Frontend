import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// Thunk untuk ambil Provinsi
export const fetchProvinces = createAsyncThunk('rajaOngkir/fetchProvinces', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/shipping/provinces');
    // Pastikan yang dikembalikan adalah ARRAY
    // Logika ini meniru yang ada di Profile.jsx Anda sebelumnya
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return []; // Fallback array kosong
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Gagal memuat provinsi');
  }
});

// Thunk untuk ambil Kota
export const fetchCities = createAsyncThunk('rajaOngkir/fetchCities', async (provinceId, { rejectWithValue }) => {
  if (!provinceId) return [];
  try {
    const response = await api.get(`/api/shipping/cities/${provinceId}`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Gagal memuat kota');
  }
});

const rajaOngkirSlice = createSlice({
  name: 'rajaOngkir',
  initialState: {
    provinces: [],
    cities: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCities: (state) => {
      state.cities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle Provinces
      .addCase(fetchProvinces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.loading = false;
        // Pastikan payload selalu array sebelum masuk state
        state.provinces = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.provinces = []; // Reset ke array kosong jika gagal
      })

      // Handle Cities
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cities = [];
      });
  },
});

export const { clearCities } = rajaOngkirSlice.actions;
export default rajaOngkirSlice.reducer;
