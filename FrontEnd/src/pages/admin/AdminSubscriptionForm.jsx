import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiPlus, FiX, FiSave, FiEye } from "react-icons/fi";

const API_BASE_URL = "http://localhost:3000/api";

function AdminSubscriptionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        type: "",
        description: "",
        image: "",
    });

    const [features, setFeatures] = useState([""]);
    const [loading, setLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState("/admin/subscriptions");

    useEffect(() => {
        if (isEdit) {
            fetchSubscription();
        }
    }, [id]);

    const fetchSubscription = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`);
            const data = await res.json();

            setFormData({
                name: data.name,
                price: data.price,
                type: data.type,
                description: data.description || "",
                image: data.image || "",
            });

            setFeatures(data.features?.length ? data.features : [""]);
        } catch (error) {
            console.error("Error fetching subscription:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            features: features.filter((f) => f.trim() !== ""),
        };

        try {
            const url = isEdit ? `${API_BASE_URL}/subscriptions/${id}` : `${API_BASE_URL}/subscriptions`;
            const method = isEdit ? "PUT" : "POST";
            const token = getToken();

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save subscription");

            navigate(redirectPath);
        } catch (error) {
            console.error("Error saving subscription:", error);
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

        const uploadData = new FormData();
        uploadData.append('type', 'subscriptions');
        uploadData.append('image', file);

        setUploading(true);
        try {
            const token = getToken();
            const res = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFormData({ ...formData, image: data.filePath });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-rustic-deep py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold text-rustic-charcoal dark:text-white mb-8">
                    {isEdit ? "Edit Subscription" : "Add New Subscription"}
                </h1>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-rustic-mud rounded-xl shadow-lg p-4 sm:p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subscription Name *
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
                                Type *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                placeholder="e.g. Veggie Box"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Price *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="e.g. LKR 2,500"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rustic-clay dark:bg-rustic-deep dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Subscription Image
                        </label>

                        <div className="flex flex-wrap items-start gap-4">
                            <div className="flex-1 min-w-[200px]">
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
                                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative bg-gray-100 shrink-0">
                                    <img
                                        src={formData.image.startsWith('http') ? formData.image : `http://localhost:3000${formData.image}`}
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
                            Description
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
                                What is included
                            </label>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-1 text-sm text-rustic-clay hover:text-rustic-earth"
                            >
                                <FiPlus /> Add Item
                            </button>
                        </div>
                        <div className="space-y-2">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        placeholder="e.g. 100% Organic certified"
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

                    {/* Submit */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={() => setRedirectPath("/admin/subscriptions")}
                            className="flex items-center gap-2 px-4 py-2 bg-rustic-clay text-white rounded-lg hover:bg-rustic-earth transition-colors font-medium disabled:opacity-50"
                        >
                            <FiSave /> {loading ? "Saving..." : isEdit ? "Update Subscription" : "Create Subscription"}
                        </button>
                        {isEdit && (
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={() => setRedirectPath(`/admin/subscriptions/preview/${id}`)}
                                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium flex items-center gap-2"
                            >
                                <FiEye /> Save & Preview
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate("/admin/subscriptions")}
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

export default AdminSubscriptionForm;
