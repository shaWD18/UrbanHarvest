import { useState } from "react";
import { FiCheckCircle, FiUser, FiMail, FiTag } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { API_BASE_URL } from "../config";


function BookingForm({ workshopId, eventId, title, type, price, onClose, maxTickets }) {
    const { getToken } = useAuth();
    const { refreshData } = useAppContext(); // To refresh data after booking
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "", // You might want to pre-fill this from user context if available
        email: "",
        tickets: 1,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState("");

    const validate = () => {
        let tempErrors = {};
        if (!formData.name) tempErrors.name = "Name is required";
        if (!formData.email) {
            tempErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Email is invalid";
        }
        if (formData.tickets < 1) tempErrors.tickets = "At least 1 ticket is required";
        if (maxTickets && formData.tickets > maxTickets) {
            tempErrors.tickets = `Only ${maxTickets} spots remaining`;
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setServerError(""); // Clear server error on change
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validate()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerError("");

        // Calculate total price - prices are now numeric from the database
        const priceValue = typeof price === 'number' ? price : (price ? parseFloat(String(price).replace(/[^0-9.]/g, '')) : 0);
        const total = priceValue * formData.tickets;

        try {
            const token = getToken();
            let url, body;

            if (workshopId) {
                url = `${API_BASE_URL}/workshops/${workshopId}/book`;
                body = {
                    tickets: parseInt(formData.tickets),
                    totalPrice: total
                };
            } else if (eventId) {
                url = `${API_BASE_URL}/events/${eventId}/book`;
                body = {
                    attendees: parseInt(formData.tickets),
                    // Events might be free, total is implicit or not needed if free, but let's send it just in case logic needs it
                };
            } else {
                throw new Error("Invalid booking type");
            }

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Booking failed");
            }

            setSuccess(true);
            // Refresh global data to update slots count
            if (refreshData) refreshData();

        } catch (err) {
            console.error(err);
            setServerError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8 animate-fade-in bg-white/50 dark:bg-black/20 rounded-2xl border border-green-100 dark:border-green-900/30">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-rustic-charcoal dark:text-rustic-beige mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    We've sent a confirmation email to <strong>{formData.email}</strong>.
                </p>
                <button
                    onClick={() => {
                        setSuccess(false);
                        setStep(1);
                        setFormData({ name: "", email: "", tickets: 1 });
                        if (onClose) onClose();
                    }}
                    className="bg-rustic-clay text-white px-8 py-3 rounded-full hover:bg-rustic-earth transition-colors font-semibold shadow-md"
                >
                    Book Another
                </button>
            </div>
        );
    }

    // Calculate total price - prices are now numeric from database
    const priceValue = typeof price === 'number' ? price : (price ? parseFloat(String(price).replace(/[^0-9.]/g, '')) : 0);
    const total = priceValue * formData.tickets;
    const formattedPrice = priceValue > 0 ? `LKR ${priceValue.toLocaleString()}` : 'Free';
    const formattedTotal = priceValue > 0 ? `LKR ${total.toLocaleString()}` : 'Free';

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center justify-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-rustic-clay text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <div className={`h-1 w-16 rounded ${step >= 2 ? 'bg-rustic-clay' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-rustic-clay text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                </div>
                <div className="flex justify-between text-xs text-center mt-2 px-8 text-gray-500">
                    <span>Details</span>
                    <span>Checkout</span>
                </div>
            </div>

            {step === 1 ? (
                <form onSubmit={handleNext} className="space-y-5 animate-slide-in-right">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUser className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-10 p-3 bg-gray-50 dark:bg-white/5 border rounded-xl focus:ring-2 focus:ring-rustic-clay/50 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                                placeholder="Enter your name"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 p-3 bg-gray-50 dark:bg-white/5 border rounded-xl focus:ring-2 focus:ring-rustic-clay/50 transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                                placeholder="Enter your email"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Tickets</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiTag className="text-gray-400" />
                            </div>
                            <input
                                type="number"
                                name="tickets"
                                min="1"
                                value={formData.tickets}
                                onChange={handleChange}
                                className="w-full pl-10 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rustic-clay/50 transition-all"
                            />
                        </div>

                        {errors.tickets && <p className="text-red-500 text-xs mt-1">{errors.tickets}</p>}
                    </div>

                    <div className="pt-4">
                        <div className="flex justify-between items-center mb-4 text-sm font-medium">
                            <span className="text-gray-600 dark:text-gray-400">Price per ticket</span>
                            <span className="text-rustic-charcoal dark:text-rustic-beige">{formattedPrice}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 text-lg font-bold border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                            <span className="text-gray-800 dark:text-white">Total</span>
                            <span className="text-rustic-clay">{formattedTotal}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-rustic-charcoal dark:bg-rustic-clay text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Continue to Checkout
                    </button>
                </form>
            ) : (
                <div className="animate-slide-in-right">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Summary</h4>
                    {serverError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-200">
                            {serverError}
                        </div>
                    )}
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl mb-6 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Workshop</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 text-right">{title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Name</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Email</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{formData.email}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <span className="text-gray-500 dark:text-gray-400">Total ({formData.tickets} tickets)</span>
                            <span className="font-bold text-rustic-clay">{formattedTotal}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-rustic-clay text-white py-4 rounded-xl font-bold text-lg hover:bg-rustic-earth hover:shadow-lg transition-all flex justify-center items-center"
                    >
                        {loading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            "Confirm & Pay"
                        )}
                    </button>
                    <button
                        onClick={() => setStep(1)}
                        className="w-full mt-3 text-gray-500 text-sm hover:text-gray-800 dark:hover:text-gray-300 py-2"
                    >
                        Back to Details
                    </button>
                </div>
            )}
        </div>
    );
}

export default BookingForm;
