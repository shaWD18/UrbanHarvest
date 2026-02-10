import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin } from "react-icons/fi";

function EventCard({ item }) {
  return (
    <div className="bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 group">
      {/* Image Section */}
      <div className="h-48 w-full relative overflow-hidden rounded-t-2xl">
        <img
          src={item.image}
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

        <div className="absolute top-3 right-3 bg-white/90 dark:bg-rustic-mud/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-rustic-green shadow-sm uppercase tracking-wider z-10">
          {item.category}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative bg-white dark:bg-rustic-mud transition-colors duration-300">
        <h3 className="text-xl font-serif font-bold text-rustic-charcoal dark:text-rustic-beige group-hover:text-rustic-clay transition-colors duration-300 mb-3 line-clamp-2">{item.title}</h3>

        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
          <FiCalendar className="mr-2 text-rustic-clay w-4 h-4" />
          <p className="text-sm font-medium">
            {new Date(item.date).toLocaleString("default", { month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
          <FiMapPin className="mr-2 text-rustic-green w-4 h-4" />
          <p className="text-sm">{item.location}</p>
        </div>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-rustic-clay font-bold text-lg">
            {item.price === 0 || item.price === "0" || item.price === "0.00"
              ? "Free"
              : `LKR ${Number(item.price).toLocaleString()}`}
          </span>
        </div>
        <Link
          to={`/events/${item.id}`}
          className="block w-full text-center px-4 py-3 border-2 border-rustic-green text-rustic-green hover:bg-rustic-green hover:text-white rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
