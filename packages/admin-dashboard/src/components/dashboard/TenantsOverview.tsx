'use client';

import { Box, Chip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export function TenantsOverview() {
  // Mock data - replace with real API calls
  const rows = [
    {
      id: 1,
      name: 'Acme Corporation',
      subdomain: 'acme-corp',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      users: 45,
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Tech Solutions Ltd',
      subdomain: 'tech-solutions',
      status: 'ACTIVE',
      plan: 'PREMIUM',
      users: 23,
      createdAt: '2024-02-20',
    },
    {
      id: 3,
      name: 'Green Energy Co',
      subdomain: 'green-energy',
      status: 'TRIAL',
      plan: 'BASIC',
      users: 8,
      createdAt: '2024-09-25',
    },
    {
      id: 4,
      name: 'Fashion Forward',
      subdomain: 'fashion-forward',
      status: 'SUSPENDED',
      plan: 'PREMIUM',
      users: 12,
      createdAt: '2024-03-10',
    },
    {
      id: 5,
      name: 'Food Delights',
      subdomain: 'food-delights',
      status: 'ACTIVE',
      plan: 'BASIC',
      users: 6,
      createdAt: '2024-08-05',
    },
  ];

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Tenant Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.subdomain}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'ACTIVE'
              ? 'success'
              : params.value === 'TRIAL'
              ? 'warning'
              : params.value === 'SUSPENDED'
              ? 'error'
              : 'default'
          }
        />
      ),
    },
    {
      field: 'plan',
      headerName: 'Plan',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color={
            params.value === 'ENTERPRISE'
              ? 'primary'
              : params.value === 'PREMIUM'
              ? 'secondary'
              : 'default'
          }
        />
      ),
    },
    {
      field: 'users',
      headerName: 'Users',
      width: 80,
      type: 'number',
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}