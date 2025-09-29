import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  LocalShipping as DeliveryIcon,
} from "@mui/icons-material";
import apiClient from "../lib/api";

interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  notificationsSentToday: number;
  pendingDeliveries: number;
  totalSales: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface AnalyticsDashboardProps {
  open: boolean;
  onClose: () => void;
}

export default function AnalyticsDashboard({
  open,
  onClose,
}: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadDashboardStats();
    }
  }, [open]);

  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await apiClient.getDashboardStats()) as DashboardStats;
      setStats(data);
    } catch (error) {
      setError("Failed to load dashboard statistics");
      console.error("Error loading dashboard stats:", error);

      // Provide mock data for demo purposes when API fails
      setStats({
        totalCustomers: 0,
        totalProducts: 0,
        notificationsSentToday: 0,
        pendingDeliveries: 0,
        totalSales: 0,
        recentActivities: [
          {
            id: "1",
            type: "system",
            description: "Smart Business AI Agent initialized successfully",
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
          </Box>
          <Box color={color} sx={{ fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6">Business Analytics Dashboard</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error} - Showing demo data for preview
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Customers"
                  value={stats.totalCustomers}
                  icon={<PeopleIcon />}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Products in Stock"
                  value={stats.totalProducts}
                  icon={<InventoryIcon />}
                  color="secondary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Notifications Sent Today"
                  value={stats.notificationsSentToday}
                  icon={<NotificationsIcon />}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending Deliveries"
                  value={stats.pendingDeliveries}
                  icon={<DeliveryIcon />}
                  color="warning.main"
                />
              </Grid>
            </Grid>

            {/* Recent Activities */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activities
                </Typography>
                {stats.recentActivities.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={2}>
                    No recent activities
                  </Typography>
                ) : (
                  <Box>
                    {stats.recentActivities.map((activity) => (
                      <Box
                        key={activity.id}
                        sx={{
                          py: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Typography variant="body1">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Business Insights */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Insights & Recommendations
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {stats.totalCustomers === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      📋 <strong>Get Started:</strong> Add your first customers
                      to begin tracking engagement and sending notifications.
                    </Alert>
                  )}
                  {stats.totalProducts === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      📦 <strong>Inventory Setup:</strong> Add products to your
                      catalog to enable sales tracking and inventory alerts.
                    </Alert>
                  )}
                  <Alert severity="success">
                    🤖 <strong>AI Ready:</strong> Your Smart Business AI
                    Assistant is operational and ready to help with customer
                    interactions.
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={loadDashboardStats} variant="outlined">
          Refresh Data
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
