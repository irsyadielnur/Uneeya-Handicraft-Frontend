import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  // Ambil email yang dikirim dari halaman Register
  const { email, userId } = location.state || {};

  useEffect(() => {
    // Jika user mencoba akses langsung via URL tanpa register dulu
    if (!userId) {
      toast.error('Akses ditolak. Silakan register terlebih dahulu.');
      navigate('/register');
    }

    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [userId, error, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) return toast.error('Masukan kode OTP!');

    const resultAction = await dispatch(verifyOtp({ user_id: userId, otp }));

    if (verifyOtp.fulfilled.match(resultAction)) {
      toast.success('Akun berhasil diaktifkan! Silakan login.');
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
      {/* <Link to="/" className="absolute top-5 left-5 text-gray-600 hover:text-black font-semibold flex items-center gap-2">
        ← Kembali ke Home
      </Link> */}

      <div className="w-full max-w-md p-8 bg-white rounded shadow-md text-center">
        <h2 className="text-2xl font-bold mb-2">Verifikasi OTP</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Kode OTP telah dikirim ke email: <br />
          <span className="font-bold text-gray-800">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full border border-gray-300 p-3 rounded text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-yellow-500 transition"
              autoFocus
            />
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition font-semibold">
            {isLoading ? 'Memverifikasi...' : 'Verifikasi Akun'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Salah email?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Daftar Ulang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
