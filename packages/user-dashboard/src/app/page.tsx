'use client';

import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import {
  People,
  Inventory,
  TrendingUp,
  Notifications,
  AttachMoney,
  Analytics,
} from '@mui/icons-material';
import { StatsCard } from '../components/dashboard/StatsCard';
import { CustomersOverview } from '../components/dashboard/CustomersOverview';
import { SalesChart } from '../components/dashboard/SalesChart';
import { RecentOrders } from '../components/dashboard/RecentOrders';
import { QuickActions } from '../components/dashboard/QuickActions';

export default function BusinessDashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalCustomers: 1247,
    activeProducts: 89,
    monthlyRevenue: 24350,
    pendingNotifications: 12,
    ordersTrend: 8.5,
    revenueTrend: 12.3,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🏢 Business Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's what's happening with your business today.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<People />}
            color="primary"
            trend={+5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Products"
            value={stats.activeProducts}
            icon={<Inventory />}
            color="success"
            trend={+2.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color="info"
            trend={stats.revenueTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Notifications"
            value={stats.pendingNotifications}
            icon={<Notifications />}
            color="warning"
            trend={-15.3}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ⚡ Quick Actions
            </Typography>
            <QuickActions />
          </Card>
        </Grid>

        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📈 Sales Overview
            </Typography>
            <SalesChart />
          </Card>
        </Grid>

        {/* Customers Overview */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              👥 Recent Customers
            </Typography>
            <CustomersOverview />
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📦 Recent Orders
            </Typography>
            <RecentOrders />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}