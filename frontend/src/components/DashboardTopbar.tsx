import React from "react";
import {
  Box,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

interface DashboardTopbarProps {
  me: any;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function DashboardTopbar({
  me,
  search,
  onSearchChange,
}: DashboardTopbarProps) {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      mb={4}
      gap={2}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          src={me?.data?.user?.avatar || undefined}
          sx={{
            bgcolor: "primary.main",
            width: 56,
            height: 56,
            fontWeight: 700,
          }}
        >
          {me?.data?.user?.avatar
            ? null
            : me?.data?.user?.firstName?.[0] || <PersonIcon />}
        </Avatar>
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            color="#222"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            Hello {me?.data?.user?.firstName || "User"}{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </Typography>
          <Typography color="text.secondary" fontWeight={500} fontSize={15}>
            Welcome back to your dashboard
          </Typography>
        </Box>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        width={{ xs: "100%", sm: "auto" }}
      >
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, bgcolor: "#fff" },
            },
          }}
          sx={{ minWidth: { xs: 0, sm: 180, md: 220 }, flex: 1 }}
        />
      </Box>
    </Box>
  );
}