import { FiX, FiAlertTriangle, FiPackage, FiCalendar, FiMapPin } from 'react-icons/fi';

const CancelSubscriptionModal = ({ isOpen, onClose, subscription, userSubscription, onConfirm, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="bg-white dark:bg-rustic-mud border-b border-gray-200 dark:border-rustic-ash px-8 py-6 flex items-center justify-between rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-rustic-charcoal dark:text-white">
                            Cancel Subscription
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-rustic-slate rounded-full transition-colors"
                    >
                        <FiX className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                        <p className="text-red-800 dark:text-red-300 font-semibold mb-2">
                            Are you sure you want to cancel your subscription?
                        </p>
                        <p className="text-red-600 dark:text-red-400 text-sm">
                            You will lose access to all subscription benefits and your delivery schedule will be stopped.
                        </p>
                    </div>

                    {userSubscription && (
                        <div className="bg-rustic-beige/30 dark:bg-rustic-slate/30 rounded-2xl p-6 border border-rustic-moss/10 space-y-4">
                            <h3 className="font-bold text-rustic-charcoal dark:text-white mb-3">
                                Current Subscription Details
                            </h3>

                            <div className="flex items-start gap-3">
                                <FiPackage className="w-5 h-5 text-rustic-green flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-rustic-charcoal dark:text-white">
                                        {subscription?.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="capitalize">{userSubscription.frequency}</span> • <span className="capitalize">{userSubscription.box_size}</span> box
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FiCalendar className="w-5 h-5 text-rustic-green flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {userSubscription.frequency === 'monthly'
                                            ? `Delivered on the ${userSubscription.delivery_date}${['st', 'nd', 'rd'][((userSubscription.delivery_date) % 10) - 1] || 'th'} of each month`
                                            : `Delivered every ${userSubscription.delivery_day}`
                                        }
                                    </p>
                                </div>
                            </div>

                            {userSubscription.delivery_address && (
                                <div className="flex items-start gap-3">
                                    <FiMapPin className="w-5 h-5 text-rustic-green flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p>{userSubscription.delivery_address}</p>
                                        <p>{userSubscription.delivery_city}, {userSubscription.delivery_state} {userSubscription.delivery_zip}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 You can always resubscribe later if you change your mind.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white dark:bg-rustic-mud border-t border-gray-200 dark:border-rustic-ash px-8 py-6 flex gap-4 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-rustic-slate hover:bg-gray-200 dark:hover:bg-rustic-stone transition-colors disabled:opacity-50"
                    >
                        Keep Subscription
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelSubscriptionModal;
