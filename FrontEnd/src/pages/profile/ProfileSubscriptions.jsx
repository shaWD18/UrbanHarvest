import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HistoryCard from '../../components/HistoryCard';
import EmptyState from '../../components/EmptyState';
import { FiBox } from 'react-icons/fi';

import { API_BASE_URL } from "../../config";

const ProfileSubscriptions = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/user/subscriptions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading subscriptions...</div>;
    }

    if (subscriptions.length === 0) {
        return (
            <EmptyState
                icon={FiBox}
                title="No Subscriptions"
                message="You don't have any subscriptions yet. Subscribe to our boxes and get fresh produce delivered regularly!"
                actionLabel="Browse Subscriptions"
                onAction={() => navigate('/subscriptions')}
            />
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-rustic-charcoal dark:text-white mb-6">
                My Subscriptions
            </h2>
            {subscriptions.map((sub) => (
                <HistoryCard
                    key={sub.id}
                    type="subscription"
                    title={sub.subscription_name}
                    subtitle={`${sub.frequency} • ${sub.box_size} box • ${sub.subscription_price}`}
                    date={sub.start_date}
                    status={sub.status}
                    image={sub.subscription_image}
                    actions={[
                        {
                            label: 'Manage',
                            primary: true,
                            onClick: () => navigate(`/subscriptions/${sub.subscription_id}`)
                        }
                    ]}
                />
            ))}
        </div>
    );
};

export default ProfileSubscriptions;
