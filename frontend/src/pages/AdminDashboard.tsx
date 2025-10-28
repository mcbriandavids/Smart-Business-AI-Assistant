import { useEffect, useState } from "react";
import { api } from "../api/client";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const statsRes = await api.get("/api/admin/stats");
        setStats(statsRes.data.data);
        const usersRes = await api.get("/api/admin/users");
        setUsers(usersRes.data.data.users);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box p={4} color="error.main">
        {error}
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" fontWeight={900} mb={3} color="primary.dark">
        Admin Dashboard
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Platform Stats
        </Typography>
        <Box display="flex" gap={4} flexWrap="wrap">
          <Stat label="Total Users" value={stats?.users} />
          <Stat label="Vendors" value={stats?.vendors} />
          <Stat label="Businesses" value={stats?.businesses} />
          <Stat label="Orders" value={stats?.orders} />
        </Box>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          All Users
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    {u.firstName} {u.lastName}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role}
                      color={
                        u.role === "admin"
                          ? "secondary"
                          : u.role === "vendor"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.active ? "Active" : "Inactive"}
                      color={u.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Box minWidth={120} textAlign="center">
      <Typography variant="h5" fontWeight={800} color="primary.main">
        {value ?? "-"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
