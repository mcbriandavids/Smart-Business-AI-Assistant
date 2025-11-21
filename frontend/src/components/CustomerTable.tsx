import React from "react";
import { Customer } from "../hooks/useCustomers";

interface Props {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onMessage?: (customer: Customer) => void;
  onSelect?: (customer: Customer) => void;
  selectedCustomerId?: string | null;
}

const formatStatusLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .map((segment) =>
      segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : ""
    )
    .join(" ");

const CustomerTable: React.FC<Props> = ({
  customers,
  onEdit,
  onDelete,
  onMessage,
  onSelect,
  selectedCustomerId,
}) => {
  if (!customers || customers.length === 0) {
    return (
      <div className="empty-state">
        <strong>No customers yet</strong>
        <p style={{ margin: "6px 0 0" }}>
          Add a customer to start tracking conversations and actions.
        </p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-card__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Notes</th>
              {(onEdit || onDelete || onMessage) && (
                <th scope="col" className="table-card__actions-heading">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const customerId =
                customer._id ?? customer.email ?? customer.name;
              const isSelected = customer._id
                ? selectedCustomerId === customer._id
                : false;
              const rowClassNames = [
                onSelect ? "table-card__row--interactive" : "",
                isSelected ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ");
              const statusLabel = customer.status
                ? formatStatusLabel(customer.status)
                : "";
              const notePreview = customer.notes
                ? customer.notes.length > 80
                  ? `${customer.notes.slice(0, 77)}…`
                  : customer.notes
                : "";
              const metaLabel = statusLabel || notePreview;

              return (
                <tr
                  key={customerId}
                  className={rowClassNames || undefined}
                  onClick={() => (onSelect ? onSelect(customer) : undefined)}
                  aria-selected={isSelected}
                  tabIndex={onSelect ? 0 : undefined}
                  onKeyDown={(event) => {
                    if (!onSelect) {
                      return;
                    }
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(customer);
                    }
                  }}
                >
                  <td>
                    <div className="table-card__primary">
                      <span className="table-card__name">
                        {customer.name || "Unnamed"}
                      </span>
                      {metaLabel ? (
                        <span className="table-card__meta">{metaLabel}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="table-card__cell--muted">
                    {customer.email || "—"}
                  </td>
                  <td className="table-card__cell--muted">
                    {customer.phone || "—"}
                  </td>
                  <td className="table-card__notes">
                    {customer.notes ? customer.notes : "—"}
                  </td>
                  {(onEdit || onDelete || onMessage) && (
                    <td className="table-card__actions">
                      {onMessage ? (
                        <button
                          type="button"
                          className="icon-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onMessage?.(customer);
                          }}
                          aria-label={`Message ${customer.name || "customer"}`}
                        >
                          <span
                            className="icon-button__icon"
                            aria-hidden="true"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
                            </svg>
                          </span>
                        </button>
                      ) : null}
                      {onEdit ? (
                        <button
                          type="button"
                          className="icon-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit?.(customer);
                          }}
                          aria-label={`Edit ${customer.name || "customer"}`}
                        >
                          <span
                            className="icon-button__icon"
                            aria-hidden="true"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 3 21l.5-4.5Z" />
                              <path d="m15 5 4 4" />
                            </svg>
                          </span>
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type="button"
                          className="icon-button icon-button--danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete?.(customer);
                          }}
                          aria-label={`Delete ${customer.name || "customer"}`}
                        >
                          <span
                            className="icon-button__icon"
                            aria-hidden="true"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M15 6V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2" />
                            </svg>
                          </span>
                        </button>
                      ) : null}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
