// ============================================================================
// ActivityFeed — recent system-level activity list for the admin dashboard.
// ============================================================================

// Imports
import { Activity, UserPlus, Building2, FileText, CheckCircle2 } from "lucide-react";
import type { AdminActivity } from "../../constants/admin";

// Interfaces
interface ActivityFeedProps {
  items: AdminActivity[];
}

// Map type → icon + colour
const TYPE_META: Record<AdminActivity["type"], { icon: typeof Activity; color: string }> = {
  user_registered:    { icon: UserPlus,      color: "bg-primary/15 text-primary"   },
  property_added:     { icon: Building2,     color: "bg-violet-100 text-violet-700" },
  request_submitted:  { icon: FileText,      color: "bg-orange-100 text-orange-700" },
  request_completed:  { icon: CheckCircle2,  color: "bg-green-100 text-green-700"  },
};

// Component
export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="mb-4 flex items-center gap-2 text-foreground">
        <Activity size={18} className="text-violet-700" />
        Recent Activity
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const meta = TYPE_META[item.type];
          const Icon = meta.icon;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                <Icon size={15} />
              </span>
              <div>
                <p className="text-sm text-secondary-foreground">{item.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No recent activity.</li>
        )}
      </ul>
    </div>
  );
}
