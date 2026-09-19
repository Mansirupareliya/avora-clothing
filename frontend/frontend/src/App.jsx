import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home"
import Products from "./product";
import Store from "./Store";
import ProductDetail from "./ProductDetail";
import StoreLayout from "./StoreLayout";
import CartLayout from "./CartLayout";
import AdminLayout from "./Component/AdminLayout";
import ProtectedAdminRoute from "./Component/ProtectedAdminRoute";
import { CartProvider } from "./Context/CartContext";
import { AuthProvider } from "./Context/AuthContext";
import { AdminAuthProvider } from "./Context/AdminAuthContext";
import { ADMIN_BASE } from "./adminConfig";
import Cart from "./Pages/Cart";
import About from "./Pages/About";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Contact from "./Pages/Contact";
import CustomerCare from "./Pages/CustomerCare";
import AccountDashboard from "./Pages/AccountDashboard";
import AdminReviews from "./Pages/AdminReviews";
import LiveProductEditor from "./Pages/LiveProductEditor";
import WebsiteDashboard from "./Pages/WebsiteDashboard";
import AdminOrders from "./Pages/AdminOrders";
import AdminCredits from "./Pages/AdminCredits";
import AdminCoupons from "./Pages/AdminCoupons";
import AdminLogin from "./Pages/AdminLogin";
import OrderTrackingPage from "./Pages/OrderTrackingPage";
import CourierDeliveryPage from "./Pages/CourierDeliveryPage";

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <Routes>
            {/* Storefront is the public home page */}
            <Route path="/" element={<Navigate to="/store" replace />} />
            <Route path="/store" element={<StoreLayout />}>
              <Route index element={<Store />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="customercare" element={<CustomerCare />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="account" element={<AccountDashboard />} />
              <Route path="track-order" element={<OrderTrackingPage />} />
              <Route path="courier-delivery" element={<CourierDeliveryPage />} />
              <Route path=":productId" element={<ProductDetail />} />
            </Route>

            <Route path="/cart" element={<CartLayout />}>
              <Route index element={<Cart />} />
            </Route>

            {/* Admin panel lives behind an unguessable path and a login gate */}
            <Route path={`${ADMIN_BASE}/login`} element={<AdminLogin />} />
            <Route path={ADMIN_BASE} element={<ProtectedAdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="credits" element={<AdminCredits />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="inventory" element={<LiveProductEditor />} />
                <Route path="web-dashboard" element={<WebsiteDashboard />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/store" replace />} />
          </Routes>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
