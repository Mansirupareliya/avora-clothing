import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function PublicHeader() {
  const [searchActive, setSearchActive] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  const { cartCount } = useCart();

  const tabs = ["Home", "Shirts", "Plan Shirts", "Box Shirt"];

  return (
    <header className="bg-[var(--surface)] sticky top-0 z-50 shadow-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo-thewise.svg" alt="AVORA" className="w-8 h-8" />
            <div className="hidden sm:block">
              <h6 className="logo-text  font-bold text-[var(--primary)]">AVORA</h6>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium transition ${
                  activeTab === tab
                    ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                    : "text-[var(--text)] hover:text-[var(--primary)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="hidden md:flex flex-1 min-w-0 relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-xs md:text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
              onFocus={() => setSearchActive(true)}
              onBlur={() => setSearchActive(false)}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] transition text-sm">
              🔍
            </button>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="text-lg hover:text-[var(--accent)] transition">👤</button>
            <Link
              to="/cart"
              className="relative text-lg hover:text-[var(--accent)] transition"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-[var(--surface)] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/"
              className="hidden lg:block px-2 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--surface)] text-xs font-bold hover:shadow-lg transition whitespace-nowrap"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
