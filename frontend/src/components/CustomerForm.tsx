import React, { useEffect, useState } from "react";
import { Customer } from "../hooks/useCustomers";

interface Props {
  initialData?: Customer;
  onSuccess?: (data: Omit<Customer, "_id">) => void;
  onCancel?: () => void;
}

type CustomerDraft = {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
};

const createDraft = (customer?: Customer): CustomerDraft => ({
  _id: customer?._id,
  name: customer?.name ?? "",
  email: customer?.email ?? "",
  phone: customer?.phone ?? "",
  notes: customer?.notes ?? "",
});

const CustomerForm: React.FC<Props> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [form, setForm] = useState<CustomerDraft>(() =>
    createDraft(initialData)
  );

  useEffect(() => {
    setForm(createDraft(initialData));
  }, [initialData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: (form.name || "").trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };

    if (!payload.name) {
      return;
    }

    onSuccess?.(payload);

    if (!initialData) {
      setForm(createDraft());
    }
  };

  const isEditing = Boolean(initialData?._id);

  return (
    <form className="stack stack--tight" onSubmit={handleSubmit} noValidate>
      <div className="form-grid form-grid--two">
        <div className="form-field">
          <label className="form-label" htmlFor="customer-name">
            Name
          </label>
          <input
            id="customer-name"
            name="name"
            className="form-input"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Acme Customer"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="customer-email">
            Email
          </label>
          <input
            id="customer-email"
            type="email"
            name="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="customer-phone">
            Phone
          </label>
          <input
            id="customer-phone"
            name="phone"
            className="form-input"
            value={form.phone}
            onChange={handleChange}
            placeholder="(555) 555-5555"
          />
        </div>
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor="customer-notes">
          Notes
        </label>
        <textarea
          id="customer-notes"
          name="notes"
          className="form-input form-textarea"
          value={form.notes}
          onChange={handleChange}
          placeholder="Optional internal notes for this customer"
        />
      </div>
      <div className="form-actions" style={{ justifyContent: "flex-start" }}>
        <button type="submit" className="vendor-button vendor-button--primary">
          {isEditing ? "Save changes" : "Add customer"}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default CustomerForm;
