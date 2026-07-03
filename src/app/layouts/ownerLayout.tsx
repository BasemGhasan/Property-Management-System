// ============================================================================
// OwnerLayout — PortalLayout preset for the Property Owner Module.
// ============================================================================

// Imports
import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { PortalLayout } from "./portalLayout";
import { OWNER_NAV } from "../constants/owner";

// Interfaces
interface OwnerLayoutProps {
  title: string;
  actions?: ReactNode;
  onRefresh?: () => Promise<unknown> | unknown;
  children: ReactNode;
}

// Component
export function OwnerLayout(props: OwnerLayoutProps) {
  return (
    <PortalLayout
      portal="owner"
      brandIcon={Building2}
      portalLabel="Owner Portal"
      navItems={OWNER_NAV}
      profileRoute="/owner/profile"
      defaultUserLabel="Owner"
      notificationDotColor="bg-orange-500"
      {...props}
    />
  );
}
