import { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiPackage, FiCalendar, FiTool, FiBox, FiArrowLeft, FiMenu, FiX } from "react-icons/fi";
import ProfileOverview from './profile/ProfileOverview';
import ProfileOrders from './profile/ProfileOrders';
import ProfileEvents from './profile/ProfileEvents';
import ProfileWorkshops from './profile/ProfileWorkshops';
import ProfileSubscriptions from './profile/ProfileSubscriptions';
import AdminProfile from './admin/AdminProfile';

const Profile = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Please log in to view your profile</h2>
                    <Link to="/login" className="px-6 py-2 bg-rustic-green text-white rounded-lg">Login</Link>
                </div>
            </div>
        );
    }

    // If admin, show dedicated admin profile
    if (isAdmin()) {
        return (
            <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-deep py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <Link to="/admin" className="inline-flex items-center text-rustic-clay hover:text-rustic-earth mb-8 transition-colors group">
                        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </Link>
                    <AdminProfile />
                </div>
            </div>
        );
    }

    // Determine active section from URL hash or default to overview
    const getActiveSection = () => {
        const hash = location.hash.replace('#', '');
        return hash || 'overview';
    };

    const activeSection = getActiveSection();

    const menuItems = [
        { id: 'overview', label: 'Profile', icon: FiUser },
        { id: 'orders', label: 'Orders', icon: FiPackage },
        { id: 'events', label: 'Events', icon: FiCalendar },
        { id: 'workshops', label: 'Workshops', icon: FiTool },
        { id: 'subscriptions', label: 'Subscriptions', icon: FiBox },
    ];

    const handleSectionChange = (sectionId) => {
        navigate(`/profile#${sectionId}`);
        setSidebarOpen(false);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'orders':
                return <ProfileOrders />;
            case 'events':
                return <ProfileEvents />;
            case 'workshops':
                return <ProfileWorkshops />;
            case 'subscriptions':
                return <ProfileSubscriptions />;
            default:
                return <ProfileOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-deep py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <Link to="/" className="inline-flex items-center text-rustic-clay hover:text-rustic-earth mb-8 transition-colors group">
                    <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </Link>

                {/* Header */}
                <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl overflow-hidden border border-rustic-moss/10 mb-6 sm:mb-8">
                    <div className="h-24 sm:h-32 bg-gradient-to-r from-rustic-green to-rustic-moss/80 relative">
                        <div className="absolute -bottom-10 sm:-bottom-16 left-1/2 -translate-x-1/2 sm:left-12 sm:translate-x-0">
                            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-rustic-mud bg-white dark:bg-rustic-charcoal flex items-center justify-center shadow-lg">
                                <span className="text-3xl sm:text-5xl font-bold text-rustic-green dark:text-green-400">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 sm:pt-20 px-6 sm:px-12 pb-6 sm:pb-8 text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rustic-charcoal dark:text-white mb-1 sm:mb-2">
                            {user.name}
                        </h1>
                        <p className="text-rustic-clay font-medium text-sm sm:text-base">{user.email}</p>
                    </div>
                </div>

                {/* Mobile Grid Navigation */}
                <div className="lg:hidden mb-8 -mx-1 py-2">
                    <div className="grid grid-cols-2 gap-3 px-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleSectionChange(item.id)}
                                    className={`
                                        flex flex-col items-center justify-center gap-2 p-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all
                                        ${isActive
                                            ? 'bg-rustic-green text-white shadow-lg scale-[1.02] ring-2 ring-rustic-green ring-offset-2 dark:ring-offset-rustic-deep'
                                            : 'bg-white dark:bg-rustic-mud text-gray-700 dark:text-gray-300 border border-rustic-moss/10 shadow-sm hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'text-rustic-green dark:text-green-400'}`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content with Sidebar */}
                <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                    {/* Sidebar (Desktop Only) */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 bg-white dark:bg-rustic-mud rounded-2xl shadow-lg border border-rustic-moss/10 p-4">
                            <nav className="space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeSection === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSectionChange(item.id)}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                                                ${isActive
                                                    ? 'bg-rustic-green text-white shadow-md'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-rustic-beige/50 dark:hover:bg-rustic-deep/50'
                                                }
                                            `}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="bg-white dark:bg-rustic-mud rounded-2xl shadow-lg border border-rustic-moss/10 p-5 sm:p-8">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;
