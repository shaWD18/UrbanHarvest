
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiCheck, FiArrowLeft, FiClock, FiStar, FiCalendar, FiBox, FiMapPin, FiPhone, FiEdit2, FiTrash2 } from "react-icons/fi";
import SubscriptionModal from "../components/SubscriptionModal";
import CancelSubscriptionModal from "../components/CancelSubscriptionModal";

const SubscriptionDetails = ({ adminPreview = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, getToken } = useAuth();

    const [subscription, setSubscription] = useState(null);
    const [userSubscription, setUserSubscription] = useState(null);
    const [hasEverSubscribed, setHasEverSubscribed] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [reviewPage, setReviewPage] = useState(1);
    const REVIEWS_PER_PAGE = 5;

    // Modal state
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Config state
    const [selectedFrequency, setSelectedFrequency] = useState("monthly");
    const [boxSize, setBoxSize] = useState("medium");
    const [deliveryDay, setDeliveryDay] = useState("Monday");
    const [deliveryDate, setDeliveryDate] = useState("1");

    // Review form state
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);

    useEffect(() => {
        fetchData();
        setReviewPage(1);
    }, [id, user]);

    const fetchData = async () => {
        try {
            const token = getToken();
            const subRes = await fetch(`https://urbanharvest-production.up.railway.app/api/subscriptions/${id}`);
            if (!subRes.ok) throw new Error("Subscription not found");
            const subData = await subRes.json();
            setSubscription(subData);

            const reviewsRes = await fetch(`https://urbanharvest-production.up.railway.app/api/subscriptions/${id}/reviews`);
            if (reviewsRes.ok) {
                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData);
            }

            if (user && token) {
                const statusRes = await fetch(`https://urbanharvest-production.up.railway.app/api/subscriptions/${id}/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    console.log('Subscription status data:', statusData);

                    if (statusData.isSubscribed) {
                        setUserSubscription(statusData.subscription);
                    } else {
                        setUserSubscription(null);
                    }
                    // Check if user has ever subscribed (active or cancelled)
                    if (statusData.subscription) {
                        console.log('User has subscription record, setting hasEverSubscribed to true');
                        setHasEverSubscribed(true);
                    } else {
                        console.log('No subscription record found');
                        setHasEverSubscribed(false);
                    }
                }
            } else {
                setUserSubscription(null);
                setHasEverSubscribed(false);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubscribe = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setShowSubscribeModal(true);
    };

    const handleConfirmSubscription = async (addressData) => {
        const token = getToken();
        setSubscribing(true);
        try {
            const payload = {
                frequency: selectedFrequency,
                box_size: boxSize,
                ...addressData
            };

            // Add conditional fields
            if (selectedFrequency === 'monthly') {
                payload.delivery_date = parseInt(deliveryDate);
            } else {
                payload.delivery_day = deliveryDay;
            }

            const response = await fetch(`https://urbanharvest-production.up.railway.app/api/subscriptions/${id}/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                if (response.status === 401 || response.status === 403) {
                    alert("Your session has expired. Please login again.");
                    navigate("/login");
                    return;
                }
                throw new Error(err.error || "Failed to subscribe");
            }

            setShowSubscribeModal(false);
            fetchData();
        } catch (error) {
            throw error;
        } finally {
            setSubscribing(false);
        }
    };

    const handleUnsubscribe = () => {
        setShowCancelModal(true);
    };

    const handleConfirmCancellation = async () => {
        const token = getToken();
        setSubscribing(true);
        try {
            const response = await fetch(`https://urbanharvest-production.up.railway.app/api/subscriptions/${id}/unsubscribe`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Failed to unsubscribe");
            setShowCancelModal(false);
            fetchData();
        } catch (error) {
            alert(error.message);
        } finally {
            setSubscribing(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError("");
        setReviewSubmitting(true);
        const token = getToken();
        try {
            const url = editingReviewId
                ? `https://urbanharvest-production.up.railway.app/api/subscriptions/${id}/reviews/${editingReviewId}`
                : `https://urbanharvest-production.up.railway.app/api/subscriptions/${id}/reviews`;

            const method = editingReviewId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ rating, review_text: reviewText })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to submit review");
            }

            setReviewText("");
            setRating(5);
            setEditingReviewId(null);
            setReviewPage(1);
            fetchData();
        } catch (error) {
            setReviewError(error.message);
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review.id);
        setRating(review.rating);
        setReviewText(review.review_text);
        // Scroll to form
        window.scrollTo({ top: document.querySelector('form').offsetTop - 100, behavior: 'smooth' });
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        const token = getToken();
        try {
            const response = await fetch(`https://urbanharvest-production.up.railway.app/api/subscriptions/${id}/reviews/${reviewId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                fetchData();
            } else {
                const err = await response.json();
                alert(err.error || "Failed to delete review");
            }
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-deep">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
            </div>
        );
    }

    if (!subscription) {
        return <div className="text-center py-20">Subscription not found</div>;
    }

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-deep py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(adminPreview ? '/admin/subscriptions' : '/subscriptions')}
                    className="flex items-center text-rustic-clay hover:text-rustic-earth mb-8 transition-colors"
                >
                    <FiArrowLeft className="mr-2" /> Back to Subscriptions
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    <div className="flex flex-col gap-8">
                        <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={subscription.image}
                                alt={subscription.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6">
                                <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-rustic-green uppercase tracking-wide">
                                    {subscription.type}
                                </span>
                            </div>
                        </div>

                        {/* How it Works Section */}
                        <div className="bg-white dark:bg-rustic-mud rounded-2xl p-6 border border-rustic-moss/10 shadow-sm">
                            <h3 className="font-bold text-lg text-rustic-charcoal dark:text-white mb-4">How it works</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-rustic-green/10 flex-shrink-0 flex items-center justify-center text-rustic-green font-bold text-sm">1</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Customize your subscription frequency and size preferences</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-rustic-green/10 flex-shrink-0 flex items-center justify-center text-rustic-green font-bold text-sm">2</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">We carefully curate and pack your box with premium quality items</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-rustic-green/10 flex-shrink-0 flex items-center justify-center text-rustic-green font-bold text-sm">3</div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Delivered directly to your doorstep on your chosen day</p>
                                </div>
                            </div>
                        </div>

                        {/* Member Benefits Section */}
                        <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-900/30">
                            <h3 className="font-bold text-lg text-rustic-charcoal dark:text-white mb-4">Member Benefits</h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <FiCheck className="text-green-500" /> Free delivery
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <FiCheck className="text-green-500" /> Save 20% vs one-time
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <FiCheck className="text-green-500" /> Cancel anytime
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <FiCheck className="text-green-500" /> Exclusive items
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-2xl md:text-5xl font-serif font-bold text-rustic-charcoal dark:text-white mb-6">
                            {subscription.name}
                        </h1>
                        <p className="text-lg text-rustic-clay dark:text-gray-300 mb-8 leading-relaxed">
                            {subscription.description}
                        </p>

                        <div className="bg-white dark:bg-rustic-mud p-8 rounded-2xl shadow-lg border border-rustic-moss/10 mb-8">
                            <h3 className="text-lg font-bold text-rustic-charcoal dark:text-white mb-4">What's Included:</h3>
                            <div className="space-y-3">
                                {subscription.features && subscription.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-rustic-green/10 flex items-center justify-center">
                                            <FiCheck className="w-3 h-3 text-rustic-green" />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subscription Actions */}
                        <div className="bg-white dark:bg-rustic-mud p-8 rounded-2xl shadow-lg border border-rustic-moss/10">

                            {!userSubscription && !adminPreview && (
                                <div className="space-y-6 mb-8 border-b border-gray-100 dark:border-rustic-ash pb-8">
                                    <h3 className="font-bold text-gray-700 dark:text-white">Customize Plan</h3>

                                    {/* Frequency */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 font-medium">Frequency</span>
                                        <select
                                            value={selectedFrequency}
                                            onChange={(e) => setSelectedFrequency(e.target.value)}
                                            className="bg-gray-50 dark:bg-rustic-slate border-gray-200 dark:border-rustic-stone rounded-lg px-4 py-2 font-semibold focus:ring-2 focus:ring-rustic-green outline-none"
                                        >
                                            <option value="weekly">Weekly</option>
                                            <option value="bi-weekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    {/* Box Size */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 font-medium">Box Size</span>
                                        <select
                                            value={boxSize}
                                            onChange={(e) => setBoxSize(e.target.value)}
                                            className="bg-gray-50 dark:bg-rustic-slate border-gray-200 dark:border-rustic-stone rounded-lg px-4 py-2 font-semibold focus:ring-2 focus:ring-rustic-green outline-none"
                                        >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                    </div>

                                    {/* Delivery Preference */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 font-medium">
                                            {selectedFrequency === 'monthly' ? 'Delivery Date' : 'Delivery Day'}
                                        </span>
                                        {selectedFrequency === 'monthly' ? (
                                            <select
                                                value={deliveryDate}
                                                onChange={(e) => setDeliveryDate(e.target.value)}
                                                className="bg-gray-50 dark:bg-rustic-slate border-gray-200 dark:border-rustic-stone rounded-lg px-4 py-2 font-semibold focus:ring-2 focus:ring-rustic-green outline-none"
                                            >
                                                {[...Array(28)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}{['st', 'nd', 'rd'][((i + 1) % 10) - 1] || 'th'} of month</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <select
                                                value={deliveryDay}
                                                onChange={(e) => setDeliveryDay(e.target.value)}
                                                className="bg-gray-50 dark:bg-rustic-slate border-gray-200 dark:border-rustic-stone rounded-lg px-4 py-2 font-semibold focus:ring-2 focus:ring-rustic-green outline-none"
                                            >
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                                <option value="Saturday">Saturday</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase font-bold">Total Price</p>
                                    <p className="text-3xl font-bold text-rustic-green dark:text-green-400">
                                        {subscription.price === 0 || subscription.price === "0" || subscription.price === "0.00"
                                            ? "Free"
                                            : `LKR ${Number(subscription.price).toLocaleString()}`}
                                    </p>
                                </div>
                            </div>

                            {adminPreview ? (
                                <button
                                    disabled
                                    className="w-full py-4 bg-gray-400 text-white rounded-xl font-bold text-lg cursor-not-allowed"
                                >
                                    Admin Preview Mode
                                </button>
                            ) : userSubscription ? (
                                <div className="space-y-4">
                                    <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                        <div className="flex items-center gap-3 text-green-700 dark:text-green-400 mb-3">
                                            <FiCheck className="w-5 h-5 flex-shrink-0" />
                                            <p className="font-bold text-lg">Active Subscription</p>
                                        </div>
                                        <div className="ml-8 text-sm text-green-800 dark:text-green-300 space-y-2">
                                            <p><span className="font-semibold">Frequency:</span> {userSubscription.frequency}</p>
                                            <p><span className="font-semibold">Size:</span> {userSubscription.box_size || 'Standard'}</p>
                                            <p>
                                                <span className="font-semibold">Delivery:</span>
                                                {userSubscription.frequency === 'monthly'
                                                    ? ` on the ${userSubscription.delivery_date}${['st', 'nd', 'rd'][((userSubscription.delivery_date) % 10) - 1] || 'th'}`
                                                    : ` every ${userSubscription.delivery_day}`
                                                }
                                            </p>
                                            {userSubscription.delivery_address && (
                                                <div className="pt-2 mt-2 border-t border-green-200 dark:border-green-700">
                                                    <p className="font-semibold flex items-center gap-1 mb-1">
                                                        <FiMapPin className="w-4 h-4" />
                                                        Delivery Address:
                                                    </p>
                                                    <p className="ml-5">{userSubscription.delivery_address}</p>
                                                    <p className="ml-5">{userSubscription.delivery_city}, {userSubscription.delivery_state} {userSubscription.delivery_zip}</p>
                                                    <p className="ml-5 flex items-center gap-1 mt-1">
                                                        <FiPhone className="w-3 h-3" />
                                                        {userSubscription.delivery_phone}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleUnsubscribe}
                                        disabled={subscribing}
                                        className="w-full py-4 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        Cancel Subscription
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className="w-full py-4 bg-rustic-green text-white rounded-xl font-bold text-lg hover:bg-rustic-moss transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    {subscribing ? "Processing..." : "Subscribe Now"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-200 dark:border-rustic-ash pt-16">
                    <h2 className="text-3xl font-serif font-bold text-rustic-charcoal dark:text-white mb-8">
                        Member Reviews ({reviews.length})
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Review Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-rustic-mud p-8 rounded-2xl shadow-lg border border-rustic-moss/10 sticky top-24">
                                <h3 className="text-xl font-bold text-rustic-charcoal dark:text-white mb-6">Write a Review</h3>
                                {user ? (
                                    hasEverSubscribed ? (
                                        <form onSubmit={handleReviewSubmit}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setRating(star)}
                                                            className={`text-2xl transition-colors ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-6">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Your Review</label>
                                                <textarea
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-rustic-slate border-gray-200 dark:border-rustic-stone focus:ring-2 focus:ring-rustic-green focus:border-transparent outline-none transition-all"
                                                    rows="4"
                                                    placeholder="Share your experience..."
                                                    required
                                                ></textarea>
                                            </div>
                                            {reviewError && <p className="text-red-500 mb-4 text-sm">{reviewError}</p>}
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={reviewSubmitting}
                                                    className="flex-1 py-3 bg-rustic-charcoal text-white rounded-xl font-bold hover:bg-black transition-all"
                                                >
                                                    {reviewSubmitting ? "Submitting..." : editingReviewId ? "Update Review" : "Post Review"}
                                                </button>
                                                {editingReviewId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingReviewId(null);
                                                            setReviewText("");
                                                            setRating(5);
                                                        }}
                                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-4 bg-gray-50 dark:bg-rustic-slate rounded-xl text-center">
                                            <p className="text-gray-600 dark:text-gray-400">You must subscribe to leave a review.</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="p-4 bg-gray-50 dark:bg-rustic-slate rounded-xl text-center">
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">Please login to leave a review.</p>
                                        <button onClick={() => navigate("/login")} className="text-rustic-green font-bold hover:underline">Login here</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="lg:col-span-2 space-y-6">
                            {reviews.length > 0 ? (
                                <>
                                    <div className="space-y-6">
                                        {reviews
                                            .slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
                                            .map((review) => (
                                                <div key={review.id} className="bg-white dark:bg-rustic-mud p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-rustic-ash">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-rustic-green/10 flex items-center justify-center text-rustic-green font-bold text-lg">
                                                                {review.user_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-rustic-charcoal dark:text-white">{review.user_name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(review.updated_at || review.created_at).toLocaleDateString()}
                                                                    {review.updated_at && new Date(review.updated_at).getTime() !== new Date(review.created_at).getTime() && (
                                                                        <span className="ml-2 text-rustic-moss dark:text-rustic-beige italic">(Edited)</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex text-yellow-400">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i} className="text-lg">{i < review.rating ? "★" : "☆"}</span>
                                                                ))}
                                                            </div>
                                                            {user && user.id === review.user_id && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleEditReview(review)}
                                                                        className="text-blue-500 hover:text-blue-700 p-1 transition-colors"
                                                                        title="Edit Review"
                                                                    >
                                                                        <FiEdit2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReview(review.id)}
                                                                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                                                        title="Delete Review"
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{review.review_text}</p>
                                                </div>
                                            ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {reviews.length > REVIEWS_PER_PAGE && (
                                        <div className="flex items-center justify-center gap-2 mt-8 py-4">
                                            <button
                                                disabled={reviewPage === 1}
                                                onClick={() => setReviewPage(prev => prev - 1)}
                                                className="px-4 py-2 border border-rustic-moss/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium dark:text-gray-300"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex gap-1 overflow-x-auto pb-2">
                                                {[...Array(Math.ceil(reviews.length / REVIEWS_PER_PAGE))].map((_, i) => (
                                                    <button
                                                        key={i + 1}
                                                        onClick={() => setReviewPage(i + 1)}
                                                        className={`w-10 h-10 min-w-[2.5rem] rounded-lg text-sm font-bold transition-all ${reviewPage === i + 1
                                                            ? 'bg-rustic-green text-white shadow-md'
                                                            : 'bg-white dark:bg-rustic-slate text-gray-600 dark:text-gray-400 border border-rustic-moss/10 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                disabled={reviewPage === Math.ceil(reviews.length / REVIEWS_PER_PAGE)}
                                                onClick={() => setReviewPage(prev => prev + 1)}
                                                className="px-4 py-2 border border-rustic-moss/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium dark:text-gray-300"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-rustic-slate/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <SubscriptionModal
                    isOpen={showSubscribeModal}
                    onClose={() => setShowSubscribeModal(false)}
                    subscription={subscription}
                    selectedFrequency={selectedFrequency}
                    boxSize={boxSize}
                    deliveryDay={deliveryDay}
                    deliveryDate={deliveryDate}
                    onConfirm={handleConfirmSubscription}
                />

                <CancelSubscriptionModal
                    isOpen={showCancelModal}
                    onClose={() => setShowCancelModal(false)}
                    subscription={subscription}
                    userSubscription={userSubscription}
                    onConfirm={handleConfirmCancellation}
                    loading={subscribing}
                />
            </div>
        </div>
    );
};

export default SubscriptionDetails;
