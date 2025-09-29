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
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight={700}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            🤖 Smart Business AI Assistant
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            mb={2}
            sx={{ fontSize: "1.1rem", fontWeight: 500 }}
          >
            Genesis v1.0.0 - Intelligent customer notifications and business
            automation
          </Typography>
          <Chip
            label={loading ? "🔄 Loading..." : "🚀 System Ready"}
            color={loading ? "default" : "success"}
            size="medium"
            sx={{
              fontSize: "0.9rem",
              py: 2.5,
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Progress Overview */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: 120,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Customer Base
                  </Typography>
                  <PeopleIcon sx={{ opacity: 0.8 }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats.customers}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={customerProgress}
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(255,255,255,0.2)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "rgba(255,255,255,0.8)",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: 120,
                borderRadius: 2,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                    Product Catalog
                  </Typography>
                  <InventoryIcon sx={{ opacity: 0.8 }} />
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats.products}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={productProgress}
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(255,255,255,0.2)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "rgba(255,255,255,0.8)",
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Feature Grid */}
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    borderColor: `${feature.color}.main`,
                  },
                }}
                onClick={feature.action}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: 2,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1.5}>
                    <Box
                      color={`${feature.color}.main`}
                      mr={1.5}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        "& .MuiSvgIcon-root": {
                          fontSize: "1.5rem",
                        },
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      fontWeight={600}
                      sx={{ fontSize: "0.95rem" }}
                    >
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={1.5}
                    sx={{
                      fontSize: "0.8rem",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {feature.description}
                  </Typography>
                  <Chip
                    label={feature.stats}
                    color={feature.color}
                    size="small"
                    variant="filled"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      fontWeight: 500,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mt: 4, borderRadius: 2, bgcolor: "grey.50" }}>
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              fontWeight={600}
              color="primary"
            >
              🚀 Quick Start
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Get your AI business assistant up and running in minutes
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                size="medium"
                startIcon={<PeopleIcon />}
                onClick={() => setCustomerDialogOpen(true)}
                sx={{ borderRadius: 2, px: 3 }}
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
                size="medium"
                startIcon={<AIIcon />}
                onClick={() => setAiChatOpen(true)}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Test AI Chat
              </Button>
            </Box>
          </CardContent>
        </Card>
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
