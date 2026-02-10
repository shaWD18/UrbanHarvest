import { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiCalendar, FiClock } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function AdminBookingModal({ workshopId, onClose, workshopTitle }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = getToken();
                const res = await fetch(`http://localhost:3000/api/workshops/${workshopId}/bookings`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await res.json();
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        if (workshopId) {
            fetchBookings();
        }
    }, [workshopId, getToken]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-rustic-charcoal rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-scale-up">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workshop Bookings</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{workshopTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <FiX className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rustic-green"></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <div className="bg-gray-100 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiUser className="w-8 h-8 opacity-50" />
                            </div>
                            <p>No bookings found for this workshop.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:border-rustic-green/30 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-rustic-green/10 text-rustic-green flex items-center justify-center font-bold">
                                                    {booking.user_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {booking.user_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                                        <FiMail className="w-3 h-3" /> {booking.user_email}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                                                        <FiCalendar className="w-3 h-3" />
                                                        Booked on: {new Date(booking.booking_date).toLocaleDateString()} at {new Date(booking.booking_date).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-rustic-green text-white text-sm font-bold rounded-lg shadow-sm mb-1">
                                                    {booking.tickets} Ticket{booking.tickets > 1 ? 's' : ''}
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    LKR {booking.total_price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-colors font-medium text-gray-700 dark:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminBookingModal;
