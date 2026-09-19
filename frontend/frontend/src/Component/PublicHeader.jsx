import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { FiShoppingCart, FiUser, FiPackage, FiHeart, FiLogOut, FiMenu, FiX, FiSearch } from "react-icons/fi";

export default function PublicHeader() {
  const [searchActive, setSearchActive] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();

  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Let the mobile bottom nav's Search tab open this header's search box
  useEffect(() => {
    const openSearch = () => {
      setMobileMenuOpen(false);
      setMobileSearchOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("avora:toggle-search", openSearch);
    return () => window.removeEventListener("avora:toggle-search", openSearch);
  }, []);

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
            🚚 <span className="text-[var(--accent)]">FREE DELIVERY</span> &amp; 25% DISCOUNT ON ₹2000+ SHOPPING! 🎉
          </p>
        </div>
      </div>

      <header className="bg-[var(--surface)] sticky top-0 z-40 shadow-sm border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          {/* Desktop Row */}
          <div className="hidden md:flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/store" style={{ textDecoration: "none" }}>
                <h6 className="logo-text font-bold text-[var(--primary)]" style={{ margin: 0 }}>AVORA</h6>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-6 flex-1 justify-start ml-8">
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
            <div className="flex flex-1 min-w-0 relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] text-xs md:text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] transition flex items-center">
                <FiSearch size={15} />
              </button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Wishlist Icon */}
              <Link
                to={user ? "/store/account" : "/store/login"}
                state={user ? { section: "wishlist" } : { from: location }}
                className="flex items-center justify-center w-9 h-9 rounded-full text-[var(--text)] hover:text-[var(--accent)] hover:bg-[var(--bg)] transition"
                style={{ textDecoration: "none" }}
                aria-label="Wishlist"
              >
                <FiHeart size={18} />
              </Link>

              {/* Cart Icon */}
              <Link
                to={user ? "/cart" : "/store/login"}
                state={user ? undefined : { from: location }}
                className="relative flex items-center justify-center w-9 h-9 rounded-full text-[var(--text)] hover:text-[var(--accent)] hover:bg-[var(--bg)] transition"
                style={{ textDecoration: "none" }}
                aria-label="Cart"
              >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute", top: -2, right: -2,
                      background: "var(--accent)", color: "#fff",
                      fontSize: 10, fontWeight: 700, borderRadius: 99,
                      minWidth: 16, height: 16, display: "flex",
                      alignItems: "center", justifyContent: "center", padding: "0 4px",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm font-semibold hover:text-[var(--accent)] transition"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 24 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--surface)] flex items-center justify-center text-xs shadow-sm" style={{ flexShrink: 0 }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                ) : (
                  <Link
                    to="/store/login"
                    className="flex items-center gap-2 text-sm font-medium hover:text-[var(--accent)] transition"
                    style={{ textDecoration: "none", color: "var(--text)" }}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition">
                      <FiUser size={15} />
                    </div>
                    <span className="block" style={{ fontSize: 13, fontWeight: 600 }}>Login</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {showUserMenu && user && (
                  <div
                    className="absolute right-0 mt-3 w-64 bg-[var(--surface)] border border-[var(--border)] overflow-hidden z-50"
                    style={{ borderRadius: 14, boxShadow: "0 16px 40px rgba(15,23,36,0.16)" }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-3 px-5 py-4"
                      style={{ background: "linear-gradient(135deg, var(--primary), #2f3f5c)" }}
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#fff" }}>{user.name}</p>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.65)" }}>{user.email}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link
                        to="/store/account"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition hover:bg-[var(--bg)]"
                        style={{ color: "var(--text)", textDecoration: "none" }}
                        state={{ section: "orders" }}
                      >
                        <span
                          className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                          style={{ background: "rgba(33,45,67,0.08)", color: "var(--primary)" }}
                        >
                          <FiPackage size={15} />
                        </span>
                        My Orders
                      </Link>

                      <div className="mx-5 my-1 border-t border-[var(--border)]" />

                      <button
                        onClick={() => { logout(); setShowUserMenu(false); }}
                        className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm font-medium transition hover:bg-red-50"
                        style={{ color: "#ef4444" }}
                      >
                        <span
                          className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                          style={{ background: "rgba(239,68,68,0.08)" }}
                        >
                          <FiLogOut size={15} />
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Mobile Row: hamburger — centered logo — search + cart */}
          <div className="flex md:hidden items-center justify-between gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen((v) => !v);
                setMobileSearchOpen(false);
              }}
              className="flex items-center justify-center w-9 h-9 flex-shrink-0 text-[var(--text)] hover:text-[var(--primary)] transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            <Link to="/store" className="flex-1 text-center min-w-0" style={{ textDecoration: "none" }}>
              <h6 className="logo-text font-bold text-[var(--primary)] truncate" style={{ margin: 0 }}>AVORA</h6>
            </Link>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setMobileSearchOpen((v) => !v);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-9 h-9 text-[var(--text)] hover:text-[var(--primary)] transition"
                aria-label="Search"
              >
                <FiSearch size={19} />
              </button>

              <Link
                to={user ? "/cart" : "/store/login"}
                state={user ? undefined : { from: location }}
                className="relative flex items-center justify-center w-9 h-9 text-[var(--text)] hover:text-[var(--primary)] transition"
                style={{ textDecoration: "none" }}
                aria-label="Cart"
              >
                <FiShoppingCart size={19} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute", top: 2, right: 2,
                      background: "var(--accent)", color: "#fff",
                      fontSize: 10, fontWeight: 700, borderRadius: 99,
                      minWidth: 16, height: 16, display: "flex",
                      alignItems: "center", justifyContent: "center", padding: "0 4px",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search (collapsible) */}
          {mobileSearchOpen && (
            <div className="md:hidden mt-3 relative">
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted)]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] transition flex items-center">
                <FiSearch size={15} />
              </button>
            </div>
          )}

          {/* Mobile Menu (hamburger — site navigation) */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-[var(--border)] pt-4">
              <div className="space-y-3">
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

              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
                <Link
                  to={user ? "/store/account" : "/store/login"}
                  state={user ? { section: "wishlist" } : { from: location }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-medium text-[var(--text)] hover:text-[var(--primary)] transition"
                  style={{ textDecoration: "none" }}
                >
                  <FiHeart size={16} /> Wishlist
                </Link>

                {user ? (
                  <>
                    <Link
                      to="/store/account"
                      state={{ section: "orders" }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium text-[var(--text)] hover:text-[var(--primary)] transition"
                      style={{ textDecoration: "none" }}
                    >
                      <FiPackage size={16} /> My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 text-sm font-medium text-red-500"
                    >
                      <FiLogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/store/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-[var(--text)] hover:text-[var(--primary)] transition"
                    style={{ textDecoration: "none" }}
                  >
                    <FiUser size={16} /> Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
