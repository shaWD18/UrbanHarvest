import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiSettings, FiShoppingCart } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();

  // Initialize dark mode from local storage
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark" ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  // Different navigation links for admin vs customer
  const customerLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "Subscriptions", path: "/subscriptions" },
    { name: "Events", path: "/events" },
    { name: "Workshops", path: "/workshops" },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Events", path: "/admin/events" },
    { name: "Workshops", path: "/admin/workshops" },
    { name: "Subscriptions", path: "/admin/subscriptions" },
  ];

  const links = isAdmin() ? adminLinks : customerLinks;

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
      ? 'glass shadow-medium'
      : 'bg-white/95 dark:bg-rustic-charcoal/95 backdrop-blur-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo - Simple, no changes */}
          <Link to={isAdmin() ? "/admin" : "/"} className="flex items-center gap-3 group">
            <FaLeaf className="h-8 w-8 text-rustic-green dark:text-green-400 transition-transform group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold tracking-wide text-gray-900 dark:text-white">
                Urban Harvest
              </span>
              {isAdmin() && (
                <span className="text-xs font-semibold text-rustic-clay uppercase tracking-wider">Admin Panel</span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === link.path
                  ? "bg-rustic-green/10 text-rustic-green dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-rustic-slate hover:text-rustic-green dark:hover:text-green-400"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200 dark:border-rustic-ash">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-rustic-slate hover:bg-gray-200 dark:hover:bg-rustic-stone transition-all hover:scale-110 focus:outline-none"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 text-amber-500" />
                ) : (
                  <FiMoon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Cart Icon */}
              {!isAdmin() && (
                <Link to="/checkout" className="relative p-2 rounded-xl bg-gray-100 dark:bg-rustic-slate hover:bg-gray-200 dark:hover:bg-rustic-stone transition-all hover:scale-110 focus:outline-none">
                  <FiShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rustic-coral text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Auth Buttons */}
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-rustic-slate rounded-xl hover:bg-gray-200 dark:hover:bg-rustic-stone transition-all"
                  >
                    {isAdmin() ? (
                      <FiSettings className="w-4 h-4 text-rustic-clay" />
                    ) : (
                      <FiUser className="w-4 h-4 text-rustic-green dark:text-green-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-rustic-coral/10 text-rustic-coral hover:bg-rustic-coral/20 rounded-xl transition-all text-sm font-semibold"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-rustic-slate transition-colors focus:outline-none"
            >
              {darkMode ? (
                <FiSun className="w-5 h-5 text-amber-500" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Mobile Cart */}
            {!isAdmin() && (
              <Link to="/checkout" className="relative p-2 rounded-lg bg-gray-100 dark:bg-rustic-slate text-gray-900 dark:text-white focus:outline-none">
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rustic-coral text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-rustic-slate text-gray-900 dark:text-white focus:outline-none"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-gray-200 dark:border-rustic-ash animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${location.pathname === link.path
                  ? "bg-rustic-green/10 text-rustic-green dark:text-green-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-rustic-slate"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-gray-200 dark:border-rustic-ash my-4 pt-4">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-rustic-slate hover:bg-gray-200 dark:hover:bg-rustic-stone rounded-xl mb-2 flex items-center gap-2 transition-all group"
                  >
                    {isAdmin() ? (
                      <>
                        <FiSettings className="text-rustic-clay group-hover:rotate-45 transition-transform" />
                        <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                        <span className="ml-auto text-xs bg-rustic-clay/20 text-rustic-clay px-2 py-1 rounded-lg font-bold">Admin</span>
                      </>
                    ) : (
                      <>
                        <FiUser className="text-rustic-green dark:text-green-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                      </>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-rustic-coral/10 text-rustic-coral hover:bg-rustic-coral/20 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center btn-primary"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
