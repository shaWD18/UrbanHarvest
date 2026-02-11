import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    FiUser, FiMail, FiClock, FiSettings,
    FiUsers, FiTrendingUp, FiShoppingBag, FiBox,
    FiArrowRight, FiShield
} from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';

import { API_BASE_URL } from "../../config";

const AdminProfile = () => {
    const { user, getToken } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            }
        } catch (error) {
            console.error('Error fetching admin profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
            </div>
        );
    }

    const joinDate = profileData?.created_at
        ? new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const adminStats = [
        {
            label: 'Customers',
            value: profileData?.stats?.total_customers || 0,
            icon: FiUsers,
            color: 'from-blue-500 to-indigo-600',
            link: '/admin'
        },
        {
            label: 'Pending Orders',
            value: profileData?.stats?.pending_orders || 0,
            icon: FiShoppingBag,
            color: 'from-orange-500 to-amber-600',
            link: '/admin/orders'
        },
        {
            label: 'Active Subscriptions',
            value: profileData?.stats?.active_subscriptions || 0,
            icon: FiBox,
            color: 'from-purple-500 to-pink-600',
            link: '/admin/subscriptions'
        }
    ];

    const quickLinks = [
        { name: 'Store Dashboard', path: '/admin', icon: FiShield },
        { name: 'Manage Orders', path: '/admin/orders', icon: FiShoppingBag },
        { name: 'Product Catalog', path: '/admin/products', icon: FiBox },
        { name: 'System Settings', path: '/admin', icon: FiSettings },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Admin Info Header */}
            <div className="bg-white dark:bg-rustic-mud rounded-3xl p-6 sm:p-8 border border-rustic-moss/10 shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-rustic-green to-rustic-moss flex items-center justify-center shadow-inner">
                        <span className="text-4xl sm:text-5xl font-bold text-white uppercase">
                            {user?.name?.charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-rustic-charcoal dark:text-white">
                                {user?.name}
                            </h1>
                            <span className="inline-flex items-center px-3 py-1 bg-rustic-clay/20 text-rustic-clay text-xs font-bold uppercase rounded-full tracking-wider">
                                Administrator
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-400">
                                <FiMail className="w-4 h-4" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-400">
                                <FiClock className="w-4 h-4" />
                                <span>Admin since {joinDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {adminStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <button
                            key={idx}
                            onClick={() => navigate(stat.link)}
                            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg text-left hover:scale-[1.02] transition-all group`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <Icon className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                                <span className="text-2xl font-bold">{stat.value}</span>
                            </div>
                            <p className="text-white/80 font-medium text-sm">{stat.label}</p>
                        </button>
                    )
                })}
            </div>

            {/* Quick Management Links */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-rustic-mud rounded-2xl p-6 sm:p-8 border border-rustic-moss/10 shadow-md">
                    <h2 className="text-xl font-serif font-bold text-rustic-charcoal dark:text-white mb-6 flex items-center gap-2">
                        <FiSettings className="text-rustic-green" /> Quick Management
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {quickLinks.map((link, idx) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={idx}
                                    to={link.path}
                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-rustic-beige/20 dark:hover:bg-rustic-charcoal/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rustic-green/10 rounded-lg group-hover:bg-rustic-green/20 transition-colors">
                                            <Icon className="text-rustic-green" />
                                        </div>
                                        <span className="font-semibold text-rustic-charcoal dark:text-white">{link.name}</span>
                                    </div>
                                    <FiArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-rustic-charcoal text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-rustic-green/20 rounded-full flex items-center justify-center mb-4">
                        <FiShield className="w-8 h-8 text-rustic-green" />
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-2">Secure Admin Access</h3>
                    <p className="text-gray-400 text-sm mb-6 max-w-xs">
                        You have full access to management tools, sales reports, and customer data. Please ensure your account remains secure.
                    </p>
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-6 py-2 bg-rustic-green hover:bg-rustic-moss rounded-full font-bold transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
