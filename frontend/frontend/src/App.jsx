import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Component/Sidebar";
import Home from "./pages/Home";
import Products from "./product";
import Store from "./Store";

function App() {
  const location = useLocation();
  const isPublicRoute = location.pathname === "/store";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {!isPublicRoute && <Sidebar />}

      <main className={isPublicRoute ? "w-full" : "ml-72 flex-1 px-4 py-6 md:px-8"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/store" element={<Store />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;