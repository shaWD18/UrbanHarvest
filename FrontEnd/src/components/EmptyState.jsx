const EmptyState = ({ icon: Icon, title, message, actionLabel, onAction }) => {
    return (
        <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rustic-beige/50 dark:bg-rustic-deep/50 mb-6">
                <Icon className="w-10 h-10 text-rustic-clay dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-rustic-charcoal dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {message}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-rustic-green text-white rounded-xl font-medium hover:bg-rustic-earth transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
