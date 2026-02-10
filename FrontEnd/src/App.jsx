import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// PWA Components
import InstallPrompt from "./components/InstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import UpdateNotification from "./components/UpdateNotification";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Workshops from "./pages/Workshops";
import WorkshopDetails from "./pages/WorkshopDetails";
import About from "./pages/About";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionDetails from "./pages/SubscriptionDetails";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminEventForm from "./pages/admin/AdminEventForm";
import AdminEventBookings from "./pages/admin/AdminEventBookings";
import AdminWorkshops from "./pages/admin/AdminWorkshops";
import AdminWorkshopForm from "./pages/admin/AdminWorkshopForm";
import AdminWorkshopBookings from "./pages/admin/AdminWorkshopBookings";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminSubscriptionForm from "./pages/admin/AdminSubscriptionForm";
import AdminSubscriptionSubscribers from "./pages/admin/AdminSubscriptionSubscribers";
import AdminOrders from "./pages/admin/AdminOrders";

// Component to redirect admins away from customer pages
function CustomerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
      </div>
    );
  }

  // If user is admin, redirect to admin dashboard
  if (user && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 font-sans">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Public/Customer Routes - Admins redirected to /admin */}
          <Route
            path="/"
            element={
              <CustomerRoute>
                <Home />
              </CustomerRoute>
            }
          />
          <Route
            path="/about"
            element={
              <CustomerRoute>
                <About />
              </CustomerRoute>
            }
          />
          <Route
            path="/products"
            element={
              <CustomerRoute>
                <Products />
              </CustomerRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <CustomerRoute>
                <ProductDetails />
              </CustomerRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <CustomerRoute>
                <Subscriptions />
              </CustomerRoute>
            }
          />
          <Route
            path="/subscriptions/:id"
            element={
              <CustomerRoute>
                <SubscriptionDetails />
              </CustomerRoute>
            }
          />
          <Route
            path="/events"
            element={
              <CustomerRoute>
                <Events />
              </CustomerRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <CustomerRoute>
                <EventDetails />
              </CustomerRoute>
            }
          />
          <Route
            path="/workshops"
            element={
              <CustomerRoute>
                <Workshops />
              </CustomerRoute>
            }
          />
          <Route
            path="/workshops/:id"
            element={
              <CustomerRoute>
                <WorkshopDetails />
              </CustomerRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerRoute>
                <Checkout />
              </CustomerRoute>
            }
          />

          {/* Auth Route */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/preview/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ProductDetails adminPreview={true} />
              </ProtectedRoute>
            }
          />

          {/* Admin Orders Route */}
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* Admin Events Routes */}
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/add"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/edit/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/bookings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEventBookings />
              </ProtectedRoute>
            }
          />

          {/* Admin Workshops Routes */}
          <Route
            path="/admin/workshops"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminWorkshops />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workshops/add"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminWorkshopForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/preview/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EventDetails adminPreview={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workshops/edit/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminWorkshopForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workshops/preview/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <WorkshopDetails adminPreview={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workshops/:id/bookings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminWorkshopBookings />
              </ProtectedRoute>
            }
          />

          {/* Admin Subscriptions Routes */}
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSubscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions/add"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSubscriptionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions/edit/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSubscriptionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions/:id/subscribers"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSubscriptionSubscribers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions/preview/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <SubscriptionDetails adminPreview={true} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
      <UpdateNotification />
    </div>
  );
}

export default App;
