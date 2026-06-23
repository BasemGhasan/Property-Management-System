// ============================================================================
// OwnerLayout — sidebar + top nav shell for the Property Owner Module.
// Mirrors DashboardLayout's responsive pattern with the owner nav items.
// ============================================================================

// Imports
import { useState, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { Building2, Bell, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { OWNER_NAV } from "../constants/owner";
import { ROUTES } from "../constants/auth";
import { getStoredUser } from "../lib/auth";

// Interfaces
interface OwnerLayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

// ============================================================================
// SidebarContent
// ============================================================================
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const go = useCallback(
    (to: string) => { navigate(to); onNavigate?.(); },
    [navigate, onNavigate]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Building2 size={20} />
        </span>
        <div>
          <p className="text-slate-100 leading-none">PropCare</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">Owner Portal</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {OWNER_NAV.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.to ||
            (item.to !== OWNER_NAV[0].to && location.pathname.startsWith(item.to));
          return (
            <button
              key={item.to}
              onClick={() => go(item.to)}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-blue-600/15 text-blue-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
              ].join(" ")}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-3">
        <button
          onClick={() => go(ROUTES.login)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// OwnerLayout
// ============================================================================
export function OwnerLayout({ title, actions, children }: OwnerLayoutProps) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const user = getStoredUser();
  const displayName = user?.fullName ?? "Owner";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-800/30 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-slate-800 bg-slate-900">
            <button onClick={closeDrawer} aria-label="Close menu" className="absolute right-3 top-4 text-slate-400 hover:text-slate-200">
              <X size={20} />
            </button>
            <SidebarContent onNavigate={closeDrawer} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top nav */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="text-slate-100">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button aria-label="Notifications" className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200">
              <Bell size={19} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <button
              onClick={() => navigate("/owner/profile")}
              className="flex items-center gap-2 rounded-xl border border-slate-800 px-2 py-1.5 transition-colors hover:bg-slate-800"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs text-white">{initials}</span>
              <span className="hidden text-sm text-slate-300 sm:block">{displayName}</span>
              <ChevronDown size={15} className="hidden text-slate-500 sm:block" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {actions && <div className="mb-5 flex flex-wrap gap-3">{actions}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
