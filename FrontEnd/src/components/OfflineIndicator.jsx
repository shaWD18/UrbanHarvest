import { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi } from 'react-icons/fi';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Show "Back Online" message briefly
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner) return null;

    return (
        <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50 animate-slide-down">
            <div className={`rounded-xl shadow-lg p-4 flex items-center gap-3 ${isOnline
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}>
                {isOnline ? (
                    <FiWifi className="w-5 h-5 flex-shrink-0" />
                ) : (
                    <FiWifiOff className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="flex-1">
                    <p className="font-medium">
                        {isOnline ? 'Back Online!' : 'You\'re Offline'}
                    </p>
                    <p className="text-sm opacity-90">
                        {isOnline
                            ? 'Your connection has been restored'
                            : 'Some features may be limited'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfflineIndicator;
