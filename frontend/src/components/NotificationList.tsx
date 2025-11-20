import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    await api.put(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      )
    );
  }

  if (loading) {
    return (
      <section className="glass-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">Notifications</div>
            <h2 className="panel-title">Activity center</h2>
          </div>
        </div>
        <div className="empty-state" style={{ marginTop: 16 }}>
          <span className="assistant-spinner" />
          <p style={{ margin: "12px 0 0" }}>Loading notifications…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel">
      <div className="panel-header" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="panel-eyebrow">Notifications</div>
          <h2 className="panel-title">Activity center</h2>
          <p className="panel-subtitle">
            Review system updates, customer interactions, and broadcast delivery
            receipts.
          </p>
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="empty-state">
          <strong>You're all caught up</strong>
          <p style={{ margin: "6px 0 0" }}>
            New notifications will appear here as your assistant takes action.
          </p>
        </div>
      ) : (
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
      )}
    </section>
  );
};

export default NotificationList;
