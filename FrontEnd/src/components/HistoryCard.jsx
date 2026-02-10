import { FiPackage, FiCalendar, FiTool, FiBox } from 'react-icons/fi';

const HistoryCard = ({ type, title, subtitle, date, status, image, actions, onClick }) => {
    const getIcon = () => {
        switch (type) {
            case 'order': return <FiPackage className="w-5 h-5" />;
            case 'event': return <FiCalendar className="w-5 h-5" />;
            case 'workshop': return <FiTool className="w-5 h-5" />;
            case 'subscription': return <FiBox className="w-5 h-5" />;
            default: return <FiPackage className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'confirmed':
            case 'active':
            case 'paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pending':
            case 'registered':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <div
            className="bg-white dark:bg-rustic-mud rounded-2xl p-6 border border-rustic-moss/10 hover:shadow-lg transition-all cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Image/Icon */}
                <div className="w-full sm:w-20 h-40 sm:h-20 flex-shrink-0">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full rounded-xl object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-full h-full rounded-xl bg-rustic-green/10 flex items-center justify-center text-rustic-green">
                            {getIcon()}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-rustic-charcoal dark:text-white text-lg group-hover:text-rustic-green transition-colors truncate">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {status && (
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm sm:self-start ${getStatusColor(status)}`}>
                                {status.toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Date */}
                    {date && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                            <FiCalendar className="w-4 h-4" />
                            {new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    )}

                    {/* Actions */}
                    {actions && actions.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        action.onClick();
                                    }}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${action.primary
                                        ? 'bg-rustic-green text-white hover:bg-rustic-earth shadow-md hover:shadow-lg'
                                        : 'bg-gray-100 dark:bg-rustic-deep text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-rustic-slate'
                                        }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryCard;
