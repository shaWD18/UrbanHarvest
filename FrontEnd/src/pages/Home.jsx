import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import CategoryGrid from "../components/CategoryGrid";
import ProductCard from "../components/ProductCard";
import EventCard from "../components/EventCard";
import { FiWind, FiSun, FiUsers, FiHeart, FiGlobe } from "react-icons/fi";

function Home() {
  const { weather, products, events, loadingData } = useAppContext();

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rustic-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading Urban Harvest Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20 animate-fade-in">

      {/* PROFESSIONAL IMMERSIVE HERO */}
      <section className="relative min-h-[85vh] py-20 flex items-center justify-center overflow-hidden rounded-b-[4rem] shadow-2xl">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/static/homepage-heropage.jpg"
            alt="Green Living"
            className="w-full h-full object-cover animate-zoom-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rustic-deep/40 via-rustic-green/30 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
              Building a Sustainable Future Together
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight drop-shadow-2xl">
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Green</span>.<br />Thrive <span className="italic font-light">Locally</span>.
            </h1>

            <p className="text-lg md:text-xl text-gray-200 max-w-lg leading-relaxed font-light">
              Your central hub for eco-friendly products, community workshops, and sustainable events. Join the movement today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/products" className="px-8 py-4 bg-rustic-clay text-white rounded-full font-bold hover:bg-rustic-earth transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-center">
                Explore Marketplace
              </Link>
              <Link to="/events" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-bold hover:bg-white hover:text-rustic-green transition-all text-center">
                Discover Events
              </Link>
            </div>
          </div>

          {/* Weather Widget (Floating) */}
          <div className="w-full md:w-auto justify-self-center md:justify-self-end animate-fade-in animation-delay-500">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-white shadow-2xl max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Local Forecast</h3>
                  <p className="text-white/70 text-sm">Right now in your garden</p>
                </div>
                {weather && <div className="text-4xl font-light">{weather.temperature}°</div>}
              </div>

              {weather ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl">
                    <FiSun className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60">Conditions</p>
                      <p className="font-medium">Sunny & Clear</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl">
                    <FiWind className="w-8 h-8 text-blue-300" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/60">Wind Speed</p>
                      <p className="font-medium">{weather.windspeed} km/h</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/20 rounded"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION / ABOUT SECTION */}
      <section className="container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FiGlobe, title: "Eco-Friendly", desc: "Curated sustainable products that reduce your footprint." },
            { icon: FiUsers, title: "Community Driven", desc: "Connect with local growers and makers in your area." },
            { icon: FiHeart, title: "Healthier Living", desc: "Workshops and tips for a balanced, organic lifestyle." }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-rustic-mud p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 text-center group border border-gray-100 dark:border-white/5">
              <div className="w-16 h-16 mx-auto bg-rustic-green/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rustic-green group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-rustic-green dark:text-rustic-beige group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-rustic-charcoal dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-rustic-clay font-bold tracking-widest uppercase text-sm">Browse By Category</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-rustic-charcoal dark:text-white mt-3">Find What You Need</h2>
        </div>
        <CategoryGrid />
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-rustic-beige/30 dark:bg-white/5 py-20 rounded-[3rem]">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h3 className="text-3xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige">Fresh Arrivals</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Handpicked sustainable goods just for you.</p>
            </div>
            <Link to="/products" className="hidden md:inline-flex px-6 py-2 border border-rustic-clay text-rustic-clay rounded-full hover:bg-rustic-clay hover:text-white transition-colors font-medium">
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.slice(0, 3).map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/products" className="text-rustic-clay font-bold">View All Products →</Link>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="container mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h3 className="text-3xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige">Events</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join the community and learn something new.</p>
          </div>
          <Link to="/events" className="hidden md:inline-flex px-6 py-2 border border-rustic-green text-rustic-green dark:border-rustic-beige dark:text-rustic-beige rounded-full hover:bg-rustic-green hover:text-white dark:hover:bg-rustic-beige dark:hover:text-rustic-deep transition-colors font-medium">
            Explore Events
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.slice(0, 3).map((item) => (
            <EventCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/events" className="text-rustic-green font-bold">View All Events →</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;