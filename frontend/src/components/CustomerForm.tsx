import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { Customer } from "../hooks/useCustomers";

interface Props {
  initialData?: Customer;
  onSuccess?: (data: Omit<Customer, "_id">) => void;
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSuccess) {
      const { _id, ...data } = form;
      onSuccess(data as Omit<Customer, "_id">);
      setForm({ name: "", email: "", phone: "", notes: "" });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box component="form" sx={{ width: "100%" }} onSubmit={handleSubmit}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <TextField
          label="Name"
          name="name"
          size="small"
          value={form.name}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          size="small"
          value={form.email}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Phone"
          name="phone"
          size="small"
          value={form.phone}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Notes"
          name="notes"
          size="small"
          value={form.notes}
          onChange={handleChange}
          fullWidth
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mt: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          type="submit"
          fullWidth={true}
        >
          {form._id ? "Update Customer" : "Add Customer"}
        </Button>
        {onCancel && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            fullWidth={true}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CustomerForm;
