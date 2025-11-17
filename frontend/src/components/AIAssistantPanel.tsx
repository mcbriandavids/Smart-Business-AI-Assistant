import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const AIAssistantPanel: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("/api/ai/chat", { message: input });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
      setInput("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 4, maxWidth: 500, mx: "auto" }} elevation={3}>
      <Typography variant="h6" gutterBottom>
        AI Business Assistant
      </Typography>
      <Box sx={{ minHeight: 180, mb: 2 }}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{ mb: 1, textAlign: msg.role === "user" ? "right" : "left" }}
          >
            <Typography
              variant="body2"
              color={msg.role === "user" ? "primary" : "secondary"}
            >
              <b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.content}
            </Typography>
          </Box>
        ))}
        {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
        {error && <Typography color="error">{error}</Typography>}
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Ask the AI assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default AIAssistantPanel;
