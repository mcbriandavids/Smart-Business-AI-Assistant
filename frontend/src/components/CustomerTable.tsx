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
                          className="vendor-button vendor-button--ghost vendor-button--compact"
                          onClick={(event) => {
                            event.stopPropagation();
                            onMessage?.(customer);
                          }}
                        >
                          Message
                        </button>
                      ) : null}
                      {onEdit ? (
                        <button
                          type="button"
                          className="vendor-button vendor-button--ghost vendor-button--compact"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit?.(customer);
                          }}
                        >
                          Edit
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type="button"
                          className="vendor-button vendor-button--danger vendor-button--compact"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete?.(customer);
                          }}
                        >
                          Delete
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
