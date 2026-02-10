import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FiArrowLeft, FiShoppingCart, FiCheck, FiTruck, FiShield, FiLock, FiStar, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

function ProductDetails({ adminPreview = false }) {
  const { id } = useParams();
  const { products, loadingData } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_title: "", review_text: "" });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAdded, setIsAdded] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;
  const { addToCart } = useCart();

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`https://urbanharvest-production.up.railway.app/api/products/${id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useState(() => {
    fetchReviews();
    setReviewPage(1);
  }, [id]);

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Default title if empty
    const title = reviewForm.review_title.trim() || "Product Review";

    // Word count check
    const wordCount = reviewForm.review_text.trim().split(/\s+/).length;
    if (wordCount > 100) {
      setError("Review text cannot exceed 100 words.");
      setSubmitting(false);
      return;
    }

    try {
      const url = editingReviewId
        ? `https://urbanharvest-production.up.railway.app/api/reviews/${editingReviewId}`
        : `https://urbanharvest-production.up.railway.app/api/products/${id}/reviews`;

      const method = editingReviewId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...reviewForm, review_title: title })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Reset form and reload reviews
      setReviewForm({ rating: 5, review_title: "", review_text: "" });
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setReviewForm({
      rating: review.rating,
      review_title: review.review_title || "",
      review_text: review.review_text || ""
    });
    setEditingReviewId(review.id);
    setActiveTab("reviews");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`https://urbanharvest-production.up.railway.app/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  const handleCancelEdit = () => {
    setReviewForm({ rating: 5, review_title: "", review_text: "" });
    setEditingReviewId(null);
    setError("");
  };

  if (loadingData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
      </div>
    );
  }

  const product = products.find((p) => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-rustic-charcoal dark:text-rustic-beige mb-4">Product not found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The product you are looking for does not exist or has been moved.</p>
        <Link to={adminPreview ? "/admin/products" : "/products"} className="bg-rustic-green text-white px-6 py-3 rounded-lg hover:bg-rustic-moss transition-colors">
          {adminPreview ? "Back to Admin Products" : "Back to Products"}
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    if (val > (product.stock || 10)) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb & Back */}
      <nav className="mb-8 flex items-center text-sm text-gray-500 dark:text-gray-400">
        <Link to="/" className="hover:text-rustic-green transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-rustic-green transition-colors">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-rustic-charcoal dark:text-rustic-beige font-medium truncate">{product.name}</span>
      </nav>

      {adminPreview && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg">
              <FiEye size={20} />
            </div>
            <div>
              <p className="font-bold text-blue-800 dark:text-blue-300">Admin Preview Mode</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">You are viewing this product as a customer would seeing it.</p>
            </div>
          </div>
          <Link
            to={`/admin/products/edit/${product.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <FiEdit2 /> Edit Product
          </Link>
        </div>
      )}

      <Link
        to={adminPreview ? "/admin/products" : "/products"}
        className="inline-flex items-center text-rustic-clay hover:text-rustic-earth mb-8 transition-colors group"
      >
        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
        {adminPreview ? "Back to Product List" : "Back to Products"}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="relative group w-full lg:w-auto lg:mx-6">
          <div className="aspect-square w-full lg:h-[500px] lg:w-[500px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {product.stock < 5 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Low Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-bold text-rustic-green uppercase tracking-wider">{product.category}</div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige mb-4">{product.name}</h1>

          <div className="text-3xl font-bold text-rustic-charcoal dark:text-rustic-beige mb-6">
            LKR {product.price}
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
            {product.short_description || product.description}
          </p>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider mb-4">Key Features</h3>
            <ul className="flex flex-col gap-3">
              {(product.features || ["No specific features listed."]).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <span className="mt-1 bg-rustic-green/10 text-rustic-green p-1 rounded-full">
                    <FiCheck size={14} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6 mb-8">
            {!adminPreview ? (
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={!user}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >-</button>
                  <span className="px-4 py-2 font-medium text-rustic-charcoal dark:text-rustic-beige w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={!user}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >+</button>
                </div>

                {user ? (
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 px-8 py-3 rounded-lg transition-colors duration-300 font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isAdded
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-rustic-green hover:bg-rustic-moss text-white"
                      }`}
                  >
                    <FiShoppingCart /> {isAdded ? "Added to Cart" : "Add to Cart"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="flex-1 bg-rustic-clay text-white px-8 py-3 rounded-lg hover:bg-rustic-earth transition-colors duration-300 font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FiLock /> Login to Purchase
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-gray-500 dark:text-gray-400 italic">
                Cart actions are disabled in preview mode.
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1"><FiCheck className="text-green-500" /> In Stock</div>
              <div className="flex items-center gap-1"><FiTruck className="text-blue-500" /> Fast Delivery</div>
              <div className="flex items-center gap-1"><FiShield className="text-purple-500" /> Quality Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info Tabs */}
      <div className="bg-white dark:bg-rustic-deep/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-medium text-sm uppercase tracking-wide transition-colors whitespace-nowrap ${tab === 'reviews' ? 'hidden lg:block' : ''} ${activeTab === tab
                ? 'border-b-2 border-rustic-green text-rustic-green bg-rustic-green/5'
                : 'text-gray-500 dark:text-gray-400 hover:text-rustic-charcoal dark:hover:text-rustic-beige hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-serif font-bold mb-4 text-rustic-charcoal dark:text-rustic-beige">Product Description</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description || "No detailed description available."}
              </p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-xl font-serif font-bold mb-6 text-rustic-charcoal dark:text-rustic-beige">Specifications</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                    {Object.entries(product.specifications || {}).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}>
                        <td className="px-3 md:px-6 py-4 text-sm font-medium text-gray-900 dark:text-rustic-beige w-1/3 align-top">{key}</td>
                        <td className="px-3 md:px-6 py-4 text-sm text-gray-600 dark:text-gray-300 align-top">{value}</td>
                      </tr>
                    ))}
                    {Object.keys(product.specifications || {}).length === 0 && (
                      <tr><td colSpan="2" className="px-6 py-4 text-center text-gray-500">No specifications available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="hidden lg:block">
              <ReviewSection
                reviews={reviews}
                loadingReviews={loadingReviews}
                reviewPage={reviewPage}
                setReviewPage={setReviewPage}
                REVIEWS_PER_PAGE={REVIEWS_PER_PAGE}
                user={user}
                handleEditReview={handleEditReview}
                handleDeleteReview={handleDeleteReview}
                adminPreview={adminPreview}
                error={error}
                handleSubmitReview={handleSubmitReview}
                handleRatingChange={handleRatingChange}
                reviewForm={reviewForm}
                handleReviewChange={handleReviewChange}
                editingReviewId={editingReviewId}
                submitting={submitting}
                handleCancelEdit={handleCancelEdit}
                navigate={navigate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Standalone Review Section */}
      <div className="lg:hidden mt-8">
        <div className="bg-white dark:bg-rustic-deep/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <ReviewSection
            reviews={reviews}
            loadingReviews={loadingReviews}
            reviewPage={reviewPage}
            setReviewPage={setReviewPage}
            REVIEWS_PER_PAGE={REVIEWS_PER_PAGE}
            user={user}
            handleEditReview={handleEditReview}
            handleDeleteReview={handleDeleteReview}
            adminPreview={adminPreview}
            error={error}
            handleSubmitReview={handleSubmitReview}
            handleRatingChange={handleRatingChange}
            reviewForm={reviewForm}
            handleReviewChange={handleReviewChange}
            editingReviewId={editingReviewId}
            submitting={submitting}
            handleCancelEdit={handleCancelEdit}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}

// Reusable Review Section Component
function ReviewSection({
  reviews,
  loadingReviews,
  reviewPage,
  setReviewPage,
  REVIEWS_PER_PAGE,
  user,
  handleEditReview,
  handleDeleteReview,
  adminPreview,
  error,
  handleSubmitReview,
  handleRatingChange,
  reviewForm,
  handleReviewChange,
  editingReviewId,
  submitting,
  handleCancelEdit,
  navigate
}) {
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );

  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-xl font-serif font-bold mb-6 text-rustic-charcoal dark:text-rustic-beige">Customer Reviews</h3>

        {loadingReviews ? (
          <div className="text-center py-8 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-6">
              {paginatedReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-rustic-charcoal dark:text-rustic-beige">{review.user_name}</div>
                      <div className="text-xs text-gray-400">• {new Date(review.updated_at || review.created_at).toLocaleDateString()}
                        {review.updated_at && new Date(review.updated_at).getTime() !== new Date(review.created_at).getTime() && (
                          <span className="ml-1 italic text-rustic-moss dark:text-rustic-beige">(Edited)</span>
                        )}
                      </div>
                    </div>
                    {user && user.id === review.user_id && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEditReview(review)} className="text-blue-500 hover:text-blue-700 p-1 transition-colors"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDeleteReview(review.id)} className="text-red-500 hover:text-red-700 p-1 transition-colors"><FiTrash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        size={16}
                      />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm mb-1 text-gray-800 dark:text-gray-200">{review.review_title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.review_text}</p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={reviewPage === 1}
                  onClick={() => setReviewPage(prev => prev - 1)}
                  className="px-4 py-2 border border-rustic-moss/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Previous
                </button>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setReviewPage(i + 1)}
                      className={`w-10 h-10 min-w-[2.5rem] rounded-lg text-sm font-bold transition-all ${reviewPage === i + 1
                        ? 'bg-rustic-green text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={reviewPage === totalPages}
                  onClick={() => setReviewPage(prev => prev + 1)}
                  className="px-4 py-2 border border-rustic-moss/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {adminPreview ? (
        <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 italic">
          Review submission is disabled in preview mode.
        </div>
      ) : user ? (
        <div className="bg-gray-50 dark:bg-gray-800/30 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-4 text-rustic-charcoal dark:text-rustic-beige">
            {editingReviewId ? "Edit Your Review" : "Write a Review"}
          </h3>

          {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <FiStar
                      className={`${star <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                      size={24}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title (Optional)</label>
              <input
                type="text"
                name="review_title"
                value={reviewForm.review_title}
                onChange={handleReviewChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-rustic-green focus:border-transparent outline-none transition-all"
                placeholder="Summary of your experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review <span className="text-xs font-normal text-gray-500">(Max 100 words)</span>
              </label>
              <textarea
                name="review_text"
                value={reviewForm.review_text}
                onChange={handleReviewChange}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-rustic-green focus:border-transparent outline-none transition-all"
                placeholder="Tell us what you think about this product..."
              ></textarea>
              <div className={`text-xs text-right mt-1 ${(reviewForm.review_text.trim().split(/\s+/).length > 100 && reviewForm.review_text.trim() !== '') ? "text-red-500 font-bold" : "text-gray-400"
                }`}>
                {reviewForm.review_text.trim() === '' ? 0 : reviewForm.review_text.trim().split(/\s+/).length} / 100 words
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-rustic-green text-white rounded-lg hover:bg-rustic-moss transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : (editingReviewId ? "Update Review" : "Submit Review")}
              </button>
              {editingReviewId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800/30 p-8 rounded-xl text-center border border-gray-100 dark:border-gray-800">
          <h4 className="text-lg font-bold text-rustic-charcoal dark:text-rustic-beige mb-2">Have you used this product?</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Log in to share your experience with others.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 border-2 border-rustic-green text-rustic-green rounded-lg hover:bg-rustic-green hover:text-white transition-colors font-bold"
          >
            Login to Leave a Review
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
