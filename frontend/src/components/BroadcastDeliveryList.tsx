import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  recipient: string;
}

const BroadcastDeliveryList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      // Fetch all notifications sent by the current vendor
      const res = await api.get("/api/notifications/sent");
      setNotifications(res.data.data.items || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper
      sx={{ p: 2, mt: 4, bgcolor: (theme) => theme.palette.background.default }}
    >
      <Typography variant="h6" gutterBottom>
        Broadcast Delivery Status
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {notifications.length === 0 && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={4}
            >
              <Typography color="text.secondary" align="center">
                No broadcast messages sent yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => navigate("/broadcast")}
              >
                Send a Broadcast
              </Button>
            </Box>
          )}
          {notifications.map((n) => (
            <ListItem
              key={n._id}
              sx={{
                bgcolor: n.isRead
                  ? (theme) => theme.palette.background.paper
                  : (theme) => theme.palette.action.selected,
                borderRadius: 1,
                mb: 1,
                boxShadow: n.isRead ? undefined : 1,
              }}
            >
              <ListItemText
                primary={
                  <span style={{ color: "#222", fontWeight: 600 }}>
                    {n.title}
                  </span>
                }
                secondary={
                  <>
                    <span style={{ color: "#333" }}>{n.message}</span>
                    <br />
                    <span style={{ fontSize: 12, color: "#666" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.isRead && n.readAt && (
                      <>
                        <br />
                        <span style={{ fontSize: 11, color: "#388e3c" }}>
                          Read at {new Date(n.readAt).toLocaleString()}
                        </span>
                      </>
                    )}
                  </>
                }
              />
              <Chip
                label={n.isRead ? "Read" : "Unread"}
                color={n.isRead ? "success" : "warning"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default BroadcastDeliveryList;
