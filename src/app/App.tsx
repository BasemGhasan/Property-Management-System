import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "sonner";
import { ROUTES } from "./constants/auth";
import { RESIDENT_ROUTES } from "./constants/resident";
import { OWNER_ROUTES } from "./constants/owner";
import { ADMIN_ROUTES } from "./constants/admin";

// ── Batch 1 — Auth & Onboarding ─────────────────────────────────────────────
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import RoleSelectionPage from "./pages/roleSelection";
import ResidentRegistrationPage from "./pages/residentRegistration";
import PropertyOwnerRegistrationPage from "./pages/propertyOwnerRegistration";
import ForgotPasswordPage from "./pages/forgotPassword";
import ResetPasswordPage from "./pages/resetPassword";

// ── Batch 2 — Resident Module ────────────────────────────────────────────────
import ResidentDashboard from "./pages/resident/residentDashboard";
import SubmitRequestPage from "./pages/resident/submitRequest";
import MaintenanceClaimPage from "./pages/resident/maintenanceClaim";
import RequestHistoryPage from "./pages/resident/requestHistory";
import RequestDetailsPage from "./pages/resident/requestDetails";
import ResidentProfilePage from "./pages/resident/residentProfile";

import AssistantPage from "@/pages/assistant/AssistantPage";

// ── Batch 3 — Property Owner Module ─────────────────────────────────────────
import OwnerDashboard from "./pages/owner/ownerDashboard";
import PropertyListPage from "./pages/owner/propertyList";
import OwnerPropertyDetailsPage from "./pages/owner/propertyDetails";
import MaintenanceRequestsPage from "./pages/owner/maintenanceRequests";
import RequestManagementPage from "./pages/owner/requestManagement";
import ClaimRequestsPage from "./pages/owner/claimRequests";
import OwnerReportsPage from "./pages/owner/ownerReports";
import OwnerProfilePage from "./pages/owner/ownerProfile";

// ── Batch 4 — Admin Module ───────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/adminDashboard";
import UserManagementPage from "./pages/admin/userManagement";
import PropertyManagementPage from "./pages/admin/propertyManagement";
import AdminPropertyDetailsPage from "./pages/admin/propertyDetails";
import CategoryManagementPage from "./pages/admin/categoryManagement";
import RequestMonitoringPage from "./pages/admin/requestMonitoring";
import AdminProfilePage from "./pages/admin/adminProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        theme="light"
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          },
        }}
      />
      <Routes>
        {/* ── Auth ─────────────────────────────────────────────────────── */}
        <Route path={ROUTES.login}            element={<LoginPage />} />
        <Route path={ROUTES.roleSelection}    element={<RoleSelectionPage />} />
        <Route path={ROUTES.registerResident} element={<ResidentRegistrationPage />} />
        <Route path={ROUTES.registerOwner}    element={<PropertyOwnerRegistrationPage />} />
        <Route path={ROUTES.forgotPassword}   element={<ForgotPasswordPage />} />
        <Route path={ROUTES.resetPassword}    element={<ResetPasswordPage />} />

        {/* ── Resident ─────────────────────────────────────────────────── */}
        <Route path={RESIDENT_ROUTES.dashboard}              element={<ResidentDashboard />} />
        <Route path={RESIDENT_ROUTES.submit}                 element={<SubmitRequestPage />} />
        <Route path={RESIDENT_ROUTES.claim}                  element={<MaintenanceClaimPage />} />
        <Route path={RESIDENT_ROUTES.history}                element={<RequestHistoryPage />} />
        <Route path={`${RESIDENT_ROUTES.details}/:id`}       element={<RequestDetailsPage />} />
        <Route path={RESIDENT_ROUTES.profile}                element={<ResidentProfilePage />} />
        <Route path={RESIDENT_ROUTES.assistant}              element={<AssistantPage />} />

        {/* ── Owner ────────────────────────────────────────────────────── */}
        <Route path={OWNER_ROUTES.dashboard}                 element={<OwnerDashboard />} />
        <Route path={OWNER_ROUTES.properties}                element={<PropertyListPage />} />
        <Route path={`${OWNER_ROUTES.propertyDetails}/:id`}  element={<OwnerPropertyDetailsPage />} />
        <Route path={OWNER_ROUTES.requests}                  element={<MaintenanceRequestsPage />} />
        <Route path={`${OWNER_ROUTES.requestManage}/:id`}    element={<RequestManagementPage />} />
        <Route path={OWNER_ROUTES.claims}                    element={<ClaimRequestsPage />} />
        <Route path={OWNER_ROUTES.reports}                   element={<OwnerReportsPage />} />
        <Route path={OWNER_ROUTES.profile}                   element={<OwnerProfilePage />} />
        <Route path={OWNER_ROUTES.assistant}                 element={<AssistantPage />} />

        {/* ── Admin ────────────────────────────────────────────────────── */}
        <Route path={ADMIN_ROUTES.dashboard}                 element={<AdminDashboard />} />
        <Route path={ADMIN_ROUTES.users}                     element={<UserManagementPage />} />
        <Route path={ADMIN_ROUTES.properties}                element={<PropertyManagementPage />} />
        <Route path={`${ADMIN_ROUTES.properties}/:id`}       element={<AdminPropertyDetailsPage />} />
        <Route path={ADMIN_ROUTES.categories}                element={<CategoryManagementPage />} />
        <Route path={ADMIN_ROUTES.requests}                  element={<RequestMonitoringPage />} />
        <Route path={ADMIN_ROUTES.profile}                   element={<AdminProfilePage />} />

        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* Fallback → login */}
        <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
