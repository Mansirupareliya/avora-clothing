import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Component/Sidebar";
import Home from "./Pages/Home"
import Products from "./product";
import Store from "./Store";
import ProductDetail from "./ProductDetail";
import StoreLayout from "./StoreLayout";
import CartLayout from "./CartLayout";
import { CartProvider } from "./Context/CartContext";
import { AuthProvider } from "./Context/AuthContext";
import Cart from "./Pages/Cart";
import About from "./Pages/About";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Contact from "./Pages/Contact";
import CustomerCare from "./Pages/CustomerCare";

function App() {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith("/store") || location.pathname === "/cart";

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
          {!isPublicRoute && <Sidebar />}

          <main className={isPublicRoute ? "w-full" : "ml-72 flex-1 px-4 py-6 md:px-8"}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/store" element={<StoreLayout />}>
                <Route index element={<Store />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="customercare" element={<CustomerCare />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path=":productId" element={<ProductDetail />} />
              </Route>
              <Route path="/cart" element={<CartLayout />}>
                <Route index element={<Cart />} />
              </Route>
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;