import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  recipient: string;
}

const BroadcastDeliveryList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      // Fetch all notifications sent by the current vendor
      const res = await api.get("/api/notifications/sent");
      setNotifications(res.data.data.items || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel">
      <div className="panel-header">
        <div>
          <div className="panel-eyebrow">Broadcasts</div>
          <h3 className="panel-title">Delivery status</h3>
          <p className="panel-subtitle">
            Track how broadcast messages land across your customer base.
          </p>
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={fetchNotifications}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div
          className="assistant-panel__status assistant-panel__status--pending"
          style={{ justifyContent: "center" }}
        >
          <span className="assistant-spinner" /> Loading delivery updates…
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <strong>No broadcast messages yet</strong>
          <p style={{ margin: "6px 0 0" }}>
            Share your first announcement to see delivery activity.
          </p>
          <button
            type="button"
            className="vendor-button vendor-button--primary"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/broadcast")}
          >
            Compose broadcast
          </button>
        </div>
      ) : (
        <div className="stack stack--tight">
          {notifications.map((notification, index) => {
            const createdAt = new Date(notification.createdAt).toLocaleString();
            const readAt = notification.readAt
              ? new Date(notification.readAt).toLocaleString()
              : null;
            const key = notification._id
              ? `notification-${notification._id}`
              : `notification-${index}-${notification.createdAt}`;
            return (
              <article
                key={key}
                className={`broadcast-card ${
                  notification.isRead ? "is-read" : ""
                }`}
              >
                <header className="broadcast-card__header">
                  <span className="broadcast-card__title">
                    {notification.title}
                  </span>
                  <span
                    className={`badge-pill ${
                      notification.isRead
                        ? "badge-pill--success"
                        : "badge-pill--warning"
                    }`}
                  >
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                </header>
                <p className="broadcast-card__message">
                  {notification.message}
                </p>
                <footer className="broadcast-card__meta">
                  <span>Sent {createdAt}</span>
                  {readAt ? <span>Read {readAt}</span> : null}
                  <span className="broadcast-card__recipient">
                    Recipient: {notification.recipient}
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BroadcastDeliveryList;
