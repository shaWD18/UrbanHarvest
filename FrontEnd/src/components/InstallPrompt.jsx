import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    // Detect platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    // Don't render anything on desktop - EARLY RETURN
    if (!isMobile) {
        return null;
    }

    useEffect(() => {
        // Check if already dismissed recently
        const dismissed = localStorage.getItem('installPromptDismissed');
        if (dismissed) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        // For Android Chrome/Edge
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS - show if not already installed
        if (isIOS && !isInStandaloneMode) {
            setTimeout(() => setShowPrompt(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [isIOS, isInStandaloneMode]);

    const handleInstall = async () => {
        // iOS - show instructions
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        // Android - trigger install
        if (!deferredPrompt) {
            alert('Installation is not available on this browser.');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setShowIOSInstructions(false);
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    };

    // iOS Instructions Modal
    if (showIOSInstructions) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleDismiss}>
                <div className="bg-white dark:bg-rustic-mud rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <FiSmartphone className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-xl text-rustic-charcoal dark:text-white">
                                Install on iOS
                            </h3>
                        </div>
                        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4 text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-rustic-charcoal dark:text-white">
                            To install Urban Harvest on your iPhone or iPad:
                        </p>
                        <ol className="space-y-3 list-decimal list-inside">
                            <li>Tap the <span className="font-bold">Share</span> button (square with arrow) at the bottom of Safari</li>
                            <li>Scroll down and tap <span className="font-bold">"Add to Home Screen"</span></li>
                            <li>Tap <span className="font-bold">"Add"</span> in the top right</li>
                            <li>The app will appear on your home screen!</li>
                        </ol>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="w-full mt-6 px-4 py-3 bg-rustic-green text-white rounded-xl font-medium hover:bg-rustic-earth transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        );
    }

    // Install Banner
    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
            <div className="bg-white dark:bg-rustic-mud rounded-2xl shadow-2xl border border-rustic-moss/20 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-rustic-green/10 rounded-xl flex items-center justify-center">
                        <FiDownload className="w-6 h-6 text-rustic-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-rustic-charcoal dark:text-white mb-1">
                            Install Urban Harvest
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {isIOS
                                ? 'Add to your home screen for quick access and offline use!'
                                : 'Install our app for a better experience and offline access!'}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 bg-rustic-green text-white rounded-lg font-medium hover:bg-rustic-earth transition-colors text-sm"
                            >
                                {isIOS ? 'Show Instructions' : 'Install'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-gray-100 dark:bg-rustic-deep text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-rustic-slate transition-colors text-sm"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
