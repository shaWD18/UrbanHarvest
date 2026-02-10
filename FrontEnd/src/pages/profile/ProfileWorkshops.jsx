import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HistoryCard from '../../components/HistoryCard';
import EmptyState from '../../components/EmptyState';
import { FiTool } from 'react-icons/fi';

const API_BASE_URL = 'https://urbanharvest-production.up.railway.app/api';

const ProfileWorkshops = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/user/workshops`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setWorkshops(data);
            }
        } catch (error) {
            console.error('Error fetching workshops:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading workshops...</div>;
    }

    if (workshops.length === 0) {
        return (
            <EmptyState
                icon={FiTool}
                title="No Workshop Registrations"
                message="You haven't registered for any workshops yet. Check out our hands-on workshops and learn new skills!"
                actionLabel="Browse Workshops"
                onAction={() => navigate('/workshops')}
            />
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-rustic-charcoal dark:text-white mb-6">
                Workshop Registrations
            </h2>
            {workshops.map((workshop) => (
                <HistoryCard
                    key={workshop.id}
                    type="workshop"
                    title={workshop.workshop_title}
                    subtitle={`${workshop.workshop_location} • ${workshop.workshop_price}`}
                    date={workshop.workshop_date}
                    status={workshop.payment_status}
                    image={workshop.workshop_image}
                    actions={[
                        {
                            label: 'View Workshop',
                            primary: true,
                            onClick: () => navigate(`/workshops/${workshop.workshop_id}`)
                        }
                    ]}
                />
            ))}
        </div>
    );
};

export default ProfileWorkshops;
