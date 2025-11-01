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
} from "@mui/material";

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
    <Paper sx={{ p: 2, mt: 4 }}>
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
            <Typography color="text.secondary" align="center">
              No broadcast messages sent yet.
            </Typography>
          )}
          {notifications.map((n) => (
            <ListItem
              key={n._id}
              sx={{ bgcolor: n.isRead ? undefined : "#fffde7" }}
            >
              <ListItemText
                primary={n.title}
                secondary={
                  <>
                    <span>{n.message}</span>
                    <br />
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {n.isRead && n.readAt && (
                      <>
                        <br />
                        <span style={{ fontSize: 11, color: "#4caf50" }}>
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
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default BroadcastDeliveryList;
