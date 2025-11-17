import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

const MessageDialog: React.FC = () => {
  // Placeholder dialog
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Send Message</DialogTitle>
      <DialogContent>
        <TextField label="Message" fullWidth multiline rows={4} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button variant="contained" color="primary">
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageDialog;
