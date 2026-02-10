import { useAppContext } from "../context/AppContext";
import { useState, useMemo } from "react";
import EventCard from "../components/EventCard";

function Events() {
  const { events } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(events.filter((e) => e.category).map((e) => e.category));
    return ["All", ...Array.from(cats)];
  }, [events]);



  // Extract unique months - Now hardcoded to all 12 months as per user request
  const months = useMemo(() => {
    return [
      "All",
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search Filter
      const matchesSearch =
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category Filter
      const categoryMatch =
        selectedCategory === "All" || event.category === selectedCategory;

      // Month Filter
      let monthMatch = true;
      if (selectedMonth !== "All") {
        const eventDate = new Date(event.date);
        const eventMonthStr = eventDate.toLocaleString("default", {
          month: "long",
        });
        monthMatch = eventMonthStr === selectedMonth;
      }

      return matchesSearch && categoryMatch && monthMatch;
    });
  }, [events, selectedMonth, selectedCategory, searchTerm]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedMonth("All");
    setSearchTerm("");
  };

  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      {/* Hero Section - Immersive & Exciting */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden rounded-b-[3rem] shadow-2xl mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-rustic-green/40 via-rustic-deep/30 to-rustic-charcoal/40 z-10" />
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/static/Event - Hero image.jpg"
            alt="Community Events"
            className="w-full h-full object-cover animate-zoom-slow"
          />
          <div className="absolute inset-0 bg-rustic-charcoal/30 mix-blend-multiply"></div>
        </div>

        {/* Floating shapes for personality */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-rustic-clay/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-rustic-green/40 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-6">
          <span className="inline-block py-1 px-3 border border-rustic-beige/30 rounded-full text-rustic-beige text-sm font-medium tracking-widest uppercase mb-2 backdrop-blur-sm">
            Connect • Grow • Sustain
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-xl leading-tight">
            Community & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rustic-clay to-yellow-400">Connection</span>
          </h1>
          <p className="text-lg md:text-2xl text-rustic-beige/90 max-w-3xl mx-auto leading-relaxed font-light">
            Join the movement. From workshops to meetups, discover events that bring our eco-conscious community together.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">

        {/* Header & Fitlers Row */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6 border-b border-rustic-moss/10 pb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige mb-2">
              Events
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Find your next sustainable adventure below.</p>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-rustic-mud/50 p-2 rounded-2xl shadow-sm border border-rustic-moss/10">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <input
                type="text"
                placeholder="Search events..."
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

            <div className="flex items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-rustic-charcoal dark:text-rustic-beige font-semibold focus:ring-0 cursor-pointer hover:text-rustic-green transition-colors py-2 pl-4 pr-8 rounded-xl hover:bg-rustic-green/5"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-rustic-mud text-gray-800 dark:text-white">{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>



            <div className="flex items-center">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-rustic-charcoal dark:text-rustic-beige font-semibold focus:ring-0 cursor-pointer hover:text-rustic-green transition-colors py-2 pl-4 pr-8 rounded-xl hover:bg-rustic-green/5"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-white dark:bg-rustic-mud text-gray-800 dark:text-white">{m === 'All' ? 'All Months' : m}</option>
                ))}
              </select>
            </div>

            {(selectedCategory !== "All" || selectedMonth !== "All" || searchTerm !== "") && (
              <button
                onClick={resetFilters}
                className="ml-2 px-4 py-2 bg-rustic-terracotta/10 text-rustic-terracotta hover:bg-rustic-terracotta hover:text-white rounded-xl text-sm font-bold transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredEvents.map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-rustic-beige/20 dark:bg-white/5 rounded-3xl border-2 border-dashed border-rustic-moss/20">
            <h3 className="text-2xl font-serif font-bold text-rustic-charcoal dark:text-white mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters to find what you're looking for.</p>
            <button
              onClick={resetFilters}
              className="bg-rustic-green text-white px-8 py-3 rounded-xl font-bold hover:bg-rustic-moss transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;