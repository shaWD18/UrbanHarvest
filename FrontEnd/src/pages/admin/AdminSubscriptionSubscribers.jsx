import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiArrowLeft, FiUsers, FiMail, FiCalendar, FiPackage, FiClock, FiChevronDown, FiChevronUp, FiMapPin, FiPhone, FiHome, FiSearch, FiTrash2 } from "react-icons/fi";
import Pagination from "../../components/Pagination";

const API_BASE_URL = "http://localhost:3000/api";
const ITEMS_PER_PAGE = 10;

function AdminSubscriptionSubscribers() {
    const { id } = useParams();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscriptionName, setSubscriptionName] = useState("");
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterFrequency, setFilterFrequency] = useState("All");
    const [filterBoxSize, setFilterBoxSize] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const { getToken } = useAuth();

    useEffect(() => {
        fetchData();
        fetchSubscriptionDetails();
    }, [id]);

    // Reset to first page when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterFrequency, filterBoxSize]);

    const fetchSubscriptionDetails = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSubscriptionName(data.name);
            }
        } catch (error) {
            console.error("Error fetching subscription details:", error);
        }
    };

    const fetchData = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/subscriptions/${id}/subscribers`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch subscribers");
            const data = await res.json();
            setSubscribers(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching subscribers:", error);
            setLoading(false);
        }
    };

    const toggleRow = (recordId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(recordId)) {
                newSet.delete(recordId);
            } else {
                newSet.add(recordId);
            }
            return newSet;
        });
    };

    const clearFilters = () => {
        setSearchTerm("");
        setFilterStatus("All");
        setFilterFrequency("All");
        setFilterBoxSize("All");
    };

    const filteredSubscribers = subscribers.filter(sub => {
        const matchesSearch =
            sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "All" || sub.status === filterStatus;
        const matchesFrequency = filterFrequency === "All" || sub.frequency === filterFrequency;
        const matchesBoxSize = filterBoxSize === "All" || (sub.box_size || 'medium').toLowerCase() === filterBoxSize.toLowerCase();

        return matchesSearch && matchesStatus && matchesFrequency && matchesBoxSize;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredSubscribers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-deep">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-deep py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/admin/subscriptions"
                        className="inline-flex items-center gap-2 text-rustic-clay hover:text-rustic-earth mb-6 font-medium transition-colors group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Subscriptions
                    </Link>

                    <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl p-6 md:p-8 border border-rustic-moss/10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-rustic-green/10 rounded-2xl">
                                    <FiUsers className="w-8 h-8 text-rustic-green" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-rustic-charcoal dark:text-white">
                                        Subscribers
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Viewing {subscribers.length} subscribers for <span className="font-semibold text-rustic-green">{subscriptionName}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl p-4 mb-6 border border-rustic-moss/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search Bar */}
                        <div className="lg:col-span-2 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all shadow-sm"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all shadow-sm cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Frequency Filter */}
                        <div>
                            <select
                                value={filterFrequency}
                                onChange={(e) => setFilterFrequency(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all shadow-sm cursor-pointer"
                            >
                                <option value="All">All Frequencies</option>
                                <option value="weekly">Weekly</option>
                                <option value="bi-weekly">Bi-Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>

                        {/* Box Size Filter */}
                        <div className="flex gap-2">
                            <select
                                value={filterBoxSize}
                                onChange={(e) => setFilterBoxSize(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all shadow-sm cursor-pointer"
                            >
                                <option value="All">All Box Sizes</option>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                            {(searchTerm || filterStatus !== "All" || filterFrequency !== "All" || filterBoxSize !== "All") && (
                                <button
                                    onClick={clearFilters}
                                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all shadow-sm border border-red-100 dark:border-red-900/30"
                                    title="Clear all filters"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subscribers Display (Hybrid View) */}
                <div className="space-y-6">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden lg:block bg-white dark:bg-rustic-mud rounded-3xl shadow-xl overflow-hidden border border-rustic-moss/10">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-rustic-beige/50 dark:bg-rustic-charcoal/50 border-b border-rustic-moss/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider w-12"></th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Frequency</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Box Size</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Preference</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Start Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rustic-moss/10">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((sub) => (
                                            <React.Fragment key={sub.record_id}>
                                                <tr
                                                    className={`hover:bg-rustic-beige/30 dark:hover:bg-rustic-deep/50 transition-colors cursor-pointer ${expandedRows.has(sub.record_id) ? "bg-rustic-beige/10 dark:bg-rustic-deep/20" : ""}`}
                                                    onClick={() => toggleRow(sub.record_id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <button
                                                            className="p-1 hover:bg-rustic-green/10 rounded-lg transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleRow(sub.record_id);
                                                            }}
                                                        >
                                                            {expandedRows.has(sub.record_id) ? (
                                                                <FiChevronUp className="w-5 h-5 text-rustic-green" />
                                                            ) : (
                                                                <FiChevronDown className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-rustic-charcoal dark:text-white">{sub.name}</span>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <FiMail className="w-3 h-3" /> {sub.email}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${sub.status === 'active'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {sub.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">{sub.frequency}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">
                                                        <div className="flex items-center gap-2">
                                                            <FiPackage className="text-rustic-clay" />
                                                            {sub.box_size || 'Medium'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <FiClock className="text-rustic-clay" />
                                                            {sub.frequency === 'monthly'
                                                                ? `Date: ${sub.delivery_date}`
                                                                : `Day: ${sub.delivery_day}`
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <div className="flex items-center gap-2">
                                                            <FiCalendar className="text-rustic-clay" />
                                                            {new Date(sub.start_date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Expanded Details Row */}
                                                {expandedRows.has(sub.record_id) && (
                                                    <tr className="bg-rustic-beige/20 dark:bg-rustic-deep/30">
                                                        <td colSpan="7" className="px-6 py-6 border-t border-rustic-moss/5">
                                                            <div className="max-w-4xl">
                                                                <h3 className="text-lg font-bold text-rustic-charcoal dark:text-white mb-4 flex items-center gap-2">
                                                                    <FiHome className="text-rustic-green" />
                                                                    Delivery Details
                                                                </h3>

                                                                {sub.delivery_address ? (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        {/* Delivery Address */}
                                                                        <div className="bg-white dark:bg-rustic-mud rounded-2xl p-5 border border-rustic-moss/10">
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="p-2 bg-rustic-green/10 rounded-lg">
                                                                                    <FiMapPin className="w-5 h-5 text-rustic-green" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Delivery Address</p>
                                                                                    <p className="text-sm text-rustic-charcoal dark:text-white font-medium">{sub.delivery_address}</p>
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                                                        {sub.delivery_city}, {sub.delivery_state} {sub.delivery_zip}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Contact Information */}
                                                                        <div className="bg-white dark:bg-rustic-mud rounded-2xl p-5 border border-rustic-moss/10">
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="p-2 bg-rustic-green/10 rounded-lg">
                                                                                    <FiPhone className="w-5 h-5 text-rustic-green" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Contact Phone</p>
                                                                                    <p className="text-sm text-rustic-charcoal dark:text-white font-medium">{sub.delivery_phone}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Subscription Details */}
                                                                        <div className="bg-white dark:bg-rustic-mud rounded-2xl p-5 border border-rustic-moss/10">
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="p-2 bg-rustic-green/10 rounded-lg">
                                                                                    <FiPackage className="w-5 h-5 text-rustic-green" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Subscription Info</p>
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                                        <span className="font-semibold text-rustic-charcoal dark:text-white capitalize">{sub.frequency}</span> delivery
                                                                                    </p>
                                                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                                        <span className="font-semibold text-rustic-charcoal dark:text-white capitalize">{sub.box_size || 'Medium'}</span> box size
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Delivery Schedule */}
                                                                        <div className="bg-white dark:bg-rustic-mud rounded-2xl p-5 border border-rustic-moss/10">
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="p-2 bg-rustic-green/10 rounded-lg">
                                                                                    <FiCalendar className="w-5 h-5 text-rustic-green" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Delivery Schedule</p>
                                                                                    <p className="text-sm text-rustic-charcoal dark:text-white font-medium">
                                                                                        {sub.frequency === 'monthly'
                                                                                            ? `${sub.delivery_date}${['st', 'nd', 'rd'][((sub.delivery_date) % 10) - 1] || 'th'} of each month`
                                                                                            : `Every ${sub.delivery_day}`
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                                        Started: {new Date(sub.start_date).toLocaleDateString()}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-5">
                                                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                                            ⚠️ No delivery address information available for this subscriber. This subscription may have been created before address collection was implemented.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No subscribers found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View - Hidden on Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                        {currentItems.length > 0 ? (
                            currentItems.map((sub) => (
                                <div key={sub.record_id} className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl border border-rustic-moss/10 overflow-hidden">
                                    <div className="p-5 flex flex-col gap-4">
                                        {/* User Info & Status */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-rustic-charcoal dark:text-white truncate">{sub.name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <FiMail className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{sub.email}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sub.status === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {sub.status}
                                            </span>
                                        </div>

                                        {/* Grid Info */}
                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-rustic-moss/10">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Frequency</p>
                                                <p className="text-sm text-rustic-charcoal dark:text-white font-medium capitalize">{sub.frequency}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Box Size</p>
                                                <p className="text-sm text-rustic-charcoal dark:text-white font-medium capitalize">{sub.box_size || 'Medium'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Delivery Info</p>
                                                <p className="text-sm text-rustic-charcoal dark:text-white font-medium">
                                                    {sub.frequency === 'monthly' ? `Date: ${sub.delivery_date}` : `Day: ${sub.delivery_day}`}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Started On</p>
                                                <p className="text-sm text-rustic-charcoal dark:text-white font-medium">
                                                    {new Date(sub.start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Expand Toggle Button */}
                                        <button
                                            onClick={() => toggleRow(sub.record_id)}
                                            className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${expandedRows.has(sub.record_id) ? "bg-rustic-green text-white" : "bg-rustic-green/5 text-rustic-green hover:bg-rustic-green/10"}`}
                                        >
                                            <span className="text-sm font-bold">Delivery Details</span>
                                            {expandedRows.has(sub.record_id) ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Mobile Expanded Details */}
                                    {expandedRows.has(sub.record_id) && (
                                        <div className="p-5 bg-rustic-beige/20 dark:bg-rustic-deep/30 border-t border-rustic-moss/5 animate-in slide-in-from-top duration-300">
                                            {sub.delivery_address ? (
                                                <div className="space-y-4">
                                                    <div className="flex gap-3">
                                                        <FiMapPin className="w-5 h-5 text-rustic-green flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Address</p>
                                                            <p className="text-sm text-rustic-charcoal dark:text-white">{sub.delivery_address}</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                {sub.delivery_city}, {sub.delivery_state} {sub.delivery_zip}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <FiPhone className="w-5 h-5 text-rustic-green flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Phone</p>
                                                            <p className="text-sm text-rustic-charcoal dark:text-white font-medium">{sub.delivery_phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 pt-2">
                                                        <FiCalendar className="w-5 h-5 text-rustic-green flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Full Schedule</p>
                                                            <p className="text-sm text-rustic-charcoal dark:text-white">
                                                                {sub.frequency === 'monthly'
                                                                    ? `${sub.delivery_date}${['st', 'nd', 'rd'][((sub.delivery_date) % 10) - 1] || 'th'} of each month`
                                                                    : `Every ${sub.delivery_day}`
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                                    <p className="text-xs text-yellow-800 dark:text-yellow-300">No address info available.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl border border-rustic-moss/10 p-12 text-center text-gray-500 col-span-full">No subscribers found</div>
                        )}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredSubscribers.length}
                        indexOfFirstItem={indexOfFirstItem}
                        indexOfLastItem={indexOfLastItem}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminSubscriptionSubscribers;
