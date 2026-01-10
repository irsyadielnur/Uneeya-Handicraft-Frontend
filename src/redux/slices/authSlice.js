import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

// 0. Thunk untuk Verifikasi OTP
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/auth/verify-otp', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Verifikasi OTP gagal');
  }
});

// 1. Thunk untuk Login
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login gagal');
  }
});

// 2. Thunk untuk Register
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Registrasi gagal');
  }
});

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      localStorage.setItem('user', JSON.stringify(action.payload.user));
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Handler Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Handler Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
