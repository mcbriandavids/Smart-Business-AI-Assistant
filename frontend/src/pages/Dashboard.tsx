import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import CustomerTable from "../components/CustomerTable";
import BroadcastDeliveryList from "../components/BroadcastDeliveryList";
import {
  Typography,
  Avatar,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";

// cSpell:disable LGA Topbar

// Single, top-level CreateBusinessForm
function CreateBusinessForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  // Autofill lat/lng from browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLng(pos.coords.longitude.toFixed(6));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [lga, setLga] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [country, setCountry] = useState<string>("Nigeria");
  // Nigeria states and LGAs
  // cSpell:disable
  const nigeriaStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];
  const nigeriaLgas: Record<string, string[]> = {
    Lagos: [
      "Agege",
      "Ajeromi-Ifelodun",
      "Alimosho",
      "Amuwo-Odofin",
      "Apapa",
      "Badagry",
      "Epe",
      "Eti-Osa",
      "Ibeju-Lekki",
      "Ifako-Ijaiye",
      "Ikeja",
      "Ikorodu",
      "Kosofe",
      "Lagos Island",
      "Lagos Mainland",
      "Mushin",
      "Ojo",
      "Oshodi-Isolo",
      "Shomolu",
      "Surulere",
    ],
    // Add more states and their LGAs as needed
  };
  // cSpell:enable
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  // Categories from backend enum
  const categories = [
    "restaurant",
    "grocery",
    "pharmacy",
    "electronics",
    "clothing",
    "beauty",
    "home_garden",
    "sports",
    "books",
    "toys",
    "automotive",
    "health",
    "services",
    "other",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/businesses", {
        name,
        description,
        category,
        address: {
          street,
          city,
          state,
          zipCode,
          country,
          coordinates: {
            lat: Number(lat),
            lng: Number(lng),
          },
        },
        contact: {
          email,
          phone,
          website,
          socialMedia: {
            facebook,
            twitter,
            instagram,
            linkedin,
          },
        },
      });
      onSuccess();
    } catch (err: any) {
      if (err?.response?.data?.message) {
        window.dispatchEvent(
          new CustomEvent("dashboard-error", {
            detail: err.response.data.message,
          })
        );
      }
      alert(err?.response?.data?.message || "Failed to create business");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      <TextField
        label="Business Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        fullWidth
        multiline
        minRows={2}
      />
      <TextField
        select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        fullWidth
        slotProps={{ select: { native: true } }}
      >
        <option value="">Select category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat.replace(/_/g, " ")}
          </option>
        ))}
      </TextField>
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        type="email"
      />
      <TextField
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        fullWidth
      />
      <TextField
        label="Street Address"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
        fullWidth
      />
      <TextField
        select
        label="State"
        value={state || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setState(e.target.value);
          setLga("");
        }}
        required
        fullWidth
        slotProps={{ select: { native: true } }}
      >
        <option value="">Select state</option>
        {nigeriaStates.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </TextField>

      {state && nigeriaLgas[state] && (
        <TextField
          select
          label="Local Government Area (LGA)"
          value={lga}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLga(e.target.value)
          }
          required
          fullWidth
          slotProps={{ select: { native: true } }}
        >
          <option value="">Select LGA</option>
          {nigeriaLgas[state].map((l: string) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </TextField>
      )}

      <TextField
        label="Zip Code"
        value={zipCode}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setZipCode(e.target.value)
        }
        required
        fullWidth
      />
      <TextField
        select
        label="Country"
        value={country}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setCountry(e.target.value)
        }
        required
        fullWidth
        disabled
        slotProps={{ select: { native: true } }}
      >
        <option value="Nigeria">Nigeria</option>
      </TextField>

      <TextField
        label="Latitude"
        value={lat}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLat(e.target.value)
        }
        required
        fullWidth
        type="number"
      />
      <TextField
        label="Longitude"
        value={lng}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setLng(e.target.value)
        }
        required
        fullWidth
        type="number"
      />
      <TextField
        label="Facebook"
        value={facebook}
        onChange={(e) => setFacebook(e.target.value)}
        fullWidth
      />
      <TextField
        label="Twitter"
        value={twitter}
        onChange={(e) => setTwitter(e.target.value)}
        fullWidth
      />
      <TextField
        label="Instagram"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        fullWidth
      />
      <TextField
        label="LinkedIn"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
        fullWidth
      />
      <DialogActions>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? "Creating..." : "Create Business"}
        </Button>
      </DialogActions>
    </Box>
  );
}
/* helper types and small StatusBadge component used by the page */
type Customer = {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  notes?: string;
};

function StatusBadge({ status }: { status?: string }) {
  const label = status || "Unknown";
  const color =
    status === "active"
      ? "success"
      : status === "inactive"
      ? "default"
      : "error";
  return (
    <Chip
      label={label}
      color={color as "success" | "default" | "error"}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

// Minimal CustomerForm to add/edit a customer; calls API and triggers onSuccess
function CustomerForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState<string>(initialData?.name || "");
  const [email, setEmail] = useState<string>(initialData?.email || "");
  const [phone, setPhone] = useState<string>(initialData?.phone || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [saving, setSaving] = useState<boolean>(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      if (initialData?._id) {
        await api.put(`/api/customers/${initialData._id}`, {
          name,
          email,
          phone,
          notes,
        });
      } else {
        await api.post("/api/customers", { name, email, phone, notes });
      }
      onSuccess();
    } catch (err: any) {
      // best effort: simple alert; parent shows snackbar elsewhere
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <TextField
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
      />
      <TextField
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        fullWidth
        multiline
        minRows={2}
      />
      <DialogActions>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? "Saving..." : initialData ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showBusinessModal, setShowBusinessModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [businessContent, setBusinessContent] = useState<string>("");
  // ...existing code...
  // Place this after 'me' is declared
  useEffect(() => {
    setTimeout(() => {
      import("../utils/auth").then(({ getToken }) => {
        // eslint-disable-next-line no-console
        console.log("[Dashboard] User:", me);
        // eslint-disable-next-line no-console
        console.log("[Dashboard] Token:", getToken && getToken());
      });
    }, 1000);
  }, [me]);

  // Show business creation modal if vendor/owner and no business exists
  useEffect(() => {
    if (
      (me?.data?.user?.role === "vendor" || me?.data?.user?.role === "owner") &&
      (!businessContent || businessContent.trim() === "") &&
      (error === "No business found" || error === "Business not found")
    ) {
      setShowBusinessModal(true);
    } else {
      setShowBusinessModal(false);
    }
  }, [me, businessContent, error]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [broadcastMsg, setBroadcastMsg] = useState<string>("");
  const [broadcasting, setBroadcasting] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    customer?: Customer;
  }>({ open: false });
  const [messageText, setMessageText] = useState<string>("");
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  // Add or update customer
  function handleAddCustomer() {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  }

  function handleEditCustomer(customer: Customer) {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Delete customer ${customer.name || ""}?`)) return;
    try {
      await api.delete(`/api/customers/${customer._id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      setSnackbar({
        open: true,
        message: "Customer deleted",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  function handleMessageCustomer(customer: Customer) {
    setMessageDialog({ open: true, customer });
    setMessageText("");
  }

  async function handleSendMessage() {
    if (!messageDialog.customer) return;
    setMessageLoading(true);
    try {
      await api.post(`/api/customers/${messageDialog.customer._id}/message`, {
        content: messageText,
        type: "general", // or another type if you want
      });
      setSnackbar({ open: true, message: "Message sent", severity: "success" });
      setMessageDialog({ open: false });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Message failed",
        severity: "error",
      });
    } finally {
      setMessageLoading(false);
    }
  }

  // Send broadcast message to all customers
  async function handleBroadcast() {
    if (!broadcastMsg.trim() || broadcastMsg.trim().length < 3) {
      setBroadcastSuccess("Message must be at least 3 characters.");
      return;
    }
    setBroadcasting(true);
    setBroadcastSuccess(null);
    try {
      const res = await api.post("/api/vendor-customers/broadcast", {
        title: "Message from Vendor",
        message: broadcastMsg,
      });
      const targeted = res.data?.data?.targeted;
      const delivered = res.data?.data?.inAppCreated;
      if (typeof targeted === "number" && typeof delivered === "number") {
        setBroadcastSuccess(
          `Message delivered to ${delivered} of ${targeted} customers.`
        );
      } else {
        setBroadcastSuccess("Message sent to all customers.");
      }
      setBroadcastMsg("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to send message.";
      setBroadcastSuccess(msg);
    } finally {
      setBroadcasting(false);
    }
  }

  // Fetch user and business content
  async function fetchMeAndBusiness() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/auth/me");
      setMe(res.data);
      // Fetch business content if owner/vendor
      if (
        res.data?.data?.user?.role === "owner" ||
        res.data?.data?.user?.role === "vendor"
      ) {
        try {
          const businessRes = await api.get("/api/businesses/content");
          setBusinessContent(businessRes.data?.data?.description || "");
        } catch (err: any) {
          setBusinessContent("");
          setError(err?.response?.data?.message || "No business found");
        }
        // Fetch customers sorted by patronage
        try {
          const custRes = await api.get("/api/customers");
          setCustomers(custRes.data?.data || []);
        } catch (err: any) {
          setCustomers([]);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMeAndBusiness();
    // Listen for error events from CreateBusinessForm
    const handler = (e: any) => {
      setSnackbar({ open: true, message: e.detail, severity: "error" });
    };
    window.addEventListener("dashboard-error", handler);
    return () => window.removeEventListener("dashboard-error", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Save business content
  async function handleSaveContent() {
    setSaving(true);
    try {
      await api.put("/api/businesses/content", {
        description: businessContent,
      });
      setEditMode(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[200]} 100%)`,
        display: { xs: "block", md: "flex" },
      }}
    >
      {/* Sidebar */}
      <Paper
        elevation={2}
        sx={{
          width: { xs: "100%", md: 220 },
          minHeight: { xs: "auto", md: "100vh" },
          borderRadius: 0,
          bgcolor: (theme) => theme.palette.background.paper,
          p: 0,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: { xs: "static", md: "relative" },
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            p: 3,
            pb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DashboardIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight={900} color="primary.dark">
            {/* cSpell:disable */}
            Dashboard
            {/* cSpell:enable */}
          </Typography>
        </Box>
        <List>
          <ListItemButton selected>
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Customers" />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <ShoppingCartIcon color="action" />
            </ListItemIcon>
            <ListItemText primary="Products" />
          </ListItemButton>
        </List>
      </Paper>

      {/* Mobile Top Nav */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          width: "100%",
          bgcolor: (theme) => theme.palette.background.paper,
          p: 1,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <DashboardIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={900} color="primary.dark">
            {/* cSpell:disable */}
            Dashboard
            {/* cSpell:enable */}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 36,
            height: 36,
            fontWeight: 700,
          }}
        >
          {me?.data?.user?.firstName?.[0] || <PersonIcon />}
        </Avatar>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          p: { xs: 1, sm: 2, md: 4 },
          pl: { md: 6 },
          pr: { md: 6 },
          bgcolor: (theme) => theme.palette.grey[50],
        }}
      >
        {/* Topbar */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          mb={4}
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              src={me?.data?.user?.avatar || undefined}
              sx={{
                bgcolor: "primary.main",
                width: 56,
                height: 56,
                fontWeight: 700,
              }}
            >
              {me?.data?.user?.avatar
                ? null
                : me?.data?.user?.firstName?.[0] || <PersonIcon />}
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                color="#222"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                Hello {me?.data?.user?.firstName || "User"}{" "}
                <span role="img" aria-label="wave">
                  👋
                </span>
              </Typography>
              <Typography color="text.secondary" fontWeight={500} fontSize={15}>
                Welcome back to your dashboard
              </Typography>
            </Box>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={2}
            width={{ xs: "100%", sm: "auto" }}
          >
            <TextField
              size="small"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: "#fff" },
                },
              }}
              sx={{ minWidth: { xs: 0, sm: 180, md: 220 }, flex: 1 }}
            />
          </Box>
        </Box>

        {/* Broadcast Section */}
        {me?.data?.user?.role === "vendor" && (
          <Paper
            elevation={1}
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              bgcolor: (theme) => theme.palette.background.paper,
              mb: 4,
              boxShadow: (theme) => theme.shadows[1],
            }}
          >
            <Typography variant="h6" fontWeight={800} mb={1}>
              Message All Customers
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                multiline
                minRows={1}
                maxRows={4}
                fullWidth
                placeholder="Type your message..."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                disabled={broadcasting}
              />
              <Button
                variant="contained"
                color="primary"
                disabled={broadcasting || !broadcastMsg.trim()}
                onClick={handleBroadcast}
              >
                {broadcasting ? "Sending..." : "Send"}
              </Button>
            </Box>
            {broadcastSuccess && (
              <Typography
                mt={1}
                color={
                  broadcastSuccess.startsWith("Message")
                    ? "success.main"
                    : "error"
                }
              >
                {broadcastSuccess}
              </Typography>
            )}
          </Paper>
        )}

        {/* Editable Business Content */}
        {me?.data?.user?.role === "vendor" && businessContent && (
          <Paper
            elevation={1}
            sx={{
              borderRadius: 4,
              p: { xs: 2, sm: 3 },
              bgcolor: (theme) => theme.palette.background.paper,
              mb: 4,
              boxShadow: (theme) => theme.shadows[1],
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6" fontWeight={800} sx={{ mb: 0 }}>
                Business Description
              </Typography>
              {!editMode ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveContent}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              )}
            </Box>
            {!editMode ? (
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {businessContent || "No description set."}
              </Typography>
            ) : (
              <TextField
                multiline
                minRows={3}
                fullWidth
                value={businessContent}
                onChange={(e) => setBusinessContent(e.target.value)}
                disabled={saving}
              />
            )}
          </Paper>
        )}

        {/* Business Creation Modal */}
        <Dialog
          open={showBusinessModal}
          onClose={() => {}}
          disableEscapeKeyDown
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Your Business</DialogTitle>
          <DialogContent>
            <Typography mb={2} color="text.secondary">
              To use the dashboard, you must first create your business profile.
            </Typography>
            <CreateBusinessForm
              onSuccess={() => {
                setShowBusinessModal(false);
                fetchMeAndBusiness();
              }}
              onCancel={() => setShowBusinessModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Customers Management Section */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 4,
            p: { xs: 1, sm: 3 },
            bgcolor: (theme) => theme.palette.background.paper,
            width: "100%",
            boxShadow: (theme) => theme.shadows[1],
            mt: 2,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Typography variant="h6" fontWeight={800}>
              All Customers
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddCustomer}
              sx={{ fontWeight: 700, boxShadow: 2 }}
            >
              Add Customer
            </Button>
          </Box>
          {customers.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
              No customers found. Click "Add Customer" to create your first
              customer.
            </Typography>
          ) : (
            <CustomerTable
              customers={customers.filter((cust) => {
                if (!search) return true;
                const val = search.toLowerCase();
                return (
                  (cust.name || "").toLowerCase().includes(val) ||
                  (cust.email || "").toLowerCase().includes(val) ||
                  (cust.phone || "").toLowerCase().includes(val)
                );
              })}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              onMessage={handleMessageCustomer}
            />
          )}
        </Paper>

        {/* Add/Edit Customer Modal */}

        {/* Broadcast Delivery Status */}
        <BroadcastDeliveryList />
        <Dialog
          open={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingCustomer ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
          <DialogContent>
            <CustomerForm
              initialData={editingCustomer || undefined}
              onSuccess={() => {
                setShowCustomerModal(false);
                // Refetch all after add/edit business
                fetchMeAndBusiness();
              }}
              onCancel={() => setShowCustomerModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Message Customer Dialog */}
        <Dialog
          open={messageDialog.open}
          onClose={() => setMessageDialog({ open: false })}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Message Customer</DialogTitle>
          <DialogContent>
            <Typography mb={1}>
              To: {messageDialog.customer?.name || ""}
            </Typography>
            <TextField
              multiline
              minRows={2}
              fullWidth
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={messageLoading}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setMessageDialog({ open: false })}
              disabled={messageLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={messageLoading || !messageText.trim()}
              variant="contained"
              color="primary"
            >
              {messageLoading ? "Sending..." : "Send"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {loading && <Typography mt={2}>Loading profile…</Typography>}
        {error && (
          <Typography color="error" fontWeight={600} mt={2}>
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
