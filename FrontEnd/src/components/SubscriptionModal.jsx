import { useState } from 'react';
import { FiX, FiMapPin, FiPhone, FiCheck, FiPackage, FiCalendar, FiClock } from 'react-icons/fi';

const SubscriptionModal = ({
    isOpen,
    onClose,
    subscription,
    selectedFrequency,
    boxSize,
    deliveryDay,
    deliveryDate,
    onConfirm
}) => {
    const [step, setStep] = useState(1); // 1: Address Form, 2: Confirmation
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        delivery_address: '',
        delivery_city: '',
        delivery_state: '',
        delivery_zip: '',
        delivery_phone: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;
        if (name === 'delivery_phone') {
            // Only allow digits and limit to 10
            finalValue = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.delivery_address.trim()) {
            errors.delivery_address = 'Street address is required';
        }
        if (!formData.delivery_city.trim()) {
            errors.delivery_city = 'City is required';
        }
        if (!formData.delivery_state.trim()) {
            errors.delivery_state = 'State is required';
        }
        if (!formData.delivery_zip.trim()) {
            errors.delivery_zip = 'Zip code is required';
        } else if (!/^\d{5,6}$/.test(formData.delivery_zip.trim())) {
            errors.delivery_zip = 'Invalid zip code format';
        }
        if (!formData.delivery_phone.trim()) {
            errors.delivery_phone = 'Phone number is required';
        } else if (formData.delivery_phone.trim().length !== 10) {
            errors.delivery_phone = 'Phone number must be exactly 10 digits';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinue = () => {
        if (validateForm()) {
            setStep(2);
        }
    };

    const handleConfirmSubscription = async () => {
        setLoading(true);
        setError('');
        try {
            await onConfirm(formData);
            // Reset form and close
            setFormData({
                delivery_address: '',
                delivery_city: '',
                delivery_state: '',
                delivery_zip: '',
                delivery_phone: ''
            });
            setStep(1);
        } catch (err) {
            setError(err.message || 'Failed to subscribe');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setError('');
        setFormErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-gray-900/60 backdrop-blur-sm overflow-hidden">
            <div className="bg-white dark:bg-rustic-mud rounded-2xl shadow-2xl w-full sm:max-w-xl md:max-w-2xl border border-gray-100 dark:border-rustic-ash max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                {/* Header - Compact */}
                <div className="sticky top-0 bg-white dark:bg-rustic-mud border-b border-gray-200 dark:border-rustic-ash px-4 py-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-rustic-charcoal dark:text-white break-words">
                            {step === 1 ? 'Delivery Information' : 'Confirm Subscription'}
                        </h2>
                        <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
                            {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-rustic-slate rounded-full transition-colors"
                    >
                        <FiX className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="px-4 md:px-8 py-4 md:py-6 overflow-y-auto scrollbar-thin flex-grow">
                    {step === 1 ? (
                        // Step 1: Address Form
                        <div className="space-y-6">
                            <div className="bg-rustic-beige/30 dark:bg-rustic-slate/30 rounded-xl p-4 border border-rustic-moss/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiPackage className="w-4 h-4 text-rustic-green" />
                                    <h3 className="text-sm font-bold text-rustic-charcoal dark:text-white">
                                        {subscription?.name}
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-3 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-500">Frequency:</span>
                                        <span className="font-semibold text-rustic-charcoal dark:text-white capitalize">
                                            {selectedFrequency}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-gray-500">Box Size:</span>
                                        <span className="font-semibold text-rustic-charcoal dark:text-white capitalize">
                                            {boxSize}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        <FiMapPin className="inline w-3 h-3 mr-1" />
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="delivery_address"
                                        value={formData.delivery_address}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-rustic-slate border ${formErrors.delivery_address
                                            ? 'border-red-500 shadow-sm shadow-red-500/10'
                                            : 'border-gray-100 dark:border-rustic-stone'
                                            } focus:ring-1 focus:ring-rustic-green outline-none transition-all placeholder:text-gray-300`}
                                        placeholder="123 Main St"
                                    />
                                    {formErrors.delivery_address && (
                                        <p className="text-red-500 text-[10px] mt-0.5 font-semibold">{formErrors.delivery_address}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="delivery_city"
                                            value={formData.delivery_city}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-rustic-slate border ${formErrors.delivery_city
                                                ? 'border-red-500 shadow-sm shadow-red-500/10'
                                                : 'border-gray-100 dark:border-rustic-stone'
                                                } focus:ring-1 focus:ring-rustic-green outline-none transition-all placeholder:text-gray-300`}
                                            placeholder="City"
                                        />
                                        {formErrors.delivery_city && (
                                            <p className="text-red-500 text-[10px] mt-0.5 font-semibold">{formErrors.delivery_city}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="delivery_state"
                                            value={formData.delivery_state}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-rustic-slate border ${formErrors.delivery_state
                                                ? 'border-red-500 shadow-sm shadow-red-500/10'
                                                : 'border-gray-100 dark:border-rustic-stone'
                                                } focus:ring-1 focus:ring-rustic-green outline-none transition-all placeholder:text-gray-300`}
                                            placeholder="ST"
                                        />
                                        {formErrors.delivery_state && (
                                            <p className="text-red-500 text-[10px] mt-0.5 font-semibold">{formErrors.delivery_state}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                            Zip Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="delivery_zip"
                                            value={formData.delivery_zip}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-rustic-slate border ${formErrors.delivery_zip
                                                ? 'border-red-500 shadow-sm shadow-red-500/10'
                                                : 'border-gray-100 dark:border-rustic-stone'
                                                } focus:ring-1 focus:ring-rustic-green outline-none transition-all placeholder:text-gray-300`}
                                            placeholder="12345"
                                        />
                                        {formErrors.delivery_zip && (
                                            <p className="text-red-500 text-[10px] mt-0.5 font-semibold">{formErrors.delivery_zip}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        <FiPhone className="inline w-3 h-3 mr-1" />
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="delivery_phone"
                                        value={formData.delivery_phone}
                                        onChange={handleChange}
                                        maxLength={10}
                                        className={`w-full px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-rustic-slate border ${formErrors.delivery_phone
                                            ? 'border-red-500 shadow-sm shadow-red-500/10'
                                            : 'border-gray-100 dark:border-rustic-stone'
                                            } focus:ring-1 focus:ring-rustic-green outline-none transition-all placeholder:text-gray-300`}
                                        placeholder="10-digit phone number"
                                    />
                                    {formErrors.delivery_phone && (
                                        <p className="text-red-500 text-[10px] mt-0.5 font-semibold">{formErrors.delivery_phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Step 2: Confirmation
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                                <h3 className="font-bold text-lg text-rustic-charcoal dark:text-white mb-4">
                                    Subscription Summary
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <FiPackage className="w-5 h-5 text-rustic-green flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-rustic-charcoal dark:text-white">
                                                {subscription?.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {subscription?.price}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiClock className="w-5 h-5 text-rustic-green flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-semibold text-rustic-charcoal dark:text-white capitalize">
                                                    {selectedFrequency}
                                                </span> delivery • <span className="capitalize">{boxSize}</span> box
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiCalendar className="w-5 h-5 text-rustic-green flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {selectedFrequency === 'monthly'
                                                    ? `Delivered on the ${deliveryDate}${['st', 'nd', 'rd'][((deliveryDate) % 10) - 1] || 'th'} of each month`
                                                    : `Delivered every ${deliveryDay}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-rustic-beige/30 dark:bg-rustic-slate/30 rounded-2xl p-6 border border-rustic-moss/10">
                                <h3 className="font-bold text-lg text-rustic-charcoal dark:text-white mb-4 flex items-center gap-2">
                                    <FiMapPin className="w-5 h-5 text-rustic-green" />
                                    Delivery Address
                                </h3>
                                <div className="text-gray-600 dark:text-gray-300 space-y-1">
                                    <p>{formData.delivery_address}</p>
                                    <p>{formData.delivery_city}, {formData.delivery_state} {formData.delivery_zip}</p>
                                    <p className="flex items-center gap-2 mt-2">
                                        <FiPhone className="w-4 h-4" />
                                        {formData.delivery_phone}
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    <FiCheck className="inline w-4 h-4 mr-1" />
                                    By confirming, you agree to subscribe to this plan. You can cancel anytime.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Compact */}
                <div className="sticky bottom-0 bg-white dark:bg-rustic-mud border-t border-gray-200 dark:border-rustic-ash px-4 py-3 flex gap-2.5">
                    {step === 1 ? (
                        <>
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2 px-4 rounded-lg text-xs font-bold text-gray-500 bg-gray-50 dark:bg-rustic-slate hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleContinue}
                                className="flex-1 py-2 px-4 rounded-lg text-xs font-bold text-white bg-rustic-moss hover:bg-rustic-green transition-all shadow-sm active:scale-95"
                            >
                                Continue
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="flex-1 py-2 px-4 rounded-lg text-xs font-bold text-gray-500 bg-gray-50 dark:bg-rustic-slate hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirmSubscription}
                                disabled={loading}
                                className="flex-1 py-2 px-4 rounded-lg text-xs font-bold text-white bg-rustic-moss hover:bg-rustic-green transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                {loading ? 'Wait...' : 'Confirm'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
