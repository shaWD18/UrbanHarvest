import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { FiSave, FiArrowLeft, FiPlus, FiX, FiEye } from "react-icons/fi";

const API_BASE_URL = "https://urbanharvest-production.up.railway.app/api";

function AdminEventForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const { refreshData } = useAppContext();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        price: "",
        category: "",
        image: "",
        slots: "50",
    });

    const [highlights, setHighlights] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState("/admin/events");
    const [hasLoaded, setHasLoaded] = useState(false); // Add loaded flag

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/events/${id}`);
            if (!response.ok) throw new Error("Failed to fetch event");
            const data = await response.json();

            // Format date for input: YYYY-MM-DD
            const rawDate = new Date(data.date);
            const formattedDate = !isNaN(rawDate) ? rawDate.toISOString().split("T")[0] : "";

            // Handle price: numerical for input
            let formattedPrice = "";
            if (data.price !== undefined && data.price !== null) {
                // If it's already a number or a numeric string, use it
                const numPrice = parseFloat(data.price);
                formattedPrice = isNaN(numPrice) ? "" : numPrice;
            }

            setFormData({
                title: data.title || "",
                description: data.description || "",
                date: formattedDate,
                location: data.location || "",
                price: formattedPrice,
                category: data.category || "",
                image: data.image || "",
                slots: data.slots || "50",
            });
            setHighlights(data.highlights || []);
            setAgenda(data.agenda || []);
            setSpeakers(data.speakers || []);
            setHasLoaded(true);
        } catch (error) {
            console.error("Error fetching event:", error);
            // toast.error("Failed to load event details"); // Assuming toast is available
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isEdit && id && !hasLoaded) { // Only fetch if editing and not already loaded
            fetchEvent();
        }
    }, [id, isEdit, hasLoaded]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            slots: parseInt(formData.slots),
            highlights: highlights.filter(h => h.trim() !== ""),
            agenda: agenda.filter(a => a.time.trim() !== "" && a.activity.trim() !== ""),
            speakers: speakers.filter(s => s.name.trim() !== ""),
        };

        try {
            const url = isEdit ? `${API_BASE_URL}/events/${id}` : `${API_BASE_URL}/events`;
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

            await refreshData();
            navigate(redirectPath);
        } catch (error) {
            console.error("Error saving event:", error);
            setLoading(false);
        }
    };

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e, field, index = null) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        const type = field === 'speaker' ? 'speakers' : 'events';
        uploadData.append('type', type);
        uploadData.append('image', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://urbanharvest-production.up.railway.app/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();

            if (field === 'main') {
                setFormData({ ...formData, image: data.filePath });
            } else if (field === 'speaker' && index !== null) {
                updateSpeaker(index, "image", data.filePath);
            }

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const addHighlight = () => setHighlights([...highlights, ""]);
    const removeHighlight = (index) => setHighlights(highlights.filter((_, i) => i !== index));
    const updateHighlight = (index, value) => {
        const updated = [...highlights];
        updated[index] = value;
        setHighlights(updated);
    };

    const addAgendaItem = () => setAgenda([...agenda, { time: "", activity: "" }]);
    const removeAgendaItem = (index) => setAgenda(agenda.filter((_, i) => i !== index));
    const updateAgendaItem = (index, field, value) => {
        const updated = [...agenda];
        updated[index][field] = value;
        setAgenda(updated);
    };

    const addSpeaker = () => setSpeakers([...speakers, { name: "", role: "", image: "" }]);
    const removeSpeaker = (index) => setSpeakers(speakers.filter((_, i) => i !== index));
    const updateSpeaker = (index, field, value) => {
        const updated = [...speakers];
        updated[index][field] = value;
        setSpeakers(updated);
    };

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-charcoal py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <Link
                    to="/admin/events"
                    className="inline-flex items-center gap-2 text-rustic-clay hover:text-rustic-earth mb-6 font-medium transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Events
                </Link>

                <div className="card-premium p-4 sm:p-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">
                        {isEdit ? "Edit Event" : "Add New Event"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-premium"
                                    placeholder="e.g., Urban Farming Workshop"
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-premium"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Community">Community</option>
                                    <option value="Education">Education</option>
                                    <option value="Volunteering">Volunteering</option>
                                    <option value="Networking">Networking</option>
                                    <option value="Wellness">Wellness</option>
                                    <option value="Lifestyle">Lifestyle</option>
                                    <option value="Expo">Expo</option>
                                    <option value="Farming">Farming</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="input-premium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="input-premium"
                                    placeholder="e.g., Colombo Community Center"
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Price (LKR) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onWheel={(e) => e.target.blur()}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || parseFloat(value) >= 0) {
                                            setFormData({ ...formData, price: value });
                                        }
                                    }}
                                    className="input-premium"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Available Slots *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.slots}
                                    onChange={(e) => setFormData({ ...formData, slots: e.target.value })}
                                    className="input-premium"
                                    placeholder="50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Event Image
                                </label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'main')}
                                        className="w-full text-sm text-gray-500 dark:text-gray-400
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-rustic-green file:text-white
                                          hover:file:bg-rustic-deep"
                                    />
                                    {formData.image && (
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative bg-gray-100">
                                            <img
                                                src={formData.image.startsWith('http') ? formData.image : `https://urbanharvest-production.up.railway.app${formData.image}`}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Description *
                            </label>
                            <textarea
                                required
                                rows="6"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-premium"
                                placeholder="Describe the event, what attendees can expect, and any important details..."
                                maxLength={500}
                            />
                            <p className="text-right text-xs text-gray-500 mt-1">
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        {/* Highlights Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Event Highlights
                                </label>
                                <button
                                    type="button"
                                    onClick={addHighlight}
                                    className="flex items-center gap-1 text-sm text-rustic-green hover:text-rustic-moss font-medium"
                                >
                                    <FiPlus /> Add Highlight
                                </button>
                            </div>
                            <div className="space-y-2">
                                {highlights.map((highlight, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={highlight}
                                            onChange={(e) => updateHighlight(index, e.target.value)}
                                            placeholder="e.g., Hands-on learning experience"
                                            className="input-premium flex-1 min-w-0"
                                            maxLength={100}
                                        />
                                        {highlights.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeHighlight(index)}
                                                className="shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Agenda Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Event Agenda
                                </label>
                                <button
                                    type="button"
                                    onClick={addAgendaItem}
                                    className="flex items-center gap-1 text-sm text-rustic-earth hover:text-rustic-clay font-medium"
                                >
                                    <FiPlus /> Add Item
                                </button>
                            </div>
                            <div className="space-y-2">
                                {agenda.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={item.time}
                                            onChange={(e) => updateAgendaItem(index, "time", e.target.value)}
                                            placeholder="Time"
                                            className="input-premium w-full sm:w-1/3"
                                            maxLength={50}
                                        />
                                        <div className="flex flex-1 gap-2">
                                            <input
                                                type="text"
                                                value={item.activity}
                                                onChange={(e) => updateAgendaItem(index, "activity", e.target.value)}
                                                placeholder="Activity"
                                                className="input-premium flex-1 min-w-0"
                                                maxLength={700}
                                            />
                                            {agenda.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeAgendaItem(index)}
                                                    className="shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <FiX className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Speakers Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Event Speakers
                                </label>
                                <button
                                    type="button"
                                    onClick={addSpeaker}
                                    className="flex items-center gap-1 text-sm text-rustic-earth hover:text-rustic-clay font-medium"
                                >
                                    <FiPlus /> Add Speaker
                                </button>
                            </div>
                            <div className="space-y-4">
                                {speakers.map((speaker, index) => (
                                    <div key={index} className="flex flex-col gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Speaker {index + 1}</h4>
                                            {speakers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpeaker(index)}
                                                    className="text-red-600 hover:text-red-700 p-1"
                                                >
                                                    <FiX />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={speaker.name}
                                                onChange={(e) => updateSpeaker(index, "name", e.target.value)}
                                                placeholder="Speaker Name"
                                                className="input-premium"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="text"
                                                    value={speaker.role}
                                                    onChange={(e) => updateSpeaker(index, "role", e.target.value)}
                                                    placeholder="Role / Title"
                                                    className="input-premium"
                                                    maxLength={100}
                                                />
                                                <p className="text-[10px] text-right text-gray-400">
                                                    {(speaker.role || "").length}/100 characters
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs text-gray-500">Speaker Photo</label>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, 'speaker', index)}
                                                        className="text-xs flex-1 min-w-[200px]"
                                                    />
                                                    {speaker.image && (
                                                        <div className="shrink-0">
                                                            <img
                                                                src={speaker.image.startsWith('http') ? speaker.image : `https://urbanharvest-production.up.railway.app${speaker.image}`}
                                                                alt="Speaker"
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={() => setRedirectPath("/admin/events")}
                                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
                            >
                                <FiSave />
                                {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
                            </button>
                            {isEdit && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    onClick={() => setRedirectPath(`/admin/events/preview/${id}`)}
                                    className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium flex items-center gap-2"
                                >
                                    <FiEye /> Save & Preview
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => navigate("/admin/events")}
                                className="px-4 py-2 text-sm border-2 border-gray-300 dark:border-rustic-ash text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-rustic-slate transition-all font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminEventForm;
