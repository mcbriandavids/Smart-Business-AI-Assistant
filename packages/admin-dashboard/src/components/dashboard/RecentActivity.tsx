'use client';

import { Box, Typography, Avatar, Stack, Chip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivity() {
  // Mock recent activity data
  const activities = [
    {
      id: 1,
      type: 'tenant_created',
      message: 'New tenant "Digital Solutions" created',
      user: 'System',
      timestamp: new Date('2024-10-01T10:30:00Z'),
      severity: 'info',
    },
    {
      id: 2,
      type: 'user_login',
      message: 'Super admin login from IP 192.168.1.100',
      user: 'admin@platform.com',
      timestamp: new Date('2024-10-01T09:45:00Z'),
      severity: 'success',
    },
    {
      id: 3,
      type: 'payment_failed',
      message: 'Payment failed for tenant "Fashion Forward"',
      user: 'Billing System',
      timestamp: new Date('2024-10-01T09:15:00Z'),
      severity: 'error',
    },
    {
      id: 4,
      type: 'tenant_upgraded',
      message: 'Tenant "Tech Solutions" upgraded to Premium plan',
      user: 'john@techsolutions.com',
      timestamp: new Date('2024-10-01T08:30:00Z'),
      severity: 'success',
    },
    {
      id: 5,
      type: 'security_alert',
      message: 'Multiple failed login attempts detected',
      user: 'Security System',
      timestamp: new Date('2024-10-01T08:00:00Z'),
      severity: 'warning',
    },
    {
      id: 6,
      type: 'system_maintenance',
      message: 'Scheduled maintenance completed successfully',
      user: 'System',
      timestamp: new Date('2024-10-01T06:00:00Z'),
      severity: 'info',
    },
  ];

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      tenant_created: '🏢',
      user_login: '👤',
      payment_failed: '💳',
      tenant_upgraded: '⬆️',
      security_alert: '🚨',
      system_maintenance: '🔧',
    };
    return icons[type] || '📋';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Stack spacing={2}>
      {activities.map((activity) => (
        <Box
          key={activity.id}
          className="activity-item"
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            p: 2,
            borderRadius: 2,
            backgroundColor: 'grey.50',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'grey.100',
            },
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              backgroundColor: `${getSeverityColor(activity.severity)}.light`,
            }}
          >
            {getActivityIcon(activity.type)}
          </Avatar>
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              {activity.message}
            </Typography>
            
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                by {activity.user} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </Typography>
              
              <Chip
                size="small"
                label={activity.type.replace('_', ' ')}
                color={getSeverityColor(activity.severity) as any}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}