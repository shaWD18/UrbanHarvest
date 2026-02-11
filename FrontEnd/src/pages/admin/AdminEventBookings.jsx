import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiArrowLeft, FiUser, FiMail, FiCalendar, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import Pagination from "../../components/Pagination";

import { API_BASE_URL } from "../../config";
const ITEMS_PER_PAGE = 10;

function AdminEventBookings() {
    const { id } = useParams();
    const { getToken } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, [id]);

    // Reset to first page when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const fetchData = async () => {
        try {
            const token = getToken();

            // Fetch event details
            const eventRes = await fetch(`${API_BASE_URL}/events/${id}`);
            if (eventRes.ok) {
                const eventData = await eventRes.json();
                setEvent(eventData);
            }

            // Fetch bookings
            const bookingsRes = await fetch(`${API_BASE_URL}/events/${id}/bookings`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setBookings(bookingsData);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user_email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "All" || booking.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const clearFilters = () => {
        setSearchTerm("");
        setFilterStatus("All");
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-charcoal">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rustic-green"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-charcoal py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    to="/admin/events"
                    className="inline-flex items-center gap-2 text-rustic-clay hover:text-rustic-earth mb-6 font-medium transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Events
                </Link>

                <div className="card-premium p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400">
                                <FiUsers className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white">
                                    Event Bookings
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-lg">
                                    {event?.title}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-white/5 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col md:items-end">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total Bookings</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{bookings.length}</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="card-premium p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Bar */}
                        <div className="md:col-span-2 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium pl-12 w-full"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-premium w-full"
                            >
                                <option value="All">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {(searchTerm || filterStatus !== "All") && (
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

                {/* Bookings Display (Hybrid View) */}
                <div className="space-y-6">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden lg:block card-premium overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-rustic-slate border-b border-gray-200 dark:border-rustic-ash">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Attendees</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-rustic-ash">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-rustic-slate transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-rustic-green/10 text-rustic-green flex items-center justify-center font-bold">
                                                            {booking.user_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {booking.user_name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                <FiMail className="w-3 h-3" /> {booking.user_email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                                                    {booking.attendees}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-sm text-gray-600 dark:text-gray-300">
                                                        <span className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</span>
                                                        <span className="text-xs text-gray-400">{new Date(booking.booking_date).toLocaleTimeString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No bookings found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View - Hidden on Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                        {currentItems.length > 0 ? (
                            currentItems.map((booking) => (
                                <div key={booking.id} className="card-premium p-5 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-rustic-green/10 text-rustic-green flex items-center justify-center font-bold text-lg">
                                            {booking.user_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{booking.user_name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                                                <FiMail className="w-3 h-3 flex-shrink-0" /> {booking.user_email}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                            ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200 dark:border-rustic-ash">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Attendees</p>
                                            <p className="text-sm text-gray-900 dark:text-white font-bold">{booking.attendees}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Booking Date</p>
                                            <div className="flex flex-col">
                                                <p className="text-sm text-gray-900 dark:text-white font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-gray-500">{new Date(booking.booking_date).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card-premium p-12 text-center text-gray-500 col-span-full">No bookings found</div>
                        )}
                    </div>

                    {filteredBookings.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={filteredBookings.length}
                            indexOfFirstItem={indexOfFirstItem}
                            indexOfLastItem={indexOfLastItem}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminEventBookings;
