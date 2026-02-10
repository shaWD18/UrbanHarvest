import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiPackage, FiSearch, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import Pagination from "../../components/Pagination";

const API_BASE_URL = "http://localhost:3000/api";
const ITEMS_PER_PAGE = 5;

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const { getToken } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, []);

    // Reset to first page when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, priceFilter, stockFilter]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const token = getToken();
            await fetch(`${API_BASE_URL}/products/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            fetchProducts(); // Refresh list
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

        // Price filter
        const price = parseFloat(product.price);
        let matchesPrice = true;
        if (priceFilter === "budget") matchesPrice = price < 100;
        else if (priceFilter === "mid-range") matchesPrice = price >= 100 && price < 500;
        else if (priceFilter === "premium") matchesPrice = price >= 500;

        // Stock filter
        const stock = parseInt(product.stock);
        let matchesStock = true;
        if (stockFilter === "in-stock") matchesStock = stock > 20;
        else if (stockFilter === "low-stock") matchesStock = stock > 0 && stock <= 20;
        else if (stockFilter === "out-of-stock") matchesStock = stock === 0;

        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    // Get unique categories for filter dropdown
    const categories = [...new Set(products.map(p => p.category))].sort();

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-rustic-beige/30 dark:bg-rustic-deep">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rustic-green mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-deep py-8">
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

                    <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl p-6 md:p-8 border border-rustic-moss/10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-rustic-clay/10 rounded-2xl">
                                    <FiPackage className="w-8 h-8 text-rustic-clay" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-rustic-charcoal dark:text-white">
                                        Manage Products
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Viewing products {filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/admin/products/add"
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rustic-green text-white rounded-xl hover:bg-rustic-moss transition-all font-medium text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <FiPlus className="w-5 h-5" />
                                Add New Product
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex flex-col gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products by name or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select
                            value={priceFilter}
                            onChange={(e) => setPriceFilter(e.target.value)}
                            className="px-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all"
                        >
                            <option value="all">All Prices</option>
                            <option value="budget">Budget (&lt; LKR 100)</option>
                            <option value="mid-range">Mid-Range (LKR 100-500)</option>
                            <option value="premium">Premium (&gt; LKR 500)</option>
                        </select>

                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="px-4 py-3 bg-white dark:bg-rustic-mud border border-rustic-moss/20 rounded-xl focus:ring-2 focus:ring-rustic-green focus:border-transparent dark:text-white transition-all"
                        >
                            <option value="all">All Stock Levels</option>
                            <option value="in-stock">In Stock (&gt; 20)</option>
                            <option value="low-stock">Low Stock (1-20)</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Products Display (Hybrid View) */}
                <div className="space-y-6">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden lg:block bg-white dark:bg-rustic-mud rounded-3xl shadow-xl overflow-hidden border border-rustic-moss/10">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-rustic-beige/50 dark:bg-rustic-charcoal/50 border-b border-rustic-moss/10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-rustic-charcoal dark:text-rustic-beige uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rustic-moss/10">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((product) => (
                                            <tr key={product.id} className="hover:bg-rustic-beige/30 dark:hover:bg-rustic-deep/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover shadow-md border border-rustic-moss/10" />
                                                        <div>
                                                            <p className="font-semibold text-rustic-charcoal dark:text-white">{product.name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {product.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-rustic-green/10 text-rustic-green dark:bg-green-900/30 dark:text-green-300 rounded-lg text-sm font-medium">{product.category}</span>
                                                </td>
                                                <td className="px-6 py-4 text-rustic-charcoal dark:text-white font-semibold">LKR {product.price}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${product.stock > 10 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : product.stock > 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                        {product.stock} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/admin/products/preview/${product.id}`} className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110" title="Preview"><FiEye className="w-5 h-5" /></Link>
                                                        <Link to={`/admin/products/edit/${product.id}`} className="p-2.5 text-rustic-green hover:bg-rustic-green/10 rounded-xl transition-all hover:scale-110" title="Edit"><FiEdit2 className="w-5 h-5" /></Link>
                                                        <button onClick={() => handleDelete(product.id)} className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110" title="Delete"><FiTrash2 className="w-5 h-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No products found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View - Hidden on Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                        {currentItems.length > 0 ? (
                            currentItems.map((product) => (
                                <div key={product.id} className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl border border-rustic-moss/10 p-5 flex flex-col gap-4">
                                    <div className="flex items-start gap-4">
                                        <img src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover shadow-md border border-rustic-moss/10" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-rustic-charcoal dark:text-white truncate">{product.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ID: {product.id}</p>
                                            <span className="inline-block px-3 py-1 bg-rustic-green/10 text-rustic-green dark:bg-green-900/30 dark:text-green-300 rounded-lg text-xs font-bold uppercase tracking-wider">{product.category}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-rustic-moss/10">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                                            <p className="font-bold text-rustic-charcoal dark:text-white">LKR {product.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock Status</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${product.stock > 10 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : product.stock > 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}>
                                                {product.stock} units
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-auto">
                                        <div className="flex gap-2">
                                            <Link to={`/admin/products/preview/${product.id}`} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl transition-all active:scale-95"><FiEye className="w-5 h-5" /></Link>
                                            <Link to={`/admin/products/edit/${product.id}`} className="p-3 bg-rustic-green/10 text-rustic-green rounded-xl transition-all active:scale-95"><FiEdit2 className="w-5 h-5" /></Link>
                                        </div>
                                        <button onClick={() => handleDelete(product.id)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl transition-all active:scale-95"><FiTrash2 className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-rustic-mud rounded-3xl shadow-xl border border-rustic-moss/10 p-12 text-center text-gray-500 col-span-full">No products found</div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        totalItems={filteredProducts.length}
                        indexOfFirstItem={indexOfFirstItem}
                        indexOfLastItem={indexOfLastItem}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminProducts;
