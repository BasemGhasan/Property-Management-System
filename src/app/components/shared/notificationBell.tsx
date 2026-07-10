// ============================================================================
// NotificationBell — header bell button shared by the Admin, Owner, and
// Resident portals. Fetches the signed-in user's notifications, shows an
// unread dot, and reveals a dropdown feed on click.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Eye, RefreshCw, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  formatTimeAgo,
  type AppNotification,
} from "../../services/notificationService";

const TYPE_ICON: Record<string, LucideIcon> = {
  Reviewed: Eye,
  StatusChanged: RefreshCw,
  Completed: CheckCircle2,
  Info: Info,
};

interface NotificationBellProps {
  dotColor: string;
}

export function NotificationBell({ dotColor }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const load = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      markAllNotificationsRead().catch(() => {});
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Notifications"
        onClick={toggleOpen}
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${dotColor}`} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3 text-sm text-foreground">Notifications</div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              return (
                <li key={n.id} className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon size={15} />
                  </span>
                  <div>
                    <p className="text-sm text-secondary-foreground">{n.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatTimeAgo(n.createdAt)}</p>
                  </div>
                </li>
              );
            })}
            {loaded && notifications.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications yet.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
