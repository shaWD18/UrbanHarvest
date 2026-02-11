
import { useState, useEffect } from "react";
import SubscriptionCard from "../components/SubscriptionCard";
import { API_BASE_URL } from "../config";


const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions`);
            if (!response.ok) {
                throw new Error("Failed to fetch subscriptions");
            }
            const data = await response.json();
            setSubscriptions(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-deep">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-deep">
                <div className="text-center p-8 bg-white dark:bg-rustic-mud rounded-lg shadow-xl">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchSubscriptions}
                        className="px-4 py-2 bg-rustic-green text-white rounded-lg hover:bg-rustic-moss"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }



    // Get unique categories
    const categories = ["All", ...new Set(subscriptions.map(sub => sub.type))];

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesCategory = selectedCategory === "All" || sub.type === selectedCategory;
        const matchesSearch =
            sub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.description?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-12 pb-12 animate-fade-in">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden rounded-b-[3rem] shadow-2xl mb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-rustic-green/40 via-rustic-deep/30 to-rustic-charcoal/40 z-10" />
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/static/subscriptions-hero.jpg"
                        alt="Join existing subscriptions"
                        className="w-full h-full object-cover animate-zoom-slow"
                    />
                    <div className="absolute inset-0 bg-rustic-charcoal/30 mix-blend-multiply"></div>
                </div>

                {/* Floating shapes */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-rustic-clay/30 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-rustic-green/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-6">
                    <span className="inline-block py-1 px-3 border border-rustic-beige/30 rounded-full text-rustic-beige text-sm font-medium tracking-widest uppercase mb-2 backdrop-blur-sm">
                        Fresh • Consistent • Sustainable
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-xl leading-tight">
                        Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-rustic-clay to-yellow-400">Community</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-rustic-beige/90 max-w-3xl mx-auto leading-relaxed font-light">
                        Choose from our curated subscription boxes and services to support local sustainability and eat fresh, organic produce.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search subscriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-rustic-mud/50 border border-rustic-moss/20 text-rustic-charcoal dark:text-rustic-beige font-medium focus:ring-2 focus:ring-rustic-green/50 py-4 pl-12 pr-4 rounded-2xl shadow-sm group-hover:shadow-md transition-all outline-none"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rustic-moss">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-rustic-moss hover:text-rustic-terracotta transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${selectedCategory === category
                                ? "bg-rustic-green text-white shadow-lg scale-105"
                                : "bg-white dark:bg-rustic-mud text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-rustic-slate hover:text-rustic-green border border-gray-200 dark:border-rustic-moss/20"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {filteredSubscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSubscriptions.map((sub) => (
                            <SubscriptionCard key={sub.id} subscription={sub} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">No subscriptions found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setSelectedCategory("All");
                                setSearchTerm("");
                            }}
                            className="mt-4 text-rustic-green font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscriptions;
