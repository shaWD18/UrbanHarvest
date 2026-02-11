import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiX, FiSave, FiEye } from "react-icons/fi";

import { API_BASE_URL } from "../../config";

function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        short_description: "",
        description: "",
        image: "",
        stock: "",
    });

    const [features, setFeatures] = useState([""]);
    const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
    const [loading, setLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState("/admin/products");

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`);
            const data = await res.json();

            setFormData({
                name: data.name,
                price: data.price,
                category: data.category,
                short_description: data.short_description || "",
                description: data.description || "",
                image: data.image || "",
                stock: data.stock,
            });

            setFeatures(data.features?.length ? data.features : [""]);

            const specs = data.specifications
                ? Object.entries(data.specifications).map(([key, value]) => ({ key, value }))
                : [{ key: "", value: "" }];
            setSpecifications(specs);
        } catch (error) {
            console.error("Error fetching product:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            features: features.filter((f) => f.trim() !== ""),
            specifications: specifications
                .filter((s) => s.key.trim() !== "" && s.value.trim() !== "")
                .reduce((obj, s) => {
                    obj[s.key] = s.value;
                    return obj;
                }, {}),
        };

        try {
            const url = isEdit ? `${API_BASE_URL}/products/${id}` : `${API_BASE_URL}/products`;
            const method = isEdit ? "PUT" : "POST";
            const token = getToken();

            await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            navigate(redirectPath);
        } catch (error) {
            console.error("Error saving product:", error);
            setLoading(false);
        }
    };

    const addFeature = () => setFeatures([...features, ""]);
    const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index));
    const updateFeature = (index, value) => {
        const updated = [...features];
        updated[index] = value;
        setFeatures(updated);
    };

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual preview immediate
        const objectUrl = URL.createObjectURL(file);
        // We could set a temporary preview here if we had a separate state, 
        // but let's just upload immediately as requested.

        const uploadData = new FormData();
        uploadData.append('type', 'products');
        uploadData.append('image', file);

        setUploading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFormData(prev => ({ ...prev, image: data.filePath }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const addSpecification = () => setSpecifications([...specifications, { key: "", value: "" }]);
    const removeSpecification = (index) =>
        setSpecifications(specifications.filter((_, i) => i !== index));
    const updateSpecification = (index, field, value) => {
        setSpecifications(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-rustic-deep py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold text-rustic-charcoal dark:text-white mb-8">
                    {isEdit ? "Edit Product" : "Add New Product"}
                </h1>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-rustic-mud rounded-xl shadow-lg p-4 sm:p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={100}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                            />
                            <p className="text-xs text-right mt-1 text-gray-500">
                                {formData.name.length}/100
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category *
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                            >
                                <option value="">Select Category</option>
                                <option value="Fresh Produce">Fresh Produce</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Seeds">Seeds</option>
                                <option value="Tools">Tools</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Price (LKR) *
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onWheel={(e) => e.target.blur()}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (e.target.value === '' || (!isNaN(val) && val >= 0)) {
                                        setFormData({ ...formData, price: e.target.value });
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stock *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                        setFormData({ ...formData, stock: val });
                                    } else if (e.target.value === '') {
                                        setFormData({ ...formData, stock: '' });
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Product Image
                        </label>

                        <div className="flex items-start space-x-4">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full text-sm text-gray-500 dark:text-gray-400
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-rustic-clay file:text-white
                                      hover:file:bg-rustic-earth"
                                />
                                {uploading && <p className="text-sm text-amber-600 mt-2">Uploading...</p>}
                            </div>

                            {/* Image Preview */}
                            {(formData.image) && (
                                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative bg-gray-100">
                                    <img
                                        src={formData.image.startsWith('http') ? formData.image : `${API_BASE_URL.replace('/api', '')}${formData.image}`}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = '/assets/placeholder.jpg' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Short Description
                        </label>
                        <textarea
                            rows="2"
                            maxLength={200}
                            value={formData.short_description}
                            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                        />
                        <p className="text-xs text-right mt-1 text-gray-500">
                            {formData.short_description.length}/200
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Description
                        </label>
                        <textarea
                            rows="4"
                            maxLength={500}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                        />
                        <p className="text-xs text-right mt-1 text-gray-500">
                            {formData.description.length}/500
                        </p>
                    </div>

                    {/* Features */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Features
                            </label>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-1 text-sm text-rustic-clay hover:text-rustic-earth"
                            >
                                <FiPlus /> Add Feature
                            </button>
                        </div>
                        <div className="space-y-2">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        placeholder="e.g., 100% Organic Certified"
                                        className="flex-1 min-w-0 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                                    />
                                    {features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <FiX />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Specifications */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Specifications
                            </label>
                            <button
                                type="button"
                                onClick={addSpecification}
                                className="flex items-center gap-1 text-sm text-rustic-clay hover:text-rustic-earth"
                            >
                                <FiPlus /> Add Specification
                            </button>
                        </div>
                        <div className="space-y-4 md:space-y-2">
                            {specifications.map((spec, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 md:gap-2 p-4 md:p-0 border md:border-0 border-gray-100 dark:border-gray-800 rounded-lg">
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) => updateSpecification(index, "key", e.target.value)}
                                        placeholder="Key (e.g., Weight)"
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => updateSpecification(index, "value", e.target.value)}
                                        placeholder="Value (e.g., 1kg)"
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                                    />
                                    {specifications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSpecification(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg self-end md:self-auto"
                                        >
                                            <FiX />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={() => setRedirectPath("/admin/products")}
                            className="flex items-center gap-2 px-4 py-2 bg-rustic-clay text-white rounded-lg hover:bg-rustic-earth transition-colors font-medium disabled:opacity-50"
                        >
                            <FiSave /> {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
                        </button>
                        {isEdit && (
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={() => setRedirectPath(`/admin/products/preview/${id}`)}
                                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium flex items-center gap-2"
                            >
                                <FiEye /> Save & Preview
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate("/admin/products")}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-rustic-deep transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminProductForm;
