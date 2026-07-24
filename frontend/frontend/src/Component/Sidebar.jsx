import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3  transition text-sm font-medium ${
      isActive
        ? "bg-[var(--primary)] text-[var(--surface)] shadow-[0_8px_16px_-8px_rgba(33,45,67,0.45)]"
        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--primary)]"
    }`;

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-[var(--primary)] border-r border-[var(--border)] text-[var(--surface)] shadow-2xl">
      {/* Branding Section */}
      <div className="p-3 border-b border-[var(--border)]">
        
        <div className="mt-3 flex items-center gap-3">
          <img src="/logo-thewise.svg" alt="AVORA logo" className="w-10 h-10" />
          <div>
            <h6 className="logo-text text-base font-semibold tracking-wide text-[var(--surface)]">
              AVORA
            </h6>
            <p className="text-[11px] text-[var(--muted)]">Men's wear</p>
          </div>
        </div>
        
      </div>

      {/* Navigation */}
      <nav className="px-3 mt-6 space-y-1">
        <NavLink to="/" end className={menuClass}>
          <span className="text-base">🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/products" className={menuClass}>
          <span className="text-base">📦</span>
          <span>Listed Products</span>
        </NavLink>

        <NavLink to="/admin/orders" className={menuClass}>
          <span className="text-base">🛒</span>
          <span>Customer Orders</span>
        </NavLink>

        <NavLink to="/admin/credits" className={menuClass}>
          <span className="text-base">🎁</span>
          <span>Shopping Credits</span>
        </NavLink>

        <NavLink to="/inventory" className={menuClass}>
          <span className="text-base">⚡</span>
          <span>Live Price &amp; Editor</span>
        </NavLink>

        <NavLink to="/web-dashboard" className={menuClass}>
          <span className="text-base">🌐</span>
          <span>Website Dashboard</span>
        </NavLink>

        <NavLink to="/reviews" className={menuClass}>
          <span className="text-base">💬</span>
          <span>Reviews &amp; Comments</span>
        </NavLink>

        <a
          href="/store"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 transition text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--primary)]"
        >
          <span className="text-base">🛍️</span>
          <span>View Store Front ↗</span>
        </a>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)]">
        <p className="text-[11px] text-[var(--muted)] text-center font-light">
          v 1.0 • AVORA
        </p>
      </div>
    </aside>
  );
}