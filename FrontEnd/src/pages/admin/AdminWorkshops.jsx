import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiBook, FiSearch, FiEye, FiUsers } from "react-icons/fi";
import Pagination from "../../components/Pagination";

const API_BASE_URL = "https://urbanharvest-production.up.railway.app/api";
const ITEMS_PER_PAGE = 5;

function AdminWorkshops() {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterDateRange, setFilterDateRange] = useState("All");
    const [filterLocation, setFilterLocation] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const { getToken } = useAuth();


    useEffect(() => {
        fetchWorkshops();
    }, []);

    // Reset to first page when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, filterDateRange, filterLocation]);

    const fetchWorkshops = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/workshops`);
            const data = await res.json();
            setWorkshops(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching workshops:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this workshop?")) return;

        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/workshops/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete workshop");
            }

            alert("Workshop deleted successfully");
            fetchWorkshops(); // Refresh list
        } catch (error) {
            console.error("Error deleting workshop:", error);
            alert(error.message);
        }
    };

    const filteredWorkshops = workshops.filter(workshop => {
        const matchesSearch =
            workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workshop.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workshop.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === "All" || workshop.category === filterCategory;
        const matchesLocation = filterLocation === "All" || workshop.location === filterLocation;

        let matchesDate = true;
        if (filterDateRange !== "All") {
            const workshopDate = new Date(workshop.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (filterDateRange === "Today") {
                matchesDate = workshopDate.toDateString() === today.toDateString();
            } else if (filterDateRange === "This Week") {
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                matchesDate = workshopDate >= today && workshopDate <= nextWeek;
            } else if (filterDateRange === "Upcoming") {
                matchesDate = workshopDate >= today;
            } else if (filterDateRange === "Past") {
                matchesDate = workshopDate < today;
            }
        }

        return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });

    const categories = ["All", ...new Set(workshops.map(w => w.category))];
    const locations = ["All", ...new Set(workshops.map(w => w.location))];

    const clearFilters = () => {
        setSearchTerm("");
        setFilterCategory("All");
        setFilterDateRange("All");
        setFilterLocation("All");
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredWorkshops.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredWorkshops.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-charcoal">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rustic-green mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading workshops...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-charcoal py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-2 text-rustic-clay hover:text-rustic-earth mb-6 font-medium transition-colors group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="card-premium p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-rustic-earth/10 rounded-2xl">
                                    <FiBook className="w-8 h-8 text-rustic-earth" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white truncate">
                                        Manage Workshops
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Viewing workshops {filteredWorkshops.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredWorkshops.length)} of {filteredWorkshops.length}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/admin/workshops/add"
                                className="btn-primary flex items-center justify-center gap-2 text-sm px-5 py-2.5"
                            >
                                <FiPlus className="w-5 h-5" />
                                Add New Workshop
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="card-premium p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2 relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by title, category, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-premium pl-12 w-full"
                            />
                        </div>

                        <div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="input-premium w-full"
                            >
                                <option disabled value="">Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={filterDateRange}
                                onChange={(e) => setFilterDateRange(e.target.value)}
                                className="input-premium w-full"
                            >
                                <option value="All">All Dates</option>
                                <option value="Today">Today</option>
                                <option value="This Week">This Week</option>
                                <option value="Upcoming">Upcoming Workshops</option>
                                <option value="Past">Past Workshops</option>
                            </select>
                        </div>

                        <div>
                            <div className="flex gap-2">
                                <select
                                    value={filterLocation}
                                    onChange={(e) => setFilterLocation(e.target.value)}
                                    className="input-premium w-full"
                                >
                                    <option disabled value="">Location</option>
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
                                    ))}
                                </select>
                                {(searchTerm || filterCategory !== "All" || filterDateRange !== "All" || filterLocation !== "All") && (
                                    <button
                                        onClick={clearFilters}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        title="Clear all filters"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workshops Display (Hybrid View) */}
                <div className="space-y-6">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden lg:block card-premium overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-rustic-slate border-b border-gray-200 dark:border-rustic-ash">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Workshop</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Bookings</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-rustic-ash">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((workshop) => (
                                            <tr key={workshop.id} className="hover:bg-gray-50 dark:hover:bg-rustic-slate transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img src={workshop.image} alt={workshop.title} className="w-16 h-16 rounded-xl object-cover shadow-md border border-gray-200 dark:border-rustic-ash" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">{workshop.title}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {workshop.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-rustic-earth/10 text-rustic-earth dark:text-amber-400 rounded-lg text-sm font-medium">{workshop.category}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{workshop.date}</td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{workshop.duration || 'N/A'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workshop.booking_count > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        {workshop.booking_count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/admin/workshops/preview/${workshop.id}`} className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110" title="Preview"><FiEye className="w-5 h-5" /></Link>
                                                        <Link to={`/admin/workshops/edit/${workshop.id}`} className="p-2.5 text-rustic-green hover:bg-rustic-green/10 rounded-xl transition-all hover:scale-110" title="Edit"><FiEdit2 className="w-5 h-5" /></Link>
                                                        <button onClick={() => handleDelete(workshop.id)} className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110" title="Delete"><FiTrash2 className="w-5 h-5" /></button>
                                                        <Link to={`/admin/workshops/${workshop.id}/bookings`} className="p-2.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all hover:scale-110" title="View Bookings"><FiUsers className="w-5 h-5" /></Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No workshops found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View - Hidden on Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                        {currentItems.length > 0 ? (
                            currentItems.map((workshop) => (
                                <div key={workshop.id} className="card-premium p-5 flex flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <img src={workshop.image} alt={workshop.title} className="w-20 h-20 rounded-2xl object-cover shadow-md border border-gray-200 dark:border-rustic-ash" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{workshop.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ID: {workshop.id}</p>
                                            <span className="inline-block px-3 py-1 bg-rustic-earth/10 text-rustic-earth dark:text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider">{workshop.category}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 py-4 border-y border-gray-200 dark:border-rustic-ash">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date</p>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{workshop.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bookings</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${workshop.booking_count > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {workshop.booking_count || 0}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Duration</p>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{workshop.duration || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-auto">
                                        <div className="flex gap-2">
                                            <Link to={`/admin/workshops/preview/${workshop.id}`} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl transition-all active:scale-95"><FiEye className="w-5 h-5" /></Link>
                                            <Link to={`/admin/workshops/edit/${workshop.id}`} className="p-3 bg-rustic-green/10 text-rustic-green rounded-xl transition-all active:scale-95"><FiEdit2 className="w-5 h-5" /></Link>
                                            <Link to={`/admin/workshops/${workshop.id}/bookings`} className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl transition-all active:scale-95"><FiUsers className="w-5 h-5" /></Link>
                                        </div>
                                        <button onClick={() => handleDelete(workshop.id)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl transition-all active:scale-95"><FiTrash2 className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card-premium p-12 text-center text-gray-500 col-span-full">No workshops found</div>
                        )}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredWorkshops.length}
                        indexOfFirstItem={indexOfFirstItem}
                        indexOfLastItem={indexOfLastItem}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminWorkshops;
