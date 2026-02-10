import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiSave, FiArrowLeft, FiPlus, FiX, FiEye } from "react-icons/fi";

const API_BASE_URL = "https://urbanharvest-production.up.railway.app/api";

function AdminWorkshopForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        duration: "",
        location: "",
        price: "",
        slots: "",
        category: "",
        image: "",
    });

    const [outcomes, setOutcomes] = useState([""]);
    const [agenda, setAgenda] = useState([{ time: "", activity: "" }]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [redirectPath, setRedirectPath] = useState("/admin/workshops");

    // Instructor Modal State
    const [showInstructorModal, setShowInstructorModal] = useState(false);
    const [instructorForm, setInstructorForm] = useState({
        name: "",
        email: "",
        bio: "",
        image: ""
    });
    const [instructorUploading, setInstructorUploading] = useState(false);
    const [instructorSaving, setInstructorSaving] = useState(false);

    useEffect(() => {
        fetchInstructors();
        if (isEdit) {
            fetchWorkshop();
        }
    }, [id, isEdit]);

    const fetchInstructors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/instructors`);
            const data = await res.json();
            setInstructors(data);
        } catch (error) {
            console.error("Error fetching instructors:", error);
        }
    };

    const fetchWorkshop = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/workshops/${id}`);
            const data = await res.json();

            // Format date to yyyy-MM-dd for input[type="date"]
            const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : "";

            // Handle price - extract number from string like "LKR 5,000"
            let formattedPrice = "";
            if (data.price) {
                const priceStr = String(data.price).replace(/[^0-9.]/g, '');
                const numPrice = parseFloat(priceStr);
                formattedPrice = isNaN(numPrice) ? "" : numPrice;
            }

            setFormData({
                title: data.title || "",
                description: data.description || "",
                date: formattedDate,
                duration: data.duration || "",
                location: data.location || "",
                price: formattedPrice,
                slots: data.slots || "",
                category: data.category || "",
                image: data.image || "",
                instructor_id: data.instructor?.id || "",
            });

            setOutcomes(data.learningOutcomes?.length ? data.learningOutcomes : (data.outcomes?.length ? data.outcomes : [""]));
            setAgenda(data.agenda?.length ? data.agenda : [{ time: "", activity: "" }]);
        } catch (error) {
            console.error("Error fetching workshop:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            slots: parseInt(formData.slots),
            instructor_id: formData.instructor_id ? parseInt(formData.instructor_id) : null,
            outcomes: outcomes.filter(o => o.trim() !== ""),
            agenda: agenda.filter(a => a.time.trim() !== "" && a.activity.trim() !== ""),
        };

        try {
            const url = isEdit ? `${API_BASE_URL}/workshops/${id}` : `${API_BASE_URL}/workshops`;
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
            console.error("Error saving workshop:", error);
            setLoading(false);
        }
    };

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('type', 'workshops');
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
            setFormData({ ...formData, image: data.filePath });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const addOutcome = () => setOutcomes([...outcomes, ""]);
    const removeOutcome = (index) => setOutcomes(outcomes.filter((_, i) => i !== index));
    const updateOutcome = (index, value) => {
        const updated = [...outcomes];
        updated[index] = value;
        setOutcomes(updated);
    };

    const addAgendaItem = () => setAgenda([...agenda, { time: "", activity: "" }]);
    const removeAgendaItem = (index) => setAgenda(agenda.filter((_, i) => i !== index));
    const updateAgendaItem = (index, field, value) => {
        const updated = [...agenda];
        updated[index][field] = value;
        setAgenda(updated);
    };

    const handleInstructorImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('type', 'instructors');
        uploadData.append('image', file);

        setInstructorUploading(true);
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
            setInstructorForm({ ...instructorForm, image: data.filePath });
        } catch (error) {
            console.error('Error uploading instructor image:', error);
            alert('Failed to upload image');
        } finally {
            setInstructorUploading(false);
        }
    };

    const handleInstructorSubmit = async (e) => {
        e.preventDefault();
        if (!instructorForm.name) return;

        setInstructorSaving(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/instructors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(instructorForm)
            });

            if (!res.ok) throw new Error('Failed to save instructor');

            const data = await res.json();

            // Re-fetch all instructors
            await fetchInstructors();

            // Select the new instructor
            setFormData(prev => ({ ...prev, instructor_id: data.id }));

            // Close modal and reset form
            setShowInstructorModal(false);
            setInstructorForm({ name: "", email: "", bio: "", image: "" });
        } catch (error) {
            console.error('Error saving instructor:', error);
            alert('Failed to save instructor');
        } finally {
            setInstructorSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-rustic-beige/30 dark:bg-rustic-charcoal py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <Link
                    to="/admin/workshops"
                    className="inline-flex items-center gap-2 text-rustic-clay hover:text-rustic-earth mb-6 font-medium transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Workshops
                </Link>

                <div className="card-premium p-4 sm:p-8">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">
                        {isEdit ? "Edit Workshop" : "Add New Workshop"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Workshop Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-premium"
                                    placeholder="e.g., Composting Basics"
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
                                    <option value="Farming">Farming</option>
                                    <option value="Gardening">Gardening</option>
                                    <option value="DIY">DIY</option>
                                    <option value="Cooking">Cooking</option>
                                    <option value="Wellness">Wellness</option>
                                    <option value="Sustainability">Sustainability</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Instructor
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowInstructorModal(true)}
                                        className="text-xs text-rustic-earth hover:text-rustic-clay font-medium flex items-center gap-1"
                                    >
                                        <FiPlus /> New Instructor
                                    </button>
                                </div>
                                <select
                                    value={formData.instructor_id || ""}
                                    onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                                    className="input-premium"
                                >
                                    <option value="">Select Instructor</option>
                                    {instructors.map((inst) => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.name}
                                        </option>
                                    ))}
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
                                    Duration *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="input-premium"
                                    placeholder="e.g., 3 hours, 2 days"
                                    maxLength={50}
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
                                    onWheel={(e) => e.target.blur()}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || parseInt(value) >= 0) {
                                            setFormData({ ...formData, slots: value });
                                        }
                                    }}
                                    className="input-premium"
                                    placeholder="e.g. 20"
                                />
                            </div>


                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Workshop Image
                                </label>
                                <div className="flex flex-wrap items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full text-sm text-gray-500 dark:text-gray-400
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-rustic-clay file:text-white
                                          hover:file:bg-rustic-earth
                                          flex-1 min-w-[200px]"
                                    />
                                    {formData.image && (
                                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative bg-gray-100 shrink-0">
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
                                placeholder="Describe the workshop, what participants will learn, and any prerequisites..."
                                maxLength={500}
                            />
                            <p className="text-right text-xs text-gray-500 mt-1">
                                {formData.description.length}/500 characters
                            </p>
                        </div>

                        {/* Learning Outcomes Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Learning Outcomes
                                </label>
                                <button
                                    type="button"
                                    onClick={addOutcome}
                                    className="flex items-center gap-1 text-sm text-rustic-earth hover:text-rustic-clay font-medium"
                                >
                                    <FiPlus /> Add Outcome
                                </button>
                            </div>
                            <div className="space-y-2">
                                {outcomes.map((outcome, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={outcome}
                                            onChange={(e) => updateOutcome(index, e.target.value)}
                                            placeholder="e.g., Learn to create nutrient-rich compost"
                                            className="input-premium flex-1 min-w-0"
                                            maxLength={700}
                                        />
                                        {outcomes.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeOutcome(index)}
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
                                    Agenda
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

                        {/* Submit Buttons */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={() => setRedirectPath("/admin/workshops")}
                                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
                            >
                                <FiSave />
                                {loading ? "Saving..." : isEdit ? "Update Workshop" : "Create Workshop"}
                            </button>
                            {isEdit && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    onClick={() => setRedirectPath(`/admin/workshops/preview/${id}`)}
                                    className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium flex items-center gap-2"
                                >
                                    <FiEye /> Save & Preview
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => navigate("/admin/workshops")}
                                className="px-4 py-2 text-sm border-2 border-gray-300 dark:border-rustic-ash text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-rustic-slate transition-all font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Add Instructor Modal */}
            {showInstructorModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-rustic-mud rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-rustic-beige/10">
                            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">Add New Instructor</h2>
                            <button
                                onClick={() => setShowInstructorModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleInstructorSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={instructorForm.name}
                                    onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                                    className="input-premium"
                                    placeholder="e.g., Dr. Jane Smith"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={instructorForm.email}
                                    onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                                    className="input-premium"
                                    placeholder="e.g., jane.smith@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Short Bio
                                </label>
                                <textarea
                                    rows="3"
                                    value={instructorForm.bio}
                                    onChange={(e) => setInstructorForm({ ...instructorForm, bio: e.target.value })}
                                    className="input-premium"
                                    placeholder="Expert in organic farming with 10 years experience..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Photo
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleInstructorImageUpload}
                                        className="text-xs flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rustic-clay file:text-white hover:file:bg-rustic-earth"
                                    />
                                    {instructorForm.image && (
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rustic-clay shrink-0">
                                            <img
                                                src={instructorForm.image.startsWith('http') ? instructorForm.image : `https://urbanharvest-production.up.railway.app${instructorForm.image}`}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                                {instructorUploading && <p className="text-[10px] text-amber-600 mt-1">Uploading...</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={instructorSaving || instructorUploading}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm disabled:opacity-50"
                                >
                                    <FiSave />
                                    {instructorSaving ? "Saving..." : "Add Instructor"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInstructorModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminWorkshopForm;
