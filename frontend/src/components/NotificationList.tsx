import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.data.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    await api.put(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      )
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Notifications
      </Typography>
      <List>
        {notifications.map((n) => (
          <ListItem
            key={n._id}
            selected={!n.isRead}
            sx={{ bgcolor: n.isRead ? undefined : "#e3f2fd" }}
            secondaryAction={
              !n.isRead ? (
                <IconButton edge="end" onClick={() => markAsRead(n._id)}>
                  <DoneIcon />
                </IconButton>
              ) : (
                <Chip label="Read" size="small" color="success" />
              )
            }
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
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NotificationList;
