import React from "react";
import type { AdminStats } from "../../types/admin";
import { formatNumber } from "../../utils/format";

const metricsLayout: Array<{
  key: keyof AdminStats;
  label: string;
  hint: string;
}> = [
  { key: "vendors", label: "Vendors", hint: "Verified partner accounts" },
  { key: "businesses", label: "Businesses", hint: "Catalogs onboarded" },
  { key: "orders", label: "Orders", hint: "Orders captured" },
  { key: "users", label: "Total Users", hint: "All registered roles" },
];

interface AdminMetricsGridProps {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
}

const AdminMetricsGrid: React.FC<AdminMetricsGridProps> = ({
  stats,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <section className="admin-metrics">
        <article className="admin-metric-card glass-panel">
          <span className="admin-metric-card__label">Loading metrics…</span>
        </article>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-metrics">
        <article className="admin-metric-card glass-panel admin-metric-card--alert">
          <span className="admin-metric-card__label">{error}</span>
        </article>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="admin-metrics">
      {metricsLayout.map((metric) => (
        <article key={metric.key} className="admin-metric-card glass-panel">
          <span className="admin-metric-card__label">{metric.label}</span>
          <strong className="admin-metric-card__value">
            {formatNumber(stats[metric.key])}
          </strong>
          <span className="admin-metric-card__hint">{metric.hint}</span>
        </article>
      ))}
    </section>
  );
};

export default AdminMetricsGrid;
