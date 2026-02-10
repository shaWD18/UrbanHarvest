import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HistoryCard from '../../components/HistoryCard';
import EmptyState from '../../components/EmptyState';
import { FiCalendar } from 'react-icons/fi';

const API_BASE_URL = 'https://urbanharvest-production.up.railway.app/api';

const ProfileEvents = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/user/events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading events...</div>;
    }

    if (events.length === 0) {
        return (
            <EmptyState
                icon={FiCalendar}
                title="No Event Bookings"
                message="You haven't booked any events yet. Explore our upcoming events and reserve your spot!"
                actionLabel="Browse Events"
                onAction={() => navigate('/events')}
            />
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-rustic-charcoal dark:text-white mb-6">
                Event Bookings
            </h2>
            {events.map((event) => (
                <HistoryCard
                    key={event.id}
                    type="event"
                    title={event.event_title}
                    subtitle={`${event.attendees} attendee(s) • ${event.event_location}`}
                    date={event.event_date}
                    status={event.status}
                    image={event.event_image}
                    actions={[
                        {
                            label: 'View Event',
                            primary: true,
                            onClick: () => navigate(`/events/${event.event_id}`)
                        }
                    ]}
                />
            ))}
        </div>
    );
};

export default ProfileEvents;
