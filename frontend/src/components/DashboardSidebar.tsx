import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";

export default function DashboardSidebar() {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={2}
      sx={{
        width: { xs: "100%", md: 220 },
        minHeight: { xs: "auto", md: "100vh" },
        borderRadius: 0,
        bgcolor: (theme) => theme.palette.background.paper,
        p: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        position: { xs: "static", md: "relative" },
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <DashboardIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" fontWeight={900} color="primary.dark">
          {/* cSpell:disable */}
          Dashboard
          {/* cSpell:enable */}
        </Typography>
      </Box>
      <List>
        <ListItemButton selected>
          <ListItemIcon>
            <PeopleIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Customers" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <ShoppingCartIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="Products" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/profile")}>
          <ListItemIcon>
            <PersonIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </List>
    </Paper>
  );
}