import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(result)) {
      toast.success('Login berhasil!');
      const user = result.payload.user;

      if (user.role_id === 2 || user.role_id === 3 || user.role_id === 4) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Link to="/" className="absolute top-5 left-5 text-gray-600 hover:text-black font-semibold flex items-center gap-2">
        ← Kembali ke Home
      </Link>

      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login Uneeya</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Masukan email..." required className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Masukan password..." required className="w-full border p-2 rounded" />
          </div>

          <button type="submit" disabled={isLoading} className="cursor-pointer w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition">
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Daftar disini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
