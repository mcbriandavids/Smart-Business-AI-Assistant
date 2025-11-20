import React from "react";
import { useNavigate } from "react-router-dom";

interface DashboardSidebarProps {
  customerCount: number;
  hasBusinessProfile: boolean;
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const peopleIcon = (
  <svg {...iconProps}>
    <path d="M17 21v-2a3 3 0 0 0-3-3H10a3 3 0 0 0-3 3v2" />
    <circle cx="12" cy="8" r="3" />
    <path d="M21 21v-2a3 3 0 0 0-2-2.82" />
    <path d="M5 16.18A3 3 0 0 0 3 19v2" />
    <path d="M19 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    <path d="M9 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
  </svg>
);

const briefcaseIcon = (
  <svg {...iconProps}>
    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <path d="M3 13h18" />
  </svg>
);

export default function DashboardSidebar({
  customerCount,
  hasBusinessProfile,
}: DashboardSidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="dashboard-sidebar">
      <section className="glass-panel">
        <div className="panel-eyebrow">At a glance</div>
        <h3 className="panel-title" style={{ marginBottom: 8 }}>
          Key metrics
        </h3>
        <div className="dashboard-metrics">
          <div className="dashboard-metric">
            <div className="dashboard-metric__icon">{peopleIcon}</div>
            <div>
              <p className="dashboard-metric__label">Customers</p>
              <p className="dashboard-metric__value">{customerCount}</p>
            </div>
          </div>
          <div className="dashboard-metric">
            <div className="dashboard-metric__icon">{briefcaseIcon}</div>
            <div>
              <p className="dashboard-metric__label">Business profile</p>
              <p className="dashboard-metric__value">
                {hasBusinessProfile ? "Complete" : "Setup pending"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-eyebrow">Quick actions</div>
        <div className="dashboard-actions">
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={() => navigate("/vendor/customers")}
          >
            Open customer hub
          </button>
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={() => navigate("/profile")}
          >
            Edit profile
          </button>
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={() => navigate("/notifications")}
          >
            View notifications
          </button>
        </div>
      </section>
    </aside>
  );
}
