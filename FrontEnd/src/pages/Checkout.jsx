import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiCheckCircle } from "react-icons/fi";
import CheckoutModal from "../components/CheckoutModal";

function Checkout() {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCheckoutClick = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        setIsModalOpen(true);
    };

    const handlePlaceOrder = async (modalData) => {

        setPlacingOrder(true);
        try {
            const response = await fetch("https://urbanharvest-production.up.railway.app/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    items: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity
                    })),
                    ...modalData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to place order");
            }

            // Success
            setOrderSuccess(true);
            clearCart();
            setTimeout(() => {
                navigate("/"); // Or redirect to a dedicated order history page if created
            }, 3000);

        } catch (error) {
            console.error("Order error:", error);
            alert("Failed to place order: " + error.message);
        } finally {
            setPlacingOrder(false);
            setIsModalOpen(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <FiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-rustic-charcoal dark:text-white mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Thank you for your purchase. Your order has been successfully placed and is being processed.
                </p>
                <div className="mt-8">
                    <button
                        onClick={() => navigate("/")}
                        className="btn-primary"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <FiShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-rustic-charcoal dark:text-white mb-2">Your Cart is Empty</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Looks like you haven't added any fresh produce yet.
                </p>
                <button
                    onClick={() => navigate("/products")}
                    className="btn-primary"
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-serif font-bold text-rustic-charcoal dark:text-white mb-8">
                Your Shopping Cart
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-rustic-slate p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-center border border-gray-100 dark:border-gray-800"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-gray-100"
                            />

                            <div className="flex-grow text-center sm:text-left">
                                <h3 className="font-bold text-rustic-charcoal dark:text-white text-base">{item.name}</h3>
                                <p className="text-gray-500 text-sm">{item.category}</p>
                                <p className="font-bold text-rustic-green mt-1">LKR {item.price}</p>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0">
                                <div className="flex items-center bg-gray-100 dark:bg-rustic-stone rounded-lg">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l-lg disabled:opacity-50"
                                        disabled={item.quantity <= 1}
                                    >
                                        <FiMinus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-lg"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Remove item"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-rustic-mud p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 sticky top-24">
                        <h2 className="text-xl font-bold text-rustic-charcoal dark:text-white mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>LKR {getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between font-bold text-xl text-rustic-charcoal dark:text-white">
                                <span>Total</span>
                                <span>LKR {getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckoutClick}
                            disabled={placingOrder}
                            className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2"
                        >
                            {placingOrder ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : (
                                "Checkout Now"
                            )}
                        </button>

                        <CheckoutModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={handlePlaceOrder}
                            totalAmount={getCartTotal()}
                        />

                        {!user && (
                            <p className="text-sm text-center text-red-500 mt-3">
                                You must be logged in to place an order.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
