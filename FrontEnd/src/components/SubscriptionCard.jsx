
// Basic Card Component for Subscriptions
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";

const SubscriptionCard = ({ subscription }) => {
    return (
        <Link
            to={`/subscriptions/${subscription.id}`}
            className="group relative bg-white dark:bg-rustic-mud rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-rustic-moss/10 flex flex-col h-[400px]"
        >
            {/* Image Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={subscription.image}
                    alt={subscription.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rustic-charcoal/95 via-rustic-charcoal/60 to-black/20 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Type Badge */}
            <div className="absolute top-4 right-4 z-10">
                <span className="bg-white/90 dark:bg-rustic-charcoal/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-rustic-clay border border-rustic-clay/20 shadow-sm">
                    {subscription.type}
                </span>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full p-6 text-white mt-auto justify-end">
                <div className="transform transition-all duration-300 group-hover:-translate-y-2">
                    <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-rustic-clay transition-colors delay-75">
                        {subscription.name}
                    </h3>

                    {/* Price - Always visible */}
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-xl font-bold text-rustic-cream">
                            {typeof subscription.price === 'number' || !isNaN(Number(subscription.price))
                                ? `LKR ${Number(subscription.price).toLocaleString()}`
                                : String(subscription.price).split('/')[0]}
                        </span>
                        <span className="text-sm text-gray-300">
                            /{String(subscription.price).includes('/') ? String(subscription.price).split('/')[1] : 'month'}
                        </span>
                    </div>

                    {/* Description - Hidden initially, shown on hover */}
                    <div className="h-0 overflow-hidden group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out delay-75">
                        <p className="text-sm text-gray-200 mb-4 line-clamp-3">
                            {subscription.description}
                        </p>

                        {/* Features Preview - Optional, minimal */}
                        {subscription.features && (
                            <div className="space-y-1 mb-4">
                                {subscription.features.slice(0, 2).map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                                        <FiCheck className="w-3 h-3 text-rustic-clay" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="w-full py-3 bg-rustic-clay text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-white hover:text-rustic-clay transition-all duration-300 shadow-lg">
                            <span>Subscribe Now</span>
                            <FiArrowRight />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default SubscriptionCard;
