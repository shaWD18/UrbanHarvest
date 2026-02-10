import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requireAdmin = false }) {
    const { user, loading } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-rustic-deep">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rustic-green mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Requires admin but user is not admin - redirect to homepage
    if (requireAdmin && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    // User is authorized
    return children;
}

export default ProtectedRoute;
