import { api } from "../lib/apiClient";

export interface AppNotification {
  id: number;
  type: string;
  message: string;
  requestId?: number;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<AppNotification[]> {
  return api.get<AppNotification[]>("/api/notifications");
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { count } = await api.get<{ count: number }>("/api/notifications/unread-count");
  return count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.put(`/api/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.put("/api/notifications/read-all", {});
}

export function formatTimeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
