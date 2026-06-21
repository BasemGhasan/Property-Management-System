// ============================================================================
// NotificationWidget — recent activity feed shown on the resident dashboard.
// Contractor-assignment type removed; replaced with owner-reviewed type.
// ============================================================================

// Imports
import { Bell, Eye, RefreshCw, CheckCircle2, type LucideIcon } from "lucide-react";
import type { ResidentNotification } from "../../constants/resident";

// Interfaces
interface NotificationWidgetProps {
  notifications: ResidentNotification[];
}

// Map notification type → icon + accent colour.
const TYPE_META: Record<ResidentNotification["type"], { icon: LucideIcon; color: string }> = {
  reviewed: { icon: Eye, color: "text-blue-400 bg-blue-500/15" },
  status: { icon: RefreshCw, color: "text-orange-400 bg-orange-500/15" },
  completed: { icon: CheckCircle2, color: "text-green-400 bg-green-500/15" },
};

// Component
export function NotificationWidget({ notifications }: NotificationWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center gap-2 text-slate-200">
        <Bell size={18} className="text-blue-400" />
        Recent Notifications
      </div>

      <ul className="flex flex-col gap-3">
        {notifications.map((n) => {
          const meta = TYPE_META[n.type];
          const Icon = meta.icon;
          return (
            <li key={n.id} className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                <Icon size={15} />
              </span>
              <div>
                <p className="text-sm text-slate-300">{n.message}</p>
                <p className="mt-0.5 text-xs text-slate-500">{n.time}</p>
              </div>
            </li>
          );
        })}

        {notifications.length === 0 && (
          <li className="py-6 text-center text-sm text-slate-500">No notifications yet.</li>
        )}
      </ul>
    </div>
  );
}
