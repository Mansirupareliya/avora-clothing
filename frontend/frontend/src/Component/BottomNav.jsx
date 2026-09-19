import { NavLink, useLocation } from "react-router-dom";
import { FiHome, FiSearch, FiHeart, FiShoppingBag, FiUser } from "react-icons/fi";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";

export default function BottomNav() {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const itemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-medium transition ${
      isActive ? "text-[var(--primary)]" : "text-[var(--muted)]"
    }`;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <NavLink to="/store" end className={itemClass}>
        <FiHome size={19} />
        <span>Home</span>
      </NavLink>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("avora:toggle-search"))}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-medium text-[var(--muted)] transition"
      >
        <FiSearch size={19} />
        <span>Search</span>
      </button>

      <NavLink
        to={user ? "/store/account" : "/store/login"}
        state={user ? { section: "wishlist" } : { from: location }}
        className={itemClass}
      >
        <FiHeart size={19} />
        <span>Wishlist</span>
      </NavLink>

      <NavLink
        to={user ? "/cart" : "/store/login"}
        state={user ? undefined : { from: location }}
        className={itemClass}
      >
        <span className="relative">
          <FiShoppingBag size={19} />
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute", top: -6, right: -8,
                background: "var(--accent)", color: "#fff",
                fontSize: 9, fontWeight: 700, borderRadius: 99,
                minWidth: 14, height: 14, display: "flex",
                alignItems: "center", justifyContent: "center", padding: "0 3px",
              }}
            >
              {cartCount}
            </span>
          )}
        </span>
        <span>Bag</span>
      </NavLink>

      <NavLink to={user ? "/store/account" : "/store/login"} className={itemClass}>
        <FiUser size={19} />
        <span>Account</span>
      </NavLink>
    </nav>
  );
}
