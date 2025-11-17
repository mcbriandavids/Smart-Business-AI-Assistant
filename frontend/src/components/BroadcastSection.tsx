import React from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";

interface BroadcastSectionProps {
  broadcastMsg: string;
  setBroadcastMsg: (msg: string) => void;
  broadcasting: boolean;
  broadcastSuccess: string | null;
  onSendBroadcast: () => void;
}

export default function BroadcastSection({
  broadcastMsg,
  setBroadcastMsg,
  broadcasting,
  broadcastSuccess,
  onSendBroadcast,
}: BroadcastSectionProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 4,
        p: { xs: 2, sm: 3 },
        bgcolor: (theme) => theme.palette.background.paper,
        mb: 4,
        boxShadow: (theme) => theme.shadows[1],
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={1}>
        Message All Customers
      </Typography>
      <Box display="flex" gap={2} alignItems="center">
        <TextField
          multiline
          minRows={1}
          maxRows={4}
          fullWidth
          placeholder="Type your message..."
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          disabled={broadcasting}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={broadcasting || !broadcastMsg.trim()}
          onClick={onSendBroadcast}
        >
          {broadcasting ? "Sending..." : "Send"}
        </Button>
      </Box>
      {broadcastSuccess && (
        <Typography
          mt={1}
          color={
            broadcastSuccess.startsWith("Message")
              ? "success.main"
              : "error"
          }
        >
          {broadcastSuccess}
        </Typography>
      )}
    </Paper>
  );
}