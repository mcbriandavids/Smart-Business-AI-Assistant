'use client';

import { Box, Typography, LinearProgress, Chip, Stack } from '@mui/material';
import { CheckCircle, Warning, Error } from '@mui/icons-material';

export function SystemHealth() {
  // Mock system health data
  const healthMetrics = [
    { name: 'API Response Time', value: 98.5, status: 'healthy', unit: 'ms avg: 120' },
    { name: 'Database Performance', value: 95.2, status: 'healthy', unit: 'queries/sec: 1.2k' },
    { name: 'Server Uptime', value: 99.9, status: 'healthy', unit: '99.9%' },
    { name: 'Memory Usage', value: 78.3, status: 'warning', unit: '78.3% used' },
    { name: 'Storage Space', value: 45.6, status: 'healthy', unit: '45.6% used' },
    { name: 'Background Jobs', value: 92.1, status: 'healthy', unit: '8 pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'error':
        return <Error fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        {healthMetrics.map((metric) => (
          <Box key={metric.name}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                {metric.name}
              </Typography>
              <Chip
                size="small"
                label={metric.status}
                color={getStatusColor(metric.status) as any}
                icon={getStatusIcon(metric.status)}
                variant="outlined"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={metric.value}
              color={getStatusColor(metric.status) as any}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {metric.unit}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box mt={3} p={2} sx={{ backgroundColor: 'success.light', borderRadius: 2 }}>
        <Typography variant="body2" color="success.dark" textAlign="center">
          🟢 All Systems Operational
        </Typography>
      </Box>
    </Box>
  );
}