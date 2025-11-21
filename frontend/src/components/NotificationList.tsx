import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

const checkIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.28 4.22a.75.75 0 0 1 0 1.06l-6.01 6.01a.75.75 0 0 1-1.06 0L2.72 7.8a.75.75 0 0 1 1.06-1.06L6.5 9.46l5.48-5.48a.75.75 0 0 1 1.06 0Z"
      fill="currentColor"
    />
  </svg>
);

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coerceNotification = useCallback((entry: any): Notification => {
    const idSource =
      entry?._id ||
      entry?.id ||
      entry?.notificationId ||
      entry?.notification_id ||
      `temp-${Math.random().toString(36).slice(2)}`;

    const title = entry?.title || entry?.subject || "Notification";
    const message =
      entry?.message || entry?.body || entry?.description || "No details";

    const createdAtSource =
      entry?.createdAt ||
      entry?.created_at ||
      entry?.timestamp ||
      entry?.date ||
      new Date().toISOString();

    const createdAt =
      typeof createdAtSource === "string"
        ? createdAtSource
        : new Date(createdAtSource).toISOString();

    const readAtSource = entry?.readAt || entry?.read_at || null;

    return {
      _id: String(idSource),
      title: String(title),
      message: String(message),
      isRead: Boolean(entry?.isRead ?? entry?.read ?? false),
      readAt:
        typeof readAtSource === "string"
          ? readAtSource
          : readAtSource instanceof Date
          ? readAtSource.toISOString()
          : undefined,
      createdAt,
    };
  }, []);

  const extractItems = useCallback((payload: any): any[] => {
    if (!payload) {
      return [];
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload.items)) {
      return payload.items;
    }
    if (Array.isArray(payload.notifications)) {
      return payload.notifications;
    }
    if (Array.isArray(payload.results)) {
      return payload.results;
    }
    if (Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/notifications");
      const payload = res?.data?.data ?? res?.data ?? [];
      const items = extractItems(payload).map(coerceNotification);
      setNotifications(items);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load notifications"
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [coerceNotification, extractItems]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAsRead(id: string) {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to mark notification as read"
      );
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderEmptyState = () => (
    <div className="empty-state">
      <strong>You're all caught up</strong>
      <p style={{ margin: "6px 0 0" }}>
        New notifications will appear here as your assistant takes action.
      </p>
    </div>
  );

  return (
    <section className="glass-panel">
      <div className="panel-header" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="panel-eyebrow">Notifications</div>
          <h2 className="panel-title">Activity center</h2>
          <p className="panel-subtitle">
            {unreadCount > 0
              ? `${unreadCount} unread ${
                  unreadCount === 1 ? "alert" : "alerts"
                }`
              : "Review system updates, customer interactions, and broadcast receipts."}
          </p>
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={fetchNotifications}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="callout callout--error" role="alert">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              className="vendor-button vendor-button--ghost vendor-button--compact"
              onClick={fetchNotifications}
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      {loading && notifications.length === 0 && !error ? (
        <div className="empty-state" style={{ marginTop: 16 }}>
          <span className="assistant-spinner" />
          <p style={{ margin: "12px 0 0" }}>Loading notifications…</p>
        </div>
      ) : null}

      {!loading && !error && notifications.length === 0
        ? renderEmptyState()
        : null}

      {notifications.length > 0 ? (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`notification-card ${
                notification.isRead ? "" : "notification-card--unread"
              }`}
            >
              <div className="notification-card__header">
                <div>
                  <h3 className="notification-card__title">
                    {notification.title}
                  </h3>
                  <time className="notification-card__timestamp">
                    {new Date(notification.createdAt).toLocaleString()}
                  </time>
                </div>
                {notification.isRead ? (
                  <span className="badge-pill badge-pill--subtle">Read</span>
                ) : (
                  <button
                    type="button"
                    className="vendor-button vendor-button--ghost vendor-button--compact"
                    onClick={() => markAsRead(notification._id)}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      {checkIcon}
                      Mark as read
                    </span>
                  </button>
                )}
              </div>
              <p className="notification-card__message">
                {notification.message}
              </p>
              {notification.isRead && notification.readAt ? (
                <p className="notification-card__read-at">
                  Read at {new Date(notification.readAt).toLocaleString()}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {loading && notifications.length > 0 ? (
        <div className="form-helper" style={{ marginTop: 18 }}>
          Updating feed…
        </div>
      ) : null}
    </section>
  );
};

export default NotificationList;
