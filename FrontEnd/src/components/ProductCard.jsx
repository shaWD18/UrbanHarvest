import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { useState } from "react";

function ProductCard({ item }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/products/${item.id}`)}
            className="group bg-white dark:bg-rustic-mud rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-rustic-moss/10 hover:border-rustic-green/30 transform hover:-translate-y-2 cursor-pointer"
        >
            {/* Product Image */}
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                {item.stock < 5 && (
                    <div className="absolute top-3 right-3 bg-rustic-coral text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        Low Stock
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Product Info */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                    <span className="text-xs font-bold text-rustic-green uppercase tracking-wider">
                        {item.category}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-rustic-charcoal dark:text-rustic-beige group-hover:text-rustic-green dark:group-hover:text-rustic-clay transition-colors line-clamp-2 mb-2">
                    {item.name}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {item.short_description || item.shortDescription || item.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-lg sm:text-2xl font-bold text-rustic-charcoal dark:text-white">
                        LKR {item.price}
                    </span>
                    <span className="px-4 py-2 bg-rustic-green/10 text-rustic-green rounded-xl text-sm font-bold group-hover:bg-rustic-green group-hover:text-white transition-all">
                        View Details
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
