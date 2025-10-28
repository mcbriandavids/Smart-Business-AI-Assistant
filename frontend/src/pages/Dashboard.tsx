import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  Typography,
  Avatar,
  Box,
  Paper,
  List,
  ListItemIcon,
  ListItemText,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Active"
      ? "success"
      : status === "Inactive"
      ? "default"
      : "error";

  return (
    <Chip
      label={status}
      color={color as "success" | "default" | "error"}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [businessContent, setBusinessContent] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  // Send broadcast message to all customers
  async function handleBroadcast() {
    if (!broadcastMsg.trim()) return;
    setBroadcasting(true);
    setBroadcastSuccess(null);
    try {
      await api.post("/api/vendor-customers/broadcast", {
        message: broadcastMsg,
      });
      setBroadcastSuccess("Message sent to all customers.");
      setBroadcastMsg("");
    } catch (err: any) {
      setBroadcastSuccess("Failed to send message.");
    } finally {
      setBroadcasting(false);
    }
  }

  // Fetch user and business content
  useEffect(() => {
    let active = true;
    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/auth/me");
        if (!active) return;
        setMe(res.data);

        // Fetch business content if owner/vendor
        if (
          res.data?.data?.user?.role === "owner" ||
          res.data?.data?.user?.role === "vendor"
        ) {
          const businessRes = await api.get("/api/businesses/content");
          setBusinessContent(businessRes.data?.data?.description || "");

          // Fetch customers sorted by patronage
          const custRes = await api.get("/api/businesses/customers/patronage");
          setCustomers(custRes.data?.data?.customers || []);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.message || "Failed to fetch profile");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchMe();
    return () => {
      active = false;
    };
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
            Dashboard
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
            Dashboard
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: "#fff" },
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

        {/* Customers Table */}
        <Paper
          elevation={1}
          sx={{
            borderRadius: 4,
            p: { xs: 1, sm: 3 },
            bgcolor: (theme) => theme.palette.background.paper,
            width: "100%",
            overflowX: "auto",
            boxShadow: (theme) => theme.shadows[1],
          }}
        >
          <Typography variant="h6" fontWeight={800} mb={2}>
            All Customers
          </Typography>
          <TableContainer sx={{ minWidth: 320 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Customer Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers
                  .filter((cust) => {
                    if (!search) return true;
                    const val = search.toLowerCase();
                    return (
                      (cust.firstName + " " + cust.lastName)
                        .toLowerCase()
                        .includes(val) ||
                      (cust.email || "").toLowerCase().includes(val) ||
                      (cust.phone || "").toLowerCase().includes(val)
                    );
                  })
                  .map((cust, idx) => (
                    <TableRow key={cust.customerId || idx}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {cust.firstName} {cust.lastName}
                      </TableCell>
                      <TableCell>{cust.company || "-"}</TableCell>
                      <TableCell>{cust.phone || "-"}</TableCell>
                      <TableCell>{cust.email || "-"}</TableCell>
                      <TableCell>{cust.country || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            cust.status ||
                            (idx % 3 === 0
                              ? "Active"
                              : idx % 3 === 1
                              ? "Inactive"
                              : "Blocked")
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            cust.deliveryStatus
                              ? cust.deliveryStatus === "delivered" ||
                                cust.deliveryStatus === "completed"
                                ? "Delivered"
                                : cust.deliveryStatus === "out_for_delivery"
                                ? "Out for Delivery"
                                : cust.deliveryStatus === "pending"
                                ? "Pending"
                                : cust.deliveryStatus.charAt(0).toUpperCase() +
                                  cust.deliveryStatus
                                    .slice(1)
                                    .replace(/_/g, " ")
                              : "No Orders"
                          }
                          color={
                            cust.deliveryStatus === "delivered" ||
                            cust.deliveryStatus === "completed"
                              ? "success"
                              : cust.deliveryStatus === "out_for_delivery"
                              ? "warning"
                              : cust.deliveryStatus === "pending" ||
                                cust.deliveryStatus === "preparing" ||
                                cust.deliveryStatus === "confirmed"
                              ? "info"
                              : cust.deliveryStatus === "cancelled" ||
                                cust.deliveryStatus === "rejected"
                              ? "error"
                              : "default"
                          }
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

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
