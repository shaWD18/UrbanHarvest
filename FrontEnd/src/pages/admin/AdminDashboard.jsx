import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { FiPackage, FiCalendar, FiBook, FiArrowRight, FiTrendingUp, FiShoppingBag, FiBox, FiShoppingCart } from "react-icons/fi";

function AdminDashboard() {
    const { user } = useAuth();
    const { products, events, workshops, subscriptions } = useAppContext();

    const stats = [
        {
            icon: FiPackage,
            label: "Products",
            value: products.length,
            color: "rustic-clay",
            bgColor: "bg-rustic-clay/10",
            link: "/admin/products"
        },
        {
            icon: FiCalendar,
            label: "Events",
            value: events.length,
            color: "rustic-green",
            bgColor: "bg-rustic-green/10",
            link: "/admin/events"
        },
        {
            icon: FiBook,
            label: "Workshops",
            value: workshops.length,
            color: "rustic-earth",
            bgColor: "bg-rustic-earth/10",
            link: "/admin/workshops"
        },
        {
            icon: FiBox,
            label: "Subscriptions",
            value: subscriptions?.length || 0,
            color: "blue-500",
            bgColor: "bg-blue-500/10",
            link: "/admin/subscriptions"
        },
        {
            icon: FiShoppingCart,
            label: "Orders",
            value: "View",
            color: "purple-500",
            bgColor: "bg-purple-500/10",
            link: "/admin/orders"
        }
    ];

    const quickActions = [
        {
            icon: FiPackage,
            title: "Manage Products",
            description: "Add, edit, or remove products from the marketplace",
            link: "/admin/products",
            color: "rustic-clay",
            gradient: "from-rustic-clay/20 to-rustic-earth/10"
        },
        {
            icon: FiCalendar,
            title: "Manage Events",
            description: "Create and manage community events",
            link: "/admin/events",
            color: "rustic-green",
            gradient: "from-rustic-green/20 to-rustic-moss/10"
        },
        {
            icon: FiBook,
            title: "Manage Workshops",
            description: "Organize and update workshop schedules",
            link: "/admin/workshops",
            color: "rustic-earth",
            gradient: "from-rustic-earth/20 to-rustic-clay/10"
        },
        {
            icon: FiBox,
            title: "Manage Subscriptions",
            description: "Update subscription plans and packages",
            link: "/admin/subscriptions",
            color: "blue-500",
            gradient: "from-blue-500/20 to-blue-600/10"
        },
        {
            icon: FiShoppingCart,
            title: "Manage Orders",
            description: "View and manage customer orders",
            link: "/admin/orders",
            color: "purple-500",
            gradient: "from-purple-500/20 to-purple-600/10"
        }
    ];

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-charcoal py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rustic-green/10 via-rustic-clay/10 to-rustic-earth/10 rounded-3xl blur-3xl -z-10"></div>
                    <div className="card-premium p-8 md:p-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                                    Welcome back, {user?.name?.split(' ')[0]}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Manage your Urban Harvest Hub content and community
                                </p>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 bg-rustic-green/10 dark:bg-green-500/20 rounded-2xl border border-rustic-green/20">
                                <FiTrendingUp className="w-6 h-6 text-rustic-green dark:text-green-400" />
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Items</p>
                                    <p className="text-2xl font-bold text-rustic-green dark:text-green-400">
                                        {products.length + events.length + workshops.length + (subscriptions?.length || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <Link
                            key={index}
                            to={stat.link}
                            className="group card-premium p-6 hover:border-rustic-green/30 dark:hover:border-green-500/30"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-7 h-7 text-${stat.color}`} />
                                </div>
                                <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rustic-green dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <div>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {stat.label}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-rustic-clay rounded-full"></span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className="group relative overflow-hidden card-premium p-8 hover:border-rustic-green/30 dark:hover:border-green-500/30"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className={`inline-flex p-4 rounded-2xl bg-${action.color}/10 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                        <action.icon className={`w-10 h-10 text-${action.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-rustic-green dark:group-hover:text-green-400 transition-colors">
                                        {action.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        {action.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-rustic-clay group-hover:text-rustic-green dark:group-hover:text-green-400 font-medium transition-colors">
                                        <span>Get Started</span>
                                        <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
