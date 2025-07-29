import { Snackbar, Alert } from "@mui/material";

interface ToastProps {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

// eslint-disable-next-line react/prop-types
const Toast: React.FC<ToastProps> = ({ open, message, severity = "info", onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={3000}
    onClose={onClose}
    anchorOrigin={{ vertical: "top", horizontal: "right" }}
  >
    <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
      {message}
    </Alert>
  </Snackbar>
);

export default Toast;
