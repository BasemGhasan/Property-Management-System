// ============================================================================
// AdminLayout — PortalLayout preset for the Admin Module.
// ============================================================================

// Imports
import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { PortalLayout } from "./portalLayout";
import { ADMIN_NAV } from "../constants/admin";

// Interfaces
interface AdminLayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

// Component
export function AdminLayout(props: AdminLayoutProps) {
  return (
    <PortalLayout
      portal="admin"
      brandIcon={Shield}
      portalLabel="Admin Portal"
      navItems={ADMIN_NAV}
      profileRoute="/admin/profile"
      defaultUserLabel="Admin"
      notificationDotColor="bg-violet-500"
      {...props}
    />
  );
}
