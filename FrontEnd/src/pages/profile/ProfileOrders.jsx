import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HistoryCard from '../../components/HistoryCard';
import EmptyState from '../../components/EmptyState';
import { FiPackage } from 'react-icons/fi';
import OrderDetailModal from '../../components/OrderDetailModal';

const API_BASE_URL = 'http://localhost:3000/api';

const ProfileOrders = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/user/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <EmptyState
                icon={FiPackage}
                title="No Orders Yet"
                message="You haven't placed any orders yet. Start shopping to see your order history here!"
                actionLabel="Browse Products"
                onAction={() => navigate('/products')}
            />
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-rustic-charcoal dark:text-white mb-6">
                Order History
            </h2>
            {orders.map((order) => (
                <HistoryCard
                    key={order.id}
                    type="order"
                    title={`Order #${order.id}`}
                    subtitle={`${order.items?.length || 0} item(s) • LKR ${order.total_amount?.toLocaleString()}`}
                    date={order.created_at}
                    status={order.status}
                    image={order.items?.[0]?.image}
                    onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                    }}
                    actions={[
                        {
                            label: 'View Details',
                            primary: true,
                            onClick: () => {
                                setSelectedOrder(order);
                                setIsModalOpen(true);
                            }
                        }
                    ]}
                />
            ))}

            <OrderDetailModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default ProfileOrders;
