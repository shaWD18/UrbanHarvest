import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiInstagram } from "react-icons/fi";
import { FaLeaf } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rustic-green dark:bg-rustic-deep text-rustic-beige transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FaLeaf className="h-6 w-6 text-rustic-green" />
              <h3 className="font-serif text-2xl font-bold text-rustic-clay">Urban Harvest</h3>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Connecting communities with nature through sustainable products, engaging events, and educational workshops.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-rustic-clay">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-rustic-clay transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-rustic-clay transition-colors">About</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-rustic-clay transition-colors">Products</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-rustic-clay transition-colors">Events</Link>
              </li>
              <li>
                <Link to="/workshops" className="hover:text-rustic-clay transition-colors">Workshops</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-rustic-clay">Contact Us</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>hello@urbanharvest.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Green Street, Eco City</li>
            </ul>
          </div>

          {/* Social Media Column */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-rustic-clay">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-rustic-moss/20 rounded-full hover:bg-rustic-moss/40 transition-colors group">
                <FiFacebook className="w-5 h-5 group-hover:text-rustic-clay transition-colors" />
              </a>
              <a href="#" className="p-2 bg-rustic-moss/20 rounded-full hover:bg-rustic-moss/40 transition-colors group">
                <FiTwitter className="w-5 h-5 group-hover:text-rustic-clay transition-colors" />
              </a>
              <a href="#" className="p-2 bg-rustic-moss/20 rounded-full hover:bg-rustic-moss/40 transition-colors group">
                <FiInstagram className="w-5 h-5 group-hover:text-rustic-clay transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 text-center text-sm opacity-60">
          <p>&copy; {currentYear} Urban Harvest Hub — All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
