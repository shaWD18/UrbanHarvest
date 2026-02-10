import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin, FiTool } from "react-icons/fi";

function WorkshopCard({ item }) {
  return (
    <div className="group bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Image Section */}
      <div className="h-48 w-full relative overflow-hidden rounded-t-2xl">
        <img
          src={item.image || "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
          alt={item.title}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Description Overlay - Slides up on hover */}
        <div className="absolute inset-0 p-6 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
          <p className="text-white text-center text-sm font-medium leading-relaxed line-clamp-4">
            {item.description}
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative bg-white dark:bg-rustic-mud transition-colors duration-300">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-3">
            <FiTool className="text-rustic-clay w-5 h-5 flex-shrink-0 group-hover:text-rustic-green transition-colors" />
            <h3 className="text-xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige group-hover:text-rustic-clay transition-colors duration-300 line-clamp-2">{item.title}</h3>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <FiCalendar className="mr-2 text-rustic-green" />
            <p className="text-sm font-medium">{item.date}</p>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
            <FiMapPin className="mr-2 text-rustic-green" />
            <p className="text-sm">{item.location}</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-rustic-clay font-bold text-lg">
              {item.price === 0 || item.price === "0" || item.price === "0.00"
                ? "Free"
                : `LKR ${Number(item.price).toLocaleString()}`}
            </span>
          </div>
        </div>

        <Link
          to={`/workshops/${item.id}`}
          className="mt-auto w-full text-center px-4 py-3 bg-rustic-clay text-white rounded-xl hover:bg-rustic-earth transition-all duration-300 font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5"
        >
          View Workshop
        </Link>
      </div>
    </div>
  );
}

export default WorkshopCard;
