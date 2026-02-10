import { Link } from "react-router-dom";
import { FiShoppingBag, FiCalendar, FiTool } from "react-icons/fi";

function CategoryGrid() {
  const categories = [
    { name: "Products", link: "/products", icon: <FiShoppingBag className="w-8 h-8" />, desc: "Fresh from the farm" },
    { name: "Events", link: "/events", icon: <FiCalendar className="w-8 h-8" />, desc: "Join the community" },
    { name: "Workshops", link: "/workshops", icon: <FiTool className="w-8 h-8" />, desc: "Learn new skills" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={cat.link}
            className="group relative overflow-hidden bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {cat.icon}
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-rustic-beige dark:bg-rustic-green/20 rounded-full text-rustic-green dark:text-rustic-beige group-hover:bg-rustic-green group-hover:text-white transition-colors duration-300">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cat.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;
