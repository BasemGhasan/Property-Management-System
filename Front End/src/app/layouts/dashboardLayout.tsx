// ============================================================================
// DashboardLayout — PortalLayout preset for the Resident Module.
// ============================================================================

// Imports
import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { PortalLayout } from "./portalLayout";
import { RESIDENT_NAV } from "../constants/resident";

// Interfaces
interface DashboardLayoutProps {
  title: string;
  actions?: ReactNode;
  onRefresh?: () => Promise<unknown> | unknown;
  children: ReactNode;
}

// Component
export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <PortalLayout
      portal="resident"
      brandIcon={Building2}
      navItems={RESIDENT_NAV}
      profileRoute="/resident/profile"
      defaultUserLabel="Resident"
      notificationDotColor="bg-cyan-500"
      {...props}
    />
  );
}
