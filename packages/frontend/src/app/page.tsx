"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  LocalShipping as DeliveryIcon,
  SmartToy as AIIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

// Import our interactive components
import CustomerManager from "@/components/CustomerManager";
import ProductManager from "@/components/ProductManager";
import AIChat from "@/components/AIChat";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import apiClient from "@/lib/api";

export default function HomePage() {
  // Dialog states
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Real-time stats
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    notifications: 0,
    deliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load real-time stats
  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      // Load real data from API
      const [customers, products] = await Promise.all([
        apiClient.getCustomers().catch(() => []),
        apiClient.getProducts().catch(() => []),
      ]);

      setStats({
        customers: (customers as any[]).length,
        products: (products as any[]).length,
        notifications: 0, // Will be updated when notifications are sent
        deliveries: 0, // Will be updated when deliveries are created
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Customer Management",
      description:
        "Manage customer contacts, preferences, and purchase history",
      icon: <PeopleIcon fontSize="large" />,
      color: "primary" as const,
      stats: `${stats.customers} Customers`,
      action: () => setCustomerDialogOpen(true),
    },
    {
      title: "Product Inventory",
      description: "Track product availability, pricing, and stock levels",
      icon: <InventoryIcon fontSize="large" />,
      color: "secondary" as const,
      stats: `${stats.products} Products`,
      action: () => setProductDialogOpen(true),
    },
    {
      title: "Smart Notifications",
      description: "Send SMS, WhatsApp, and email notifications to customers",
      icon: <NotificationsIcon fontSize="large" />,
      color: "success" as const,
      stats: `${stats.notifications} Sent Today`,
      action: () =>
        alert("Notification center coming soon! Set up customers first."),
    },
    {
      title: "AI Assistant",
      description: "AI-powered customer chat and business automation",
      icon: <AIIcon fontSize="large" />,
      color: "info" as const,
      stats: "Ready to Chat",
      action: () => setAiChatOpen(true),
    },
    {
      title: "Delivery Coordination",
      description: "Manage deliveries and track customer orders",
      icon: <DeliveryIcon fontSize="large" />,
      color: "warning" as const,
      stats: `${stats.deliveries} Pending`,
      action: () =>
        alert(
          "Delivery management coming soon! Add customers and products first."
        ),
    },
    {
      title: "Business Analytics",
      description: "Track sales, customer engagement, and business growth",
      icon: <AnalyticsIcon fontSize="large" />,
      color: "error" as const,
      stats: "View Reports",
      action: () => setAnalyticsOpen(true),
    },
  ];

  const calculateProgress = () => {
    const maxProgress = 100;
    const customerProgress = Math.min(
      (stats.customers / 10) * 100,
      maxProgress
    );
    const productProgress = Math.min((stats.products / 20) * 100, maxProgress);
    return { customerProgress, productProgress };
  };

  const { customerProgress, productProgress } = calculateProgress();

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            🤖 Smart Business AI Assistant
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={2}>
            Intelligent customer notifications and business automation for
            modern retail
          </Typography>
          <Chip
            label={loading ? "🔄 Loading..." : "🚀 System Ready"}
            color={loading ? "default" : "success"}
            size="medium"
            sx={{ fontSize: "1rem", py: 2 }}
          />
        </Box>

        {/* Progress Overview */}
        <Card sx={{ mb: 4, bgcolor: "background.paper" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Business Growth
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Customer Base: {customerProgress.toFixed(0)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={customerProgress}
                sx={{ mt: 1, mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                Product Catalog: {productProgress.toFixed(0)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={productProgress}
                sx={{ mt: 1, mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary">
                AI Integration: 100%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{ mt: 1 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box color={`${feature.color}.main`} mr={2}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h2">
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {feature.description}
                  </Typography>
                  <Chip
                    label={feature.stats}
                    color={feature.color}
                    size="small"
                    variant="outlined"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color={feature.color}
                    fullWidth
                    onClick={feature.action}
                    variant="contained"
                  >
                    Open {feature.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box mt={6} textAlign="center">
          <Typography variant="h5" gutterBottom>
            Quick Start
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Get your AI business assistant up and running in minutes
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              startIcon={<PeopleIcon />}
              onClick={() => setCustomerDialogOpen(true)}
            >
              Add First Customer
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<InventoryIcon />}
              onClick={() => setProductDialogOpen(true)}
            >
              Add Products
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AIIcon />}
              onClick={() => setAiChatOpen(true)}
            >
              Test AI Chat
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Interactive Components */}
      <CustomerManager
        open={customerDialogOpen}
        onClose={() => {
          setCustomerDialogOpen(false);
          loadStats(); // Refresh stats when dialog closes
        }}
      />
      <ProductManager
        open={productDialogOpen}
        onClose={() => {
          setProductDialogOpen(false);
          loadStats(); // Refresh stats when dialog closes
        }}
      />
      <AIChat open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      <AnalyticsDashboard
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
      />
    </>
  );
}
