import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

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

  const isFormValid = formData.email && formData.password;

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Link to="/" className="absolute top-5 left-5 text-gray-600 hover:text-black font-semibold flex items-center gap-2">
        ← Kembali ke Home
      </Link>

      <div className="w-full max-w-md p-6 bg-cream rounded shadow-lg border border-gray-300">
        <h2 className="text-2xl font-bold text-center mb-6">Login Uneeya</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukan email..."
              required
              className="w-full border p-2 border-gray-500 rounded pr-10 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukan password..."
                required
                className="w-full border p-2 border-gray-500 rounded pr-10 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer active:scale-95">
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`w-full py-2 rounded-lg font-bold shadow-md transition-all duration-200 cursor-pointer active:scale-95 ${
              isLoading || !isFormValid ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg transform active:scale-95'
            }`}
          >
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
