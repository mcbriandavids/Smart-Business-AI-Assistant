import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";

interface BusinessContentSectionProps {
  businessContent: string;
  setBusinessContent: (content: string) => void;
  saving: boolean;
  onSave: () => void;
}

export default function BusinessContentSection({
  businessContent,
  setBusinessContent,
  saving,
  onSave,
}: BusinessContentSectionProps) {
  const [editMode, setEditMode] = useState<boolean>(false);

  const handleSave = async () => {
    await onSave();
    setEditMode(false);
  };

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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6" fontWeight={800} sx={{ mb: 0 }}>
          Business Description
        </Typography>
        {!editMode ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setEditMode(true)}
          >
            Edit
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </Box>
      {!editMode ? (
        <Typography
          color="text.secondary"
          sx={{ whiteSpace: "pre-line" }}
        >
          {businessContent || "No description set."}
        </Typography>
      ) : (
        <TextField
          multiline
          minRows={3}
          fullWidth
          value={businessContent}
          onChange={(e) => setBusinessContent(e.target.value)}
          disabled={saving}
        />
      )}
    </Paper>
  );
}