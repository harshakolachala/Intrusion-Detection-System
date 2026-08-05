import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
        bgcolor: "background.default",
      }}
    >
      <Typography variant="h1" fontWeight={800} color="primary" sx={{ fontSize: { xs: 72, sm: 120 } }}>
        404
      </Typography>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back to Dashboard
      </Button>
    </Box>
  );
}
