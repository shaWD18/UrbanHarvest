import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiPackage, FiCalendar, FiBox, FiMail, FiUser, FiClock, FiTool } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from "../../config";

const ProfileOverview = () => {
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
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    const joinDate = profileData?.created_at
        ? new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    return (
        <div className="space-y-6">
            {/* Profile Info Card */}
            <div className="bg-white dark:bg-rustic-mud rounded-2xl p-6 sm:p-8 border border-rustic-moss/10">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-rustic-charcoal dark:text-white mb-6">
                    Profile Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-rustic-green/10 rounded-xl">
                            <FiUser className="w-6 h-6 text-rustic-green" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                            <p className="font-medium text-rustic-charcoal dark:text-white">{user?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-rustic-green/10 rounded-xl">
                            <FiMail className="w-6 h-6 text-rustic-green" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                            <p className="font-medium text-rustic-charcoal dark:text-white">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-rustic-green/10 rounded-xl">
                            <FiClock className="w-6 h-6 text-rustic-green" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Member Since</p>
                            <p className="font-medium text-rustic-charcoal dark:text-white">{joinDate}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <button
                    onClick={() => navigate('/profile#orders')}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg text-left hover:scale-[1.02] transition-transform group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FiPackage className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl sm:text-3xl font-bold">{profileData?.stats?.total_orders || 0}</span>
                    </div>
                    <p className="text-blue-100 font-medium text-sm sm:text-base">Total Orders</p>
                </button>

                <button
                    onClick={() => navigate('/profile#events')}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg text-left hover:scale-[1.02] transition-transform group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FiCalendar className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl sm:text-3xl font-bold">{profileData?.stats?.upcoming_events || 0}</span>
                    </div>
                    <p className="text-green-100 font-medium text-sm sm:text-base">Events</p>
                </button>

                <button
                    onClick={() => navigate('/profile#workshops')}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg text-left hover:scale-[1.02] transition-transform group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FiTool className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl sm:text-3xl font-bold">{profileData?.stats?.workshop_registrations || 0}</span>
                    </div>
                    <p className="text-orange-100 font-medium text-sm sm:text-base">Workshop Registrations</p>
                </button>

                <button
                    onClick={() => navigate('/profile#subscriptions')}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg text-left hover:scale-[1.02] transition-transform group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FiBox className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl sm:text-3xl font-bold">{profileData?.stats?.active_subscriptions || 0}</span>
                    </div>
                    <p className="text-purple-100 font-medium text-sm sm:text-base">Active Subscriptions</p>
                </button>
            </div>
        </div>
    );
};

export default ProfileOverview;
