import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors thrown by any page rendered inside the layout so a
 * single broken page (e.g. Dashboard) can't blank out the whole app.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ maxWidth: 520, mx: "auto", mt: 6, px: 2 }}>
          <Alert severity="error" variant="outlined">
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message ?? "An unexpected error occurred while rendering this page."}
            </Typography>
            <Button variant="contained" size="small" onClick={this.handleReset}>
              Back to Dashboard
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
