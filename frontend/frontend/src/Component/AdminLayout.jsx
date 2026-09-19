import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <main className="ml-72 flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
