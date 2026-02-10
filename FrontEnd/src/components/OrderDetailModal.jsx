import React from 'react';
import { FiX, FiPackage, FiCalendar, FiMapPin, FiCreditCard, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const OrderDetailModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <FiCheckCircle className="text-green-500" />;
            case 'pending': return <FiClock className="text-yellow-500" />;
            case 'cancelled': return <FiAlertCircle className="text-red-500" />;
            default: return <FiPackage className="text-blue-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-rustic-charcoal/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-rustic-mud w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-rustic-moss/20 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-rustic-moss/10 flex items-center justify-between bg-rustic-beige/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rustic-green/10 rounded-xl">
                            <FiPackage className="w-5 h-5 text-rustic-green" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-rustic-charcoal dark:text-white">
                                Order Details
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                #{order.id} • {formatDate(order.created_at)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-rustic-beige dark:hover:bg-rustic-charcoal rounded-xl transition-colors"
                    >
                        <FiX className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-6">
                    {/* Status & Payment Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-rustic-beige/20 dark:bg-white/5 rounded-2xl p-4 border border-rustic-moss/5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Order Status</label>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                    {order.status?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="bg-rustic-beige/20 dark:bg-white/5 rounded-2xl p-4 border border-rustic-moss/5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Payment Method</label>
                            <div className="flex items-center gap-2 text-rustic-charcoal dark:text-white">
                                <FiCreditCard className="text-rustic-green" />
                                <span className="text-sm font-bold uppercase">{order.payment_method || 'Card'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    {order.delivery_address && (
                        <div className="bg-rustic-beige/20 dark:bg-white/5 rounded-2xl p-4 border border-rustic-moss/5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Delivery Address</label>
                            <div className="flex items-start gap-2">
                                <FiMapPin className="text-rustic-green mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-rustic-charcoal dark:text-white">{order.recipient_name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address}</p>
                                    {order.recipient_phone && <p className="text-xs text-gray-500 mt-1">{order.recipient_phone}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-rustic-charcoal dark:text-white flex items-center gap-2 px-1">
                            Order Items <span className="text-xs text-gray-500 font-normal">({order.items?.length || 0})</span>
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 bg-white dark:bg-rustic-mud p-3 rounded-2xl border border-rustic-moss/10 shadow-sm transition-transform hover:scale-[1.01]"
                                >
                                    <div className="w-16 h-16 flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover rounded-xl shadow-sm"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-rustic-charcoal dark:text-white truncate">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Qty: {item.quantity} × LKR {parseFloat(item.price_at_purchase).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-rustic-green">
                                            LKR {(item.quantity * item.price_at_purchase).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer / Summary */}
                <div className="p-6 border-t border-rustic-moss/10 bg-rustic-beige/10 dark:bg-white/5">
                    <div className="flex items-center justify-between text-rustic-charcoal dark:text-white">
                        <span className="text-sm font-medium">Order Total</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-rustic-green">
                                LKR {parseFloat(order.total_amount).toLocaleString()}
                            </span>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
