import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok!');
      return;
    }

    const resultAction = await dispatch(
      registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      const userId = resultAction.payload.user_id;
      toast.success('Registrasi berhasil! Cek email untuk kode OTP.');

      navigate('/login', {
        state: {
          email: formData.email,
          userId: userId,
        },
      });
    }
  };

  const isPasswordMatch = formData.password === formData.confirmPassword;
  const isFormValid = formData.username && formData.email && formData.password && formData.confirmPassword && isPasswordMatch;

  return (
    <div className="bawah-dikit relative min-h-screen flex items-center justify-center">
      <Link to="/" className="absolute top-5 left-5 text-gray-600 hover:text-black font-semibold flex items-center gap-2">
        ← Kembali ke Home
      </Link>

      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Daftar Akun Baru</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Masukkan username" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded" placeholder="nama@email.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Buat password..." required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password..."
              required
              className={`w-full border p-2.5 rounded-lg outline-none transition ${
                formData.confirmPassword && !isPasswordMatch
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200'
                  : formData.confirmPassword && isPasswordMatch
                  ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                  : 'border-gray-300 focus:ring-2 focus:ring-yellow-400'
              }`}
            />
            {formData.confirmPassword && !isPasswordMatch && (
              <p className="text-red-500 text-xs mt-1 font-medium flex items-center">
                <span className="mr-1">⚠</span> Password tidak cocok!
              </p>
            )}
            {formData.confirmPassword && isPasswordMatch && (
              <p className="text-green-600 text-xs mt-1 font-medium flex items-center">
                <span className="mr-1">✓</span> Password cocok.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`w-full py-3 rounded-lg font-bold shadow-md transition-all duration-200 ${
              isLoading || !isFormValid ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg transform active:scale-95'
            }`}
          >
            {isLoading ? 'Loading...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login disini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
