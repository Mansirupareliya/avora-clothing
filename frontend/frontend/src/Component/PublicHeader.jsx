import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { FiShoppingCart, FiUser } from "react-icons/fi";

export default function PublicHeader() {
  const [searchActive, setSearchActive] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Home", path: "/store" },
    { label: "Shirts", path: "/store" },
    { label: "Customer Care", path: "/store/customercare" },
    { label: "About Us", path: "/store/about" },
    { label: "Contact Us", path: "/store/contact" }
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[var(--primary)] text-[var(--surface)] text-xs font-semibold py-2 overflow-hidden relative z-50 flex items-center h-8">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 25s linear infinite;
            will-change: transform;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="w-full">
          <p className="animate-marquee tracking-wider">
            🚚 <span className="text-[var(--accent)]">FREE DELIVERY</span> & 25% DISCOUNT ON ₹2000+ SHOPPING! 🎉
          </p>
        </div>
      </div>

      <header className="bg-[var(--surface)] sticky top-0 z-40 shadow-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 flex-shrink-0">

              <div className="hidden sm:block">
                <h6 className="logo-text font-bold text-[var(--primary)]">AVORA</h6>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-start ml-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setActiveTab(item.label)}
                  className={`text-sm font-medium transition ${activeTab === item.label
                    ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                    : "text-[var(--text)] hover:text-[var(--primary)]"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 min-w-0 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2  border border-[var(--border)] bg-[var(--bg)] text-xs md:text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] transition text-sm">
                🔍
              </button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-2xl text-[var(--text)] hover:text-[var(--primary)] transition"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </button>

              {/* User Menu */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm font-semibold hover:text-[var(--accent)] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--surface)] flex items-center justify-center text-xs shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                ) : (
                  <Link to="/store/login" className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition">
                    <FiUser className="w-4 h-4" />
                  </Link>
                )}

                {/* Dropdown Menu */}
                {showUserMenu && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)]  shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm font-semibold text-[var(--text)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-[var(--accent)] hover:bg-[var(--bg)] font-medium transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              <Link
                to="/cart"
                className="relative flex items-center justify-center text-[var(--text)] hover:text-[var(--accent)] transition"
              >
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-[var(--surface)] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-[var(--border)] pt-4">
              <div className="space-y-3 mb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => {
                      setActiveTab(item.label);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left text-sm font-medium transition py-2 ${activeTab === item.label
                      ? "text-[var(--primary)] font-semibold"
                      : "text-[var(--text)] hover:text-[var(--primary)]"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-3 py-2  border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] transition text-sm">
                  🔍
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
