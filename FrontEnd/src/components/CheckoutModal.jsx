import React, { useState } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';

const CheckoutModal = ({ isOpen, onClose, onConfirm, totalAmount }) => {
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientPhone: '',
        deliveryAddress: '',
        paymentMethod: 'card' // Default to card
    });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;
        if (name === 'recipientPhone') {
            // Only allow digits and limit to 10
            finalValue = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
        if (!formData.recipientPhone.trim()) {
            newErrors.recipientPhone = 'Phone number is required';
        } else if (formData.recipientPhone.trim().length !== 10) {
            newErrors.recipientPhone = 'Phone number must be exactly 10 digits';
        }
        if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Delivery address is required';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onConfirm(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-gray-900/60 backdrop-blur-sm overflow-hidden">
            <div className="bg-white dark:bg-rustic-charcoal rounded-[1.5rem] shadow-2xl w-full sm:max-w-md md:max-w-lg max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 dark:border-rustic-ash">
                {/* Header */}
                <div className="sticky top-0 z-10 px-5 py-3 border-b border-gray-100 dark:border-rustic-ash flex justify-between items-center bg-white dark:bg-rustic-charcoal">
                    <h3 className="text-base font-bold text-rustic-charcoal dark:text-white uppercase tracking-tight">
                        Confirm Purchase
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-rustic-ash transition-colors"
                    >
                        <FiX className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Body - Compact */}
                <div className="p-5 overflow-y-auto scrollbar-thin">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Recipient Name */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-widest">
                                    Recipient Name
                                </label>
                                <input
                                    type="text"
                                    name="recipientName"
                                    value={formData.recipientName}
                                    onChange={handleChange}
                                    className={`input-premium w-full px-3 !py-2 text-sm !bg-white dark:!bg-rustic-slate ${errors.recipientName ? 'border-red-500' : ''}`}
                                    placeholder="Name"
                                />
                                {errors.recipientName && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-bold">{errors.recipientName}</p>
                                )}
                            </div>

                            {/* Recipient Phone */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-widest">
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    name="recipientPhone"
                                    value={formData.recipientPhone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    className={`input-premium w-full px-3 !py-2 text-sm !bg-white dark:!bg-rustic-slate ${errors.recipientPhone ? 'border-red-500' : ''}`}
                                    placeholder="10-digit number"
                                />
                                {errors.recipientPhone && (
                                    <p className="text-red-500 text-[10px] mt-0.5 font-bold">{errors.recipientPhone}</p>
                                )}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-widest">
                                Delivery Address
                            </label>
                            <textarea
                                name="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={handleChange}
                                rows="2"
                                className={`input-premium w-full px-3 !py-2 text-sm !bg-white dark:!bg-rustic-slate ${errors.deliveryAddress ? 'border-red-500' : ''}`}
                                placeholder="Address"
                            ></textarea>
                            {errors.deliveryAddress && (
                                <p className="text-red-500 text-[10px] mt-0.5 font-bold">{errors.deliveryAddress}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`cursor-pointer border text-xs rounded-xl p-2.5 flex items-center gap-3 transition-all ${formData.paymentMethod === 'card'
                                    ? 'border-rustic-green bg-rustic-green/5 text-rustic-green'
                                    : 'border-gray-100 dark:border-rustic-ash bg-gray-50 dark:bg-rustic-slate text-gray-500'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={formData.paymentMethod === 'card'}
                                        onChange={handleChange}
                                        className="w-3.5 h-3.5 accent-rustic-green"
                                    />
                                    <span className="font-bold">Card</span>
                                </label>

                                <label className={`cursor-pointer border text-xs rounded-xl p-2.5 flex items-center gap-3 transition-all ${formData.paymentMethod === 'cod'
                                    ? 'border-rustic-green bg-rustic-green/5 text-rustic-green'
                                    : 'border-gray-100 dark:border-rustic-ash bg-gray-50 dark:bg-rustic-slate text-gray-600'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                        className="w-3.5 h-3.5 accent-rustic-green"
                                    />
                                    <span className="font-bold">Cash</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 mt-1 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total</span>
                                <span className="text-xl font-black text-rustic-green">LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-400 font-bold bg-white dark:bg-rustic-slate hover:bg-gray-50 active:scale-95 transition-all text-[10px] uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-2.5 rounded-xl shadow-md shadow-rustic-moss/20 text-[10px] uppercase tracking-wider bg-rustic-moss hover:bg-rustic-green text-white font-bold transition-all active:scale-95"
                                >
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
