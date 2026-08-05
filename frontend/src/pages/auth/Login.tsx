import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errorMessage";

interface LocationState {
  from?: { pathname: string };
  registered?: boolean;
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={state?.from?.pathname ?? "/"} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ username, password });
      navigate(state?.from?.pathname ?? "/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid username or password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <FiShield size={32} />
          <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
            SentinelAI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {state?.registered && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful. Please sign in.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            fullWidth
            required
            margin="normal"
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            margin="normal"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting} sx={{ mt: 3, mb: 2 }}>
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
          </Button>
        </Box>

        <Typography variant="body2" align="center">
          Don&apos;t have an account?{" "}
          <Link component={RouterLink} to="/register">
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
