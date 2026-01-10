import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaStar } from 'react-icons/fa';
import api from '../config/api';
import toast from 'react-hot-toast';

const ReviewModal = ({ isOpen, closeModal, product, orderId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/reviews', {
        product_id: product.product_id,
        order_id: orderId,
        rating,
        comment,
      });
      toast.success('Ulasan berhasil dikirim!');
      onSuccess();
      closeModal();
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulasan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto pt-14">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-cream p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 border-b pb-2">
                  Beri Ulasan Produk
                </Dialog.Title>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Bagaimana kualitas produk ini?</p>
                  <h4 className="font-bold text-gray-800 mb-4">{product?.product_name}</h4>

                  {/* Star Rating */}
                  <div className="flex gap-2 mb-4 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setRating(star)} className={`text-3xl cursor-pointer transition-all duration-100 active:scale-90 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                        <FaStar />
                      </button>
                    ))}
                  </div>

                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                    rows="6"
                    placeholder="Tulis pengalamanmu tentang produk ini..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer transition-all duration-100 active:scale-90" onClick={closeModal}>
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg cursor-pointer transition-all duration-100 active:scale-90 hover:bg-yellow-500 disabled:opacity-50"
                    onClick={handleSubmit}
                  >
                    {loading ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReviewModal;
