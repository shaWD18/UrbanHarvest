import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="relative bg-rustic-green dark:bg-rustic-deep text-rustic-beige rounded-3xl overflow-hidden shadow-xl mx-4 md:mx-0">
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center mix-blend-overlay"></div>
      <div className="relative z-10 p-10 md:p-16 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
          Welcome to <br /> <span className="text-rustic-cream">Urban Harvest Hub</span>
        </h2>

        <p className="text-xl font-sans leading-relaxed mb-8 max-w-2xl text-rustic-beige/90">
          Explore eco-friendly products, join community workshops, and discover
          sustainable events happening around you. Build a greener future with us!
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/products" className="px-8 py-3 bg-rustic-clay text-white rounded-lg font-bold hover:bg-rustic-earth transition-colors shadow-lg">
            Shop Now
          </Link>
          <Link to="/events" className="px-8 py-3 border-2 border-rustic-beige text-rustic-beige rounded-lg font-bold hover:bg-rustic-beige hover:text-rustic-green transition-colors">
            Find Events
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
