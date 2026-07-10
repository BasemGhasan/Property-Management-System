// ============================================================================
// PortalLayout — shared sidebar + top nav shell for the Admin, Owner, and
// Resident modules. Portal-specific accent color, brand, and nav items are
// supplied via props; the color itself comes from the [data-portal] CSS
// scope in src/styles/theme.css, so this component only needs to know which
// portal it is.
// ============================================================================

// Imports
import { useState, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { LogOut, Menu, X, ChevronDown, type LucideIcon } from "lucide-react";
import { ROUTES } from "../constants/auth";
import { getStoredUser } from "../lib/auth";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "../components/shared/pullToRefreshIndicator";
import { EmailVerificationBanner } from "../components/shared/emailVerificationBanner";
import { NotificationBell } from "../components/shared/notificationBell";

// Interfaces
export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface PortalLayoutProps {
  portal: "admin" | "owner" | "resident";
  brandIcon: LucideIcon;
  portalLabel?: string;
  navItems: NavItem[];
  profileRoute: string;
  defaultUserLabel: string;
  notificationDotColor: string;
  title: string;
  actions?: ReactNode;
  /** Called when the user pulls down to refresh (touch devices). Omit to disable. */
  onRefresh?: () => Promise<unknown> | unknown;
  children: ReactNode;
}

// ============================================================================
// SidebarContent
// ============================================================================
function SidebarContent({
  brandIcon: Brand,
  portalLabel,
  navItems,
  onNavigate,
}: {
  brandIcon: LucideIcon;
  portalLabel?: string;
  navItems: NavItem[];
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const go = useCallback(
    (to: string) => { navigate(to); onNavigate?.(); },
    [navigate, onNavigate]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-sidebar-border px-5 py-5">
        <p className="flex items-center gap-2 font-display text-sm text-sidebar-primary">
          <span className="h-0.5 w-5 bg-sidebar-primary" />
          PropCare
        </p>
        {portalLabel && (
          <p className="mt-2 font-data text-[10px] uppercase tracking-widest text-muted-foreground">{portalLabel}</p>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.to ||
            (item.to !== navItems[0].to && location.pathname.startsWith(item.to));
          return (
            <button
              key={item.to}
              onClick={() => go(item.to)}
              className={[
                "flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors",
                active
                  ? "border-sidebar-primary bg-sidebar-accent text-sidebar-foreground"
                  : "border-transparent text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              ].join(" ")}
            >
              <Icon size={17} className={active ? "text-sidebar-primary" : "text-muted-foreground"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => go(ROUTES.login)}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-critical-soft hover:text-critical"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PortalLayout
// ============================================================================
export function PortalLayout({
  portal,
  brandIcon,
  portalLabel,
  navItems,
  profileRoute,
  defaultUserLabel,
  notificationDotColor,
  title,
  actions,
  onRefresh,
  children,
}: PortalLayoutProps) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const { pullDistance, refreshing, threshold } = usePullToRefresh(onRefresh);
  const user = getStoredUser();
  const displayName = user?.fullName ?? defaultUserLabel;
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div data-portal={portal} className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent brandIcon={brandIcon} portalLabel={portalLabel} navItems={navItems} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar">
            <button onClick={closeDrawer} aria-label="Close menu" className="absolute right-3 top-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <SidebarContent brandIcon={brandIcon} portalLabel={portalLabel} navItems={navItems} onNavigate={closeDrawer} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top nav */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="text-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell dotColor={notificationDotColor} />
            <button
              onClick={() => navigate(profileRoute)}
              className="flex items-center gap-2 rounded-xl border border-border px-2 py-1.5 transition-colors hover:bg-accent"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{initials}</span>
              <span className="hidden text-sm text-secondary-foreground sm:block">{displayName}</span>
              <ChevronDown size={15} className="hidden text-muted-foreground sm:block" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {onRefresh && (
            <PullToRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} threshold={threshold} />
          )}
          <EmailVerificationBanner />
          {actions && <div className="mb-5 flex flex-wrap gap-3">{actions}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
