import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import BookingForm from "../components/BookingForm";
import { FiArrowLeft, FiCalendar, FiMapPin, FiCheck, FiStar, FiCheckCircle, FiUser, FiClock, FiList, FiAward, FiLock, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { API_BASE_URL } from "../config";


function WorkshopDetails({ adminPreview = false }) {
  const { id } = useParams();
  const { workshops, loadingData } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const workshop = workshops.find((w) => w.id === parseInt(id));
  const bookingRef = useRef(null);

  console.log("Workshop Data:", workshop);

  // Tab State
  const [activeTab, setActiveTab] = useState("overview");

  // Auto-refresh if data seems stale (missing slots)
  const { refreshData } = useAppContext();
  useEffect(() => {
    if (workshop && workshop.slots === undefined && !loadingData) {
      console.log("Stale data detected (missing slots), refreshing...");
      refreshData();
    }
  }, [workshop, loadingData, refreshData]);

  // Review State
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [fetchingReviews, setFetchingReviews] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/workshops/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setFetchingReviews(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/user/workshops`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const workshops = await res.json();
        setIsEnrolled(workshops.some(w => w.workshop_id === parseInt(id)));
      }
    } catch (err) {
      console.error("Failed to check enrollment", err);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkEnrollment();
  }, [id, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSubmitting(true);
    try {
      const url = editingReviewId
        ? `${API_BASE_URL}/workshops/${id}/reviews/${editingReviewId}`
        : `${API_BASE_URL}/workshops/${id}/reviews`;
      const method = editingReviewId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ rating: reviewRating, review_title: reviewTitle, review_text: reviewText })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewText("");
      setReviewTitle("");
      setReviewRating(5);
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewTitle(review.review_title || "");
    setReviewText(review.review_text);
    // Scroll to review form section if needed or just let tab handle it
    setActiveTab("reviews");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/workshops/${id}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold text-rustic-charcoal dark:text-rustic-beige mb-6">Workshop not found</h1>
        <Link to={adminPreview ? "/admin/workshops" : "/workshops"} className="text-xl text-rustic-clay hover:text-rustic-earth underline font-medium">
          {adminPreview ? "Back to Admin Workshops" : "Return to Workshops"}
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiList },
    { id: 'agenda', label: 'Agenda', icon: FiClock },
    { id: 'instructor', label: 'Instructor', icon: FiUser },
    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: FiStar },
  ];

  return (
    <div className="min-h-screen animate-fade-in flex flex-col font-sans text-rustic-charcoal dark:text-rustic-beige bg-rustic-beige/30 dark:bg-rustic-mud/20 pb-20">

      {/* Admin Preview Header */}
      {adminPreview && (
        <div className="container mx-auto px-4 mt-6 mb-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-between shadow-sm relative z-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg">
                <FiEye size={20} />
              </div>
              <div>
                <p className="font-bold text-blue-800 dark:text-blue-300">Admin Preview Mode</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Viewing as a customer.</p>
              </div>
            </div>
            <Link
              to={`/admin/workshops/edit/${workshop.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <FiEdit2 /> Edit Workshop
            </Link>
          </div>
        </div>
      )}


      {/* Hero Image - Card Style - ENHANCED */}
      <div className="container mx-auto px-4 mt-6">
        {/* Mobile Back Button */}
        <Link
          to={adminPreview ? "/admin/workshops" : "/workshops"}
          className="md:hidden flex items-center gap-2 text-rustic-clay hover:text-rustic-earth font-bold mb-4 transition-colors"
        >
          <FiArrowLeft />
          <span>All Workshops</span>
        </Link>

        <div className="relative h-[55vh] md:h-[65vh] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 dark:border-rustic-charcoal/50 group">
          {/* Floating Back Button */}
          <Link
            to={adminPreview ? "/admin/workshops" : "/workshops"}
            className="absolute top-6 left-6 z-30 hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all duration-300 shadow-xl group/back"
          >
            <FiArrowLeft className="group-hover/back:-translate-x-1 transition-transform" />
            <span className="text-sm">All Workshops</span>
          </Link>

          <img
            src={workshop.image || "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e10?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
            alt={workshop.title}
            className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110"
          />
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-rustic-mud/90 via-rustic-mud/40 to-black/10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 sm:p-10 md:p-14 text-white w-full max-w-5xl">
            <div className="flex flex-wrap items-center gap-3 mb-4 animate-slide-up">
              <span className="px-4 py-1.5 rounded-full bg-rustic-green text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-md">
                {workshop.category}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-md ${workshop.slots > 0 ? "bg-rustic-clay" : "bg-red-500"}`}>
                {workshop.slots > 0 ? `${workshop.slots} Spots Left` : "Sold Out"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-5xl md:text-7xl font-serif font-bold mb-6 drop-shadow-xl leading-tight text-white animate-slide-up animation-delay-100">
              {workshop.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base font-medium text-white/90 animate-slide-up animation-delay-200">
              <span className="flex items-center bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                <FiCalendar className="mr-2 text-rustic-cream" /> {workshop.date}
              </span>
              {workshop.duration && (
                <span className="flex items-center bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                  <FiClock className="mr-2 text-rustic-cream" /> {workshop.duration}
                </span>
              )}
              <span className="flex items-center bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                <FiMapPin className="mr-2 text-rustic-cream" /> {workshop.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-8">

        {/* Left Column: Tabs & Content */}
        <div className="lg:col-span-2 space-y-8">


          {/* Tabs Container - Visual Upgrade */}
          <div className="bg-white dark:bg-rustic-mud/80 backdrop-blur-md border border-rustic-moss/20 rounded-2xl p-2 shadow-lg flex overflow-x-auto sticky top-20 z-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform ${(tab.id === 'instructor' || tab.id === 'reviews') ? 'hidden lg:flex' : 'flex'} ${activeTab === tab.id
                  ? 'bg-rustic-green text-white shadow-lg scale-100 ring-2 ring-rustic-green/20'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-rustic-green'
                  }`}
              >
                <tab.icon className={`mr-2 text-lg ${activeTab === tab.id ? 'text-rustic-cream' : 'text-gray-400 group-hover:text-rustic-green'}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Content Card - More Personality */}
          <div className="bg-white dark:bg-rustic-mud border border-rustic-moss/10 rounded-[2.5rem] p-6 sm:p-10 shadow-xl min-h-[400px] transition-all relative overflow-hidden">

            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rustic-beige/50 dark:bg-rustic-green/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-10 relative z-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6 text-rustic-green dark:text-rustic-beige border-l-4 border-rustic-clay pl-4">About the Workshop</h2>
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-8 font-light tracking-wide">
                    {workshop.description}
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="flex items-center text-lg sm:text-xl font-bold text-rustic-charcoal dark:text-white">
                    <span className="bg-rustic-cream dark:bg-rustic-deep p-2 rounded-lg mr-3 shadow-sm border border-rustic-moss/20">
                      <FiAward className="text-rustic-clay w-6 h-6" />
                    </span>
                    Key Takeaways
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {workshop.learningOutcomes?.map((item, idx) => (
                      <div key={idx} className="flex items-start p-4 rounded-xl bg-rustic-beige/50 dark:bg-white/5 border border-transparent hover:border-rustic-green/30 transition-colors">
                        <div className="mt-1 mr-4 w-6 h-6 rounded-full bg-rustic-green flex items-center justify-center flex-shrink-0 text-white text-xs shadow-md">
                          <FiCheck />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="animate-fade-in relative z-0">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-10 text-center text-rustic-charcoal dark:text-white">Schedule Breakdown</h2>
                <div className="space-y-8 relative border-l-2 border-dashed border-rustic-clay/30 ml-4 pl-10">
                  {workshop.agenda?.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[49px] top-1 w-5 h-5 bg-rustic-clay border-4 border-white dark:border-rustic-mud rounded-full shadow-md group-hover:scale-125 transition-transform" />
                      <div className="bg-rustic-beige/30 dark:bg-white/5 p-5 rounded-2xl border border-transparent hover:border-rustic-clay/30 transition-all hover:bg-white dark:hover:bg-white/10 shadow-sm hover:shadow-md">
                        <span className="inline-block px-3 py-1 rounded-md bg-rustic-clay/10 text-rustic-clay font-bold font-mono text-sm mb-2">{item.time}</span>
                        <span className="block text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">{item.activity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="hidden lg:block animate-fade-in relative z-0">
                <div className="bg-gradient-to-br from-rustic-beige/50 to-white dark:from-white/5 dark:to-transparent p-8 rounded-3xl border border-rustic-moss/10 shadow-inner">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-rustic-clay rounded-full blur-lg opacity-40 translate-y-2"></div>
                      <img
                        src={workshop.instructor?.image || "https://randomuser.me/api/portraits/lego/1.jpg"}
                        alt={workshop.instructor?.name}
                        className="relative w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-xl border-4 border-white dark:border-rustic-mud"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-rustic-green text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-rustic-mud">
                        <FiUser className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                      <span className="inline-block px-3 py-1 bg-rustic-green/10 text-rustic-green rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                        Expert Instructor
                      </span>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-rustic-charcoal dark:text-white">{workshop.instructor?.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 italic text-lg">
                        "{workshop.instructor?.bio}"
                      </p>

                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="hidden lg:block">
                <div className="animate-fade-in space-y-8 relative z-0">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rustic-green dark:text-rustic-beige">Workshop Reviews</h2>
                    <div className="flex items-center gap-1">
                      <FiStar className="text-yellow-400 fill-yellow-400" />
                      <span className="font-bold">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
                      <span className="text-gray-400 text-sm">({reviews.length})</span>
                    </div>
                  </div>

                  {/* Review Form */}
                  {isEnrolled ? (
                    <div className="bg-rustic-beige/20 dark:bg-white/5 p-6 rounded-2xl border border-rustic-moss/10 mb-10">
                      <h3 className="text-lg font-bold mb-4">{editingReviewId ? "Edit Your Review" : "Leave a Review"}</h3>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="flex gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <FiStar
                                size={24}
                                className={star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}
                              />
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Review Title (optional)"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-rustic-mud focus:ring-2 focus:ring-rustic-green outline-none"
                        />
                        <textarea
                          placeholder="Share your experience..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          required
                          rows="4"
                          className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-rustic-mud focus:ring-2 focus:ring-rustic-green outline-none"
                        ></textarea>
                        {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={reviewSubmitting}
                            className="px-6 py-2 bg-rustic-green text-white rounded-xl font-bold hover:bg-rustic-moss transition-all disabled:opacity-50"
                          >
                            {reviewSubmitting ? "Submitting..." : editingReviewId ? "Update Review" : "Post Review"}
                          </button>
                          {editingReviewId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(null);
                                setReviewText("");
                                setReviewTitle("");
                                setReviewRating(5);
                              }}
                              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl text-center border border-dashed border-rustic-moss/20">
                      <p className="text-gray-600 dark:text-gray-400 italic">You must be enrolled in this workshop to leave a review.</p>
                    </div>
                  )}

                  {/* Review List */}
                  <div className="space-y-6">
                    {fetchingReviews ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rustic-green"></div>
                      </div>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="p-6 rounded-2xl bg-white dark:bg-rustic-mud border border-rustic-moss/5 shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-rustic-clay/10 flex items-center justify-center text-rustic-clay font-bold">
                                {review.user_name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 dark:text-white">{review.user_name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.updated_at || review.created_at).toLocaleDateString()}
                                  {review.updated_at && new Date(review.updated_at).getTime() !== new Date(review.created_at).getTime() && (
                                    <span className="ml-2 italic text-rustic-moss dark:text-rustic-beige">(Edited)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className={i < review.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"} size={14} />
                                ))}
                              </div>
                              {user && user.id === review.user_id && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleEditReview(review)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit Review"><FiEdit2 size={14} /></button>
                                  <button onClick={() => handleDeleteReview(review.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete Review"><FiTrash2 size={14} /></button>
                                </div>
                              )}
                            </div>
                          </div>
                          {review.review_title && <h4 className="font-bold text-gray-800 dark:text-white">{review.review_title}</h4>}
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                            {review.review_text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-500">No reviews yet. Be the first to share your experience!</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructor Section for Mobile */}
          <div className="lg:hidden bg-white dark:bg-rustic-mud border border-rustic-moss/10 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col gap-6 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-rustic-clay rounded-full blur-lg opacity-40 translate-y-2"></div>
                <img
                  src={workshop.instructor?.image || "https://randomuser.me/api/portraits/lego/1.jpg"}
                  alt={workshop.instructor?.name}
                  className="relative w-28 h-28 rounded-full object-cover shadow-xl border-4 border-white dark:border-rustic-mud"
                />
                <div className="absolute -bottom-1 -right-1 bg-rustic-green text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-rustic-mud">
                  <FiUser className="w-4 h-4" />
                </div>
              </div>

              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-rustic-green/10 text-rustic-green rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                  Expert Instructor
                </span>
                <h2 className="text-2xl font-serif font-bold mb-3 text-rustic-charcoal dark:text-white">{workshop.instructor?.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic text-base">
                  "{workshop.instructor?.bio}"
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section for Mobile - STANDALONE */}
          <div className="lg:hidden bg-white dark:bg-rustic-mud border border-rustic-moss/10 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold text-rustic-green dark:text-rustic-beige">Reviews</h2>
              <div className="flex items-center gap-1">
                <FiStar className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
                <span className="text-gray-400 text-xs text-nowrap">({reviews.length} total)</span>
              </div>
            </div>

            {/* Mobile Review Form */}
            {isEnrolled ? (
              <div className="bg-rustic-beige/20 dark:bg-white/5 p-5 rounded-2xl border border-rustic-moss/10">
                <h3 className="text-base font-bold mb-4">{editingReviewId ? "Edit Your Review" : "Leave a Review"}</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <FiStar
                          size={24}
                          className={star <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}
                        />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-rustic-mud focus:ring-2 focus:ring-rustic-green outline-none text-sm"
                  />
                  <textarea
                    placeholder="Share experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    rows="3"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-rustic-mud focus:ring-2 focus:ring-rustic-green outline-none text-sm"
                  ></textarea>
                  {reviewError && <p className="text-red-500 text-xs">{reviewError}</p>}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="flex-1 py-2.5 bg-rustic-green text-white rounded-xl font-bold hover:bg-rustic-moss transition-all disabled:opacity-50 text-xs"
                    >
                      {reviewSubmitting ? "Wait..." : editingReviewId ? "Update" : "Post Review"}
                    </button>
                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReviewId(null);
                          setReviewText("");
                          setReviewTitle("");
                          setReviewRating(5);
                        }}
                        className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 transition-all text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-center border border-dashed border-rustic-moss/20">
                <p className="text-gray-500 text-xs italic">Enroll to leave a review.</p>
              </div>
            )}

            {/* Mobile Review List */}
            <div className="space-y-4">
              {fetchingReviews ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rustic-green"></div>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="p-5 rounded-2xl bg-white dark:bg-rustic-slate/30 border border-rustic-moss/5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rustic-clay/10 flex items-center justify-center text-rustic-clay font-bold text-xs">
                          {review.user_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-xs">{review.user_name}</p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(review.updated_at || review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={i < review.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"} size={10} />
                          ))}
                        </div>
                        {user && user.id === review.user_id && (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditReview(review)} className="text-blue-500 p-1"><FiEdit2 size={12} /></button>
                            <button onClick={() => handleDeleteReview(review.id)} className="text-red-500 p-1"><FiTrash2 size={12} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    {review.review_title && <h4 className="font-bold text-gray-800 dark:text-white text-xs">{review.review_title}</h4>}
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs line-clamp-3">
                      {review.review_text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs italic">No reviews yet.</div>
              )}
            </div>
          </div>


        </div>

        {/* Right Column: Booking Card (Sticky) */}
        <div className="relative">
          <div className="sticky top-24 space-y-6" ref={bookingRef}>
            <div className="bg-white dark:bg-rustic-mud border border-rustic-moss/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rustic-green via-rustic-moss to-rustic-clay animate-pulse" />

              <div className="text-center mb-8">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">All Inclusive Price</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-4xl sm:text-5xl font-serif font-bold text-rustic-green dark:text-white drop-shadow-sm">
                    {workshop.price === 0 || workshop.price === "0" || workshop.price === "0.00"
                      ? "Free"
                      : `LKR ${Number(workshop.price).toLocaleString()}`}
                  </p>
                </div>
              </div>

              {adminPreview ? (
                <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-bold py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center cursor-not-allowed">
                  Booking Disabled in Preview
                </div>
              ) : user ? (
                workshop.slots > 0 ? (
                  <BookingForm
                    workshopId={workshop.id}
                    title={workshop.title}
                    type="Workshop"
                    price={workshop.price || 'LKR 5,000'}
                    className="w-full bg-rustic-green hover:bg-rustic-earth text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  />
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Sold Out
                  </button>
                )
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-rustic-clay text-white font-bold py-4 rounded-xl shadow-lg hover:bg-rustic-earth transition-all flex items-center justify-center gap-2"
                >
                  <FiLock /> Login to Book
                </button>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <FiCheckCircle className="text-rustic-green" /> Instant Confirmation
                </p>
                <p className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  <FiCheckCircle className="text-rustic-green" /> 100% Money Back Guarantee
                </p>
              </div>
            </div>

            <div className="bg-rustic-beige/50 dark:bg-white/5 rounded-2xl p-6 text-center border border-rustic-moss/10 backdrop-blur-sm">
              <p className="text-rustic-green font-bold mb-2">Have questions?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contact our support team at <a href="mailto:support@urbanharvest.com" className="text-rustic-clay font-bold hover:underline">support@urbanharvest.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkshopDetails;
