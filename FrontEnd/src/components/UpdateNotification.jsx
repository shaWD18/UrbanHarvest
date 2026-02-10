import { useState, useEffect } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';

const UpdateNotification = () => {
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        const handleUpdate = () => {
            setShowUpdate(true);
        };

        window.addEventListener('swUpdate', handleUpdate);

        return () => window.removeEventListener('swUpdate', handleUpdate);
    }, []);

    const handleUpdate = () => {
        window.location.reload();
    };

    const handleDismiss = () => {
        setShowUpdate(false);
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50 animate-slide-up">
            <div className="bg-blue-500 text-white rounded-xl shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <FiRefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-medium mb-1">Update Available</p>
                        <p className="text-sm opacity-90 mb-3">
                            A new version of Urban Harvest is available. Reload to update.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-white text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
                            >
                                Reload Now
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-white/80 hover:text-white"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateNotification;
