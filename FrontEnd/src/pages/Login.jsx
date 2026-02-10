import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiUser, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setLoading(true);

        if (isLogin) {
            // LOGIN FLOW
            const result = await login(formData.email, formData.password);
            setLoading(false);

            if (result.success) {
                // Role-based navigation
                const userRole = result.user?.role;
                if (userRole === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            } else {
                setError(result.error);
            }
        } else {
            // SIGNUP FLOW - NO AUTO-LOGIN
            const result = await signup(formData.email, formData.password, formData.name);
            setLoading(false);

            if (result.success) {
                // Clear form and show success message
                setFormData({ email: "", password: "", name: "" });
                setSuccessMessage("Account created successfully! Please login to continue.");

                // Switch to login view after 1 second
                setTimeout(() => {
                    setIsLogin(true);
                    setSuccessMessage("");
                }, 1500);
            } else {
                setError(result.error);
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-rustic-deep">
            {/* Left Side - Image Panel */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 md:hover:scale-105"
                    style={{ backgroundImage: "url('/Images/login-bg.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-12 text-white z-10">
                    <h2 className="text-5xl font-serif font-bold mb-6 tracking-tight drop-shadow-2xl">
                        Reconnect with Nature
                    </h2>
                    <p className="text-xl font-light text-gray-100 max-w-lg drop-shadow-lg leading-relaxed">
                        Experience the serenity of the outdoors. Join our community and discover your next adventure.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-rustic-deep overflow-y-auto">
                <div className="max-w-md w-full space-y-8 animate-fade-in">
                    <div className="text-center lg:text-left">

                        <h2 className="text-3xl font-serif font-bold text-rustic-charcoal dark:text-gray-100 mb-3 tracking-tight">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="text-rustic-moss dark:text-rustic-clay font-medium">
                            {isLogin ? "Please enter your details." : "Join our community today."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="animate-slide-up animation-delay-100">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rustic-green transition-colors" />
                                    <input
                                        type="text"
                                        required={!isLogin}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-premium pl-11 bg-gray-50 dark:bg-rustic-mud/50 border-gray-200 dark:border-rustic-ash"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="animate-slide-up animation-delay-200">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative group">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rustic-green transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-premium pl-11 bg-gray-50 dark:bg-rustic-mud/50 border-gray-200 dark:border-rustic-ash"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="animate-slide-up animation-delay-300">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                {isLogin && (
                                    <button type="button" className="text-sm font-medium text-rustic-green hover:text-rustic-moss">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rustic-green transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-premium pl-11 pr-12 bg-gray-50 dark:bg-rustic-mud/50 border-gray-200 dark:border-rustic-ash"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="animate-scale-in bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="animate-scale-in bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <FiCheckCircle className="flex-shrink-0" />
                                {successMessage}
                            </div>
                        )}

                        <div className="pt-2 animate-slide-up animation-delay-400">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-rustic-green/20"
                            >
                                {loading && (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center animate-slide-up animation-delay-500">
                        <p className="text-gray-600 dark:text-gray-400">
                            {isLogin ? "New to our community?" : "Already have an account?"}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                    setSuccessMessage("");
                                }}
                                className="ml-2 font-bold text-rustic-green hover:text-rustic-moss transition-colors focus:outline-none hover:underline"
                            >
                                {isLogin ? "Join now" : "Log in"}
                            </button>
                        </p>
                    </div>

                    {isLogin && (
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 animate-slide-up animation-delay-500">
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex items-start gap-3">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-md shrink-0">
                                    <FiUser className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-0.5">
                                        Demo Access
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-400 font-mono">
                                        admin@urban.com / admin123
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;
