'use client';

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingCart,
  AttachMoney,
  Inventory,
  LocalShipping,
  Warning,
  CheckCircle,
  Schedule,
  Notifications,
  Add,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for charts
const salesData = [
  { name: 'Jan', sales: 4000, orders: 24 },
  { name: 'Feb', sales: 3000, orders: 18 },
  { name: 'Mar', sales: 5000, orders: 32 },
  { name: 'Apr', sales: 4500, orders: 28 },
  { name: 'May', sales: 6000, orders: 38 },
  { name: 'Jun', sales: 5500, orders: 35 },
];

const recentOrders = [
  { id: '001', customer: 'John Smith', amount: 125.50, status: 'delivered', time: '2 hours ago' },
  { id: '002', customer: 'Sarah Johnson', amount: 89.99, status: 'shipped', time: '4 hours ago' },
  { id: '003', customer: 'Mike Wilson', amount: 205.00, status: 'processing', time: '6 hours ago' },
  { id: '004', customer: 'Emma Davis', amount: 67.50, status: 'pending', time: '8 hours ago' },
];

const lowStockItems = [
  { name: 'Wireless Headphones', stock: 5, threshold: 10 },
  { name: 'Phone Cases', stock: 3, threshold: 15 },
  { name: 'Laptop Stands', stock: 7, threshold: 12 },
];

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

function StatsCard({ title, value, icon, trend, color = 'primary' }: StatsCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp 
                  color={trend > 0 ? 'success' : 'error'} 
                  fontSize="small" 
                />
                <Typography 
                  variant="body2" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {trend > 0 ? '+' : ''}{trend}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: `${color}.light`,
              color: `${color}.contrastText`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'delivered':
      return <CheckCircle color="success" />;
    case 'shipped':
      return <LocalShipping color="info" />;
    case 'processing':
      return <Schedule color="warning" />;
    default:
      return <Schedule color="disabled" />;
  }
}

function getStatusColor(status: string): 'success' | 'info' | 'warning' | 'default' {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'info';
    case 'processing':
      return 'warning';
    default:
      return 'default';
  }
}

export default function BusinessDashboard() {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard Overview
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* TODO: Navigate to add product */}}
        >
          Quick Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Revenue"
            value="$12,450"
            icon={<AttachMoney />}
            trend={12.5}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Orders"
            value={145}
            icon={<ShoppingCart />}
            trend={8.2}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Customers"
            value={328}
            icon={<People />}
            trend={15.3}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Products"
            value={89}
            icon={<Inventory />}
            trend={-2.1}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sales Overview
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#1976d2" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Recent Orders
                </Typography>
                <IconButton size="small">
                  <Notifications />
                </IconButton>
              </Box>
              <List>
                {recentOrders.map((order) => (
                  <ListItem key={order.id} divider>
                    <ListItemIcon>
                      {getStatusIcon(order.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">
                            {order.customer}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            ${order.amount}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                          <Chip 
                            label={order.status} 
                            size="small" 
                            color={getStatusColor(order.status)}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {order.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Analytics */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Orders
              </Typography>
              <Box height={250}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alert */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Low Stock Alert
                </Typography>
              </Box>
              <List>
                {lowStockItems.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="error">
                            Only {item.stock} left
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Threshold: {item.threshold}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Box mt={2}>
                <Button variant="outlined" fullWidth>
                  Manage Inventory
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}