import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiArrowLeft, FiShoppingBag, FiSearch, FiEye, FiPackage, FiUser, FiCalendar, FiDollarSign, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Pagination from "../../components/Pagination";
import OrderDetailModal from "../../components/OrderDetailModal";

import { API_BASE_URL } from "../../config";
const ITEMS_PER_PAGE = 10;

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const { getToken } = useAuth();

    useEffect(() => {
        fetchOrders();
    }, []);

    // Reset to first page when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/admin/orders`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await res.json();
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = getToken();
            await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === "all" || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "cancelled":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const formatDate = (dateString, includeTime = true) => {
        if (includeTime) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-deep">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rustic-green mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-deep py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 text-rustic-clay hover:text-rustic-earth mb-6 font-medium transition-colors group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl p-6 md:p-8 border border-rustic-moss/10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-rustic-green/10 rounded-2xl">
                                    <FiShoppingBag className="w-8 h-8 text-rustic-green" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-rustic-charcoal dark:text-white">
                                        Manage Orders
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Viewing {filteredOrders.length} orders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all shadow-sm cursor-pointer min-w-[150px]"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Orders Display (Hybrid View) */}
                <div className="space-y-6">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden lg:block bg-white dark:bg-rustic-mud rounded-3xl shadow-xl overflow-hidden border border-rustic-moss/10">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-rustic-beige/50 dark:bg-rustic-charcoal/50 border-b border-rustic-moss/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rustic-moss/10">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((order) => (
                                            <React.Fragment key={order.id}>
                                                <tr className="hover:bg-rustic-beige/30 dark:hover:bg-rustic-deep/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleOrderExpansion(order.id)}
                                                                className="p-1 hover:bg-rustic-green/10 rounded-lg transition-colors"
                                                            >
                                                                {expandedOrders.has(order.id) ? (
                                                                    <FiChevronUp className="w-4 h-4 text-rustic-green" />
                                                                ) : (
                                                                    <FiChevronDown className="w-4 h-4 text-gray-400" />
                                                                )}
                                                            </button>
                                                            <FiPackage className="w-4 h-4 text-gray-400" />
                                                            <span className="font-semibold text-rustic-charcoal dark:text-white">#{order.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-semibold text-rustic-charcoal dark:text-white">{order.customer_name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer_email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <FiCalendar className="w-4 h-4" />
                                                            <span className="text-sm">{formatDate(order.created_at)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-rustic-charcoal dark:text-white font-bold">
                                                        LKR {parseFloat(order.total_amount).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                            className={`px-3 py-1 rounded-lg text-sm font-bold cursor-pointer border-0 ${getStatusColor(order.status)}`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => viewOrderDetails(order)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                        >
                                                            <FiEye className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                                {/* Expandable Table Row */}
                                                {expandedOrders.has(order.id) && (
                                                    <tr className="bg-rustic-beige/20 dark:bg-rustic-deep/30">
                                                        <td colSpan="6" className="px-6 py-6 border-t border-rustic-moss/5">
                                                            <div className="ml-8 space-y-3">
                                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Items ({order.items.length})</h4>
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center gap-4 bg-white dark:bg-rustic-mud rounded-xl p-3 border border-rustic-moss/10">
                                                                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold dark:text-white text-sm">{item.name}</p>
                                                                            <p className="text-xs text-gray-500">Qty: {item.quantity} × LKR {parseFloat(item.price_at_purchase).toFixed(2)}</p>
                                                                        </div>
                                                                        <p className="font-bold text-rustic-green">LKR {(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No orders found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View - Hidden on Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                        {currentItems.length > 0 ? (
                            currentItems.map((order) => (
                                <div key={order.id} className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl border border-rustic-moss/10 overflow-hidden flex flex-col">
                                    <div className="p-5 flex flex-col gap-4">
                                        {/* Status & Actions Bar */}
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <FiPackage className="w-4 h-4 text-gray-400" />
                                                <span className="font-bold text-rustic-charcoal dark:text-white">#{order.id}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => viewOrderDetails(order)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                >
                                                    <FiEye className="w-5 h-5" />
                                                </button>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border-0 uppercase ${getStatusColor(order.status)}`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="flex flex-col">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Customer</p>
                                            <p className="font-bold text-rustic-charcoal dark:text-white truncate">{order.customer_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.customer_email}</p>
                                        </div>

                                        {/* Grid Info */}
                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-rustic-moss/10">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Amount</p>
                                                <p className="text-sm text-rustic-green font-bold">LKR {parseFloat(order.total_amount).toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Order Date</p>
                                                <p className="text-xs text-rustic-charcoal dark:text-white font-medium">{formatDate(order.created_at, false)}</p>
                                            </div>
                                        </div>

                                        {/* Items Expansion Toggle */}
                                        <button
                                            onClick={() => toggleOrderExpansion(order.id)}
                                            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${expandedOrders.has(order.id) ? "bg-rustic-green text-white" : "bg-rustic-green/5 text-rustic-green"}`}
                                        >
                                            <span className="text-sm font-bold">View Items ({order.items.length})</span>
                                            {expandedOrders.has(order.id) ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Mobile Expanded Items */}
                                    {expandedOrders.has(order.id) && (
                                        <div className="p-4 bg-rustic-beige/20 dark:bg-rustic-deep/30 border-t border-rustic-moss/5 space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-rustic-mud p-2 rounded-xl border border-rustic-moss/10 shadow-sm">
                                                    <img src={item.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold dark:text-white truncate">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500">Qty: {item.quantity} × {parseFloat(item.price_at_purchase).toFixed(0)}</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-rustic-green whitespace-nowrap">LKR {(item.quantity * item.price_at_purchase).toFixed(0)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl p-12 text-center text-gray-500 col-span-full">No orders found</div>
                        )}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredOrders.length}
                        indexOfFirstItem={indexOfFirstItem}
                        indexOfLastItem={indexOfLastItem}
                    />
                </div>
            </div>

            {/* Order Details Modal */}
            <OrderDetailModal
                order={selectedOrder}
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
            />
        </div>
    );
}

export default AdminOrders;
