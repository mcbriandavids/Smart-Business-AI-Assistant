'use client';

import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import {
  Business,
  People,
  Analytics,
  TrendingUp,
  AttachMoney,
  Warning,
} from '@mui/icons-material';
import { StatsCard } from '../components/dashboard/StatsCard';
import { TenantsOverview } from '../components/dashboard/TenantsOverview';
import { SystemHealth } from '../components/dashboard/SystemHealth';
import { RecentActivity } from '../components/dashboard/RecentActivity';

export default function AdminDashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalTenants: 142,
    activeTenants: 128,
    totalUsers: 1284,
    monthlyRevenue: 45600,
    systemHealth: 98.5,
    alertsCount: 3,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🎛️ Super Admin Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Platform overview and management for Smart Business AI
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Tenants"
            value={stats.totalTenants}
            icon={<Business />}
            color="primary"
            trend={+12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Users"
            value={stats.totalUsers}
            icon={<People />}
            color="success"
            trend={+8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            color="info"
            trend={+15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={<TrendingUp />}
            color="warning"
            trend={-0.2}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Tenants Overview */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Tenants Overview
            </Typography>
            <TenantsOverview />
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              🏥 System Health
            </Typography>
            <SystemHealth />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Recent Activity
            </Typography>
            <RecentActivity />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}