import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { Customer } from "./CustomerTable";
import { api } from "../api/client";

interface Props {
  initialData?: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomerForm: React.FC<Props> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [form, setForm] = useState<Partial<Customer>>(
    initialData || { name: "", email: "", phone: "", notes: "" }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (form._id) {
        await api.put(`/api/customers/${form._id}`, form as Customer);
      } else {
        await api.post("/api/customers", form as Customer);
      }
      setForm({ name: "", email: "", phone: "", notes: "" });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box component="form" display="flex" gap={2} onSubmit={handleSubmit}>
      <TextField
        label="Name"
        name="name"
        size="small"
        value={form.name}
        onChange={handleChange}
        required
      />
      <TextField
        label="Email"
        name="email"
        size="small"
        value={form.email}
        onChange={handleChange}
      />
      <TextField
        label="Phone"
        name="phone"
        size="small"
        value={form.phone}
        onChange={handleChange}
      />
      <TextField
        label="Notes"
        name="notes"
        size="small"
        value={form.notes}
        onChange={handleChange}
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : form._id ? "Update Customer" : "Add Customer"}
      </Button>
      {onCancel && (
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      )}
      {error && <span style={{ color: "red" }}>{error}</span>}
    </Box>
  );
};

export default CustomerForm;
