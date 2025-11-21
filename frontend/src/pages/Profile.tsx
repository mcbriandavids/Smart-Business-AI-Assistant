import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface Social {
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
}

interface FormData {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Address;
  social: Social;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Nigeria",
    },
    social: { whatsapp: "", facebook: "", instagram: "", twitter: "" },
  });
  const [originalForm, setOriginalForm] = useState<FormData | null>(null);

  useEffect(() => {
    fetchMe();
  }, []);

  async function fetchMe() {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/me");
      const me = res.data?.data?.user;
      if (!me) throw new Error("No user data returned");
      // Robustly extract id as a string
      let userId = me.id;
      if (userId && typeof userId === "object") {
        if (userId.$oid) userId = userId.$oid;
        else if (userId.toString) userId = userId.toString();
      }
      if (userId && typeof userId !== "string") userId = String(userId);
      if (!userId) {
        // Log the full user object for debugging
        // eslint-disable-next-line no-console
        console.error("[Profile] No id found in user object:", me);
        setError(
          "Critical: User ID (id) missing from profile data. Please contact support."
        );
        setLoading(false);
        return;
      }
      const loadedForm = {
        id: userId,
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        phone: me.phone || "",
        address: {
          street: me.address?.street || "",
          city: me.address?.city || "",
          state: me.address?.state || "",
          zipCode: me.address?.zipCode || "",
          country: me.address?.country || "Nigeria",
        },
        social: {
          whatsapp: me.social?.whatsapp || "",
          facebook: me.social?.facebook || "",
          instagram: me.social?.instagram || "",
          twitter: me.social?.twitter || "",
        },
      };
      setForm(loadedForm);
      setOriginalForm(loadedForm);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Debug: log form and originalForm
      console.log("form:", form);
      console.log("originalForm:", originalForm);
      // Use userId from form or originalForm
      const userId = (form as any).id || (originalForm as any)?.id;
      if (!userId) throw new Error("User ID not found");
      // Always include valid address.coordinates if address is present
      const address = { ...form.address };
      if (
        !("coordinates" in address) ||
        !address.coordinates ||
        typeof address.coordinates !== "object" ||
        Array.isArray(address.coordinates) ||
        typeof address.coordinates.lat !== "number" ||
        typeof address.coordinates.lng !== "number" ||
        isNaN(address.coordinates.lat) ||
        isNaN(address.coordinates.lng)
      ) {
        // Provide default coordinates if missing or invalid
        address.coordinates = { lat: 0, lng: 0 };
      }
      await api.put(`/api/users/${userId}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address,
        social: form.social,
      });
      setSuccess("Profile updated");
      // Redirect to vendor dashboard after successful update
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (err?.response && JSON.stringify(err.response.data)) ||
          err?.message ||
          "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <Box
        minHeight="60vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      minHeight="100vh"
      bgcolor={(theme) => theme.palette.background.default}
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      py={{ xs: 4, md: 6 }}
      px={{ xs: 2, md: 0 }}
    >
      <Paper
        elevation={3}
        sx={{ p: { xs: 3, md: 4 }, width: "100%", maxWidth: 640 }}
      >
        <Typography
          variant="h5"
          gutterBottom
          fontWeight={700}
          color="primary.dark"
        >
          Edit Profile
        </Typography>
        <form onSubmit={handleSave}>
          {/* Contact Info Section */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mt: 2, mb: 1 }}
          >
            Contact Info
          </Typography>
          <TextField
            fullWidth
            label="First name"
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value, id: form.id })
            }
            margin="normal"
            placeholder="Enter your first name"
          />
          <TextField
            fullWidth
            label="Last name"
            value={form.lastName}
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value, id: form.id })
            }
            margin="normal"
            placeholder="Enter your last name"
          />
          <TextField
            fullWidth
            label="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value, id: form.id })
            }
            margin="normal"
            placeholder="Enter your phone number"
          />

          {/* Address Section */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mt: 3, mb: 1 }}
          >
            Address
          </Typography>
          <Box
            display="grid"
            gap={2}
            sx={{ gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}
          >
            <TextField
              label="Street"
              value={form.address?.street || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, street: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="Street address"
            />
            <TextField
              label="City"
              value={form.address?.city || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, city: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="City"
            />
            <TextField
              label="State"
              value={form.address?.state || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, state: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="State"
            />
            <TextField
              label="Zip Code"
              value={form.address?.zipCode || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, zipCode: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="Zip code"
            />
            <TextField
              label="Country"
              value={form.address?.country || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: { ...form.address, country: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="Country"
            />
          </Box>

          {/* Social Links Section */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mt: 3, mb: 1 }}
          >
            Social Links
          </Typography>
          <Box
            display="grid"
            gap={2}
            sx={{ gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}
          >
            <TextField
              label="WhatsApp"
              value={form.social?.whatsapp || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  social: { ...form.social, whatsapp: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="WhatsApp number"
            />
            <TextField
              label="Facebook"
              value={form.social?.facebook || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  social: { ...form.social, facebook: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="Facebook profile"
            />
            <TextField
              label="Instagram"
              value={form.social?.instagram || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  social: { ...form.social, instagram: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="Instagram handle"
            />
            <TextField
              label="Twitter/X"
              value={form.social?.twitter || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  social: { ...form.social, twitter: e.target.value },
                  id: form.id,
                })
              }
              margin="normal"
              placeholder="Twitter/X handle"
            />
          </Box>

          <Box
            mt={4}
            display="flex"
            gap={2}
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/dashboard")}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Cancel
            </Button>
          </Box>
        </form>
        <Snackbar
          open={!!error}
          autoHideDuration={4000}
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess(null)}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
