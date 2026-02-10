import { useAppContext } from "../context/AppContext";
import { useState, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import { FiFilter, FiX } from "react-icons/fi";

function Products() {
  const { products } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const priceRanges = [
    { label: "All Prices", value: "All" },
    { label: "Under LKR 500", value: "under-500" },
    { label: "LKR 500 - LKR 1000", value: "500-1000" },
    { label: "Above LKR 1000", value: "above-1000" },
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search Filter
      const matchesSearch =
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category Filter
      const categoryMatch =
        selectedCategory === "All" || product.category === selectedCategory;

      // Price Filter
      let priceMatch = true;
      if (selectedPriceRange === "under-500") {
        priceMatch = product.price < 500;
      } else if (selectedPriceRange === "500-1000") {
        priceMatch = product.price >= 500 && product.price <= 1000;
      } else if (selectedPriceRange === "above-1000") {
        priceMatch = product.price > 1000;
      }

      return matchesSearch && categoryMatch && priceMatch;
    });
  }, [products, selectedCategory, selectedPriceRange, searchTerm]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedPriceRange("All");
    setSearchTerm("");
  };

  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      {/* Hero Section - Immersive & Premium */}
      <section className="relative min-h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden rounded-b-[3rem] shadow-2xl mb-12 group">
        <div className="absolute inset-0 bg-gradient-to-br from-rustic-green/40 to-rustic-deep/50 z-10 mix-blend-multiply" />
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-1000"
        />
        {/* Animated Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rustic-clay/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-rustic-green/40 rounded-full blur-3xl animate-pulse animation-delay-500"></div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium tracking-wide animate-slide-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Fresh Arrivals
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold mb-2 tracking-tight drop-shadow-xl animate-slide-up animation-delay-200">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">Fresh</span> <span className="italic font-light text-rustic-beige">Harvest</span>
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto font-light leading-relaxed animate-slide-up animation-delay-400">
            Straight from the farm to your table. Explore our curated selection of organic, seasonal, and sustainable goods.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filter Bar (Mimicking Events.jsx style) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6 border-b border-rustic-moss/10 pb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-rustic-charcoal dark:text-white">Marketplace</h2>
            <p className="text-rustic-moss dark:text-gray-400 mt-1">Found {filteredProducts.length} sustainable items</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white dark:bg-rustic-mud/50 p-2 rounded-2xl shadow-sm border border-rustic-moss/10">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-rustic-charcoal dark:text-rustic-beige font-medium focus:ring-0 py-2 pl-4 pr-10 rounded-xl hover:bg-rustic-green/5 transition-all text-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rustic-moss pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

            {/* Category Select */}
            <div className="flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-transparent border-none text-rustic-charcoal dark:text-rustic-beige font-semibold focus:ring-0 cursor-pointer hover:text-rustic-green transition-colors py-2 pl-4 pr-8 rounded-xl hover:bg-rustic-green/5"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-rustic-mud text-gray-800 dark:text-white">{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

            {/* Price Select */}
            <div className="flex items-center">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full sm:w-auto bg-transparent border-none text-rustic-charcoal dark:text-rustic-beige font-semibold focus:ring-0 cursor-pointer hover:text-rustic-green transition-colors py-2 pl-4 pr-8 rounded-xl hover:bg-rustic-green/5"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value} className="bg-white dark:bg-rustic-mud text-gray-800 dark:text-white">{range.label}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(selectedCategory !== 'All' || selectedPriceRange !== 'All' || searchTerm !== "") && (
              <button
                onClick={resetFilters}
                className="ml-2 px-4 py-2 bg-rustic-terracotta/10 text-rustic-terracotta hover:bg-rustic-terracotta hover:text-white rounded-xl text-sm font-bold transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-rustic-moss/20 rounded-3xl bg-rustic-beige/20 dark:bg-white/5">
            <div className="inline-block p-4 bg-rustic-moss/10 rounded-full mb-4">
              <FiFilter className="w-8 h-8 text-rustic-moss" />
            </div>
            <p className="text-2xl font-serif text-rustic-charcoal dark:text-white mb-2">No products found</p>
            <p className="text-gray-500 mb-6">Try adjusting your category or price filters.</p>
            <button
              onClick={resetFilters}
              className="bg-rustic-green text-white px-8 py-3 rounded-full hover:bg-rustic-deep transition-colors font-bold shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
