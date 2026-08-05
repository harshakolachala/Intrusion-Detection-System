import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingProps {
  /** Fills the whole viewport, used for full-page auth/session checks. */
  fullScreen?: boolean;
  message?: string;
}

export default function Loading({ fullScreen = false, message = "Loading..." }: LoadingProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        height: fullScreen ? "100vh" : "200px",
        width: "100%",
      }}
    >
      <CircularProgress size={36} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
