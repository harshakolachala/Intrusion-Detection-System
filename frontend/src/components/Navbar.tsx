import { useState } from "react";
import type { MouseEvent } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { FiLogOut, FiMenu, FiMoon, FiSun, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeModeContext";
import { SIDEBAR_WIDTH } from "./Sidebar";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { md: `${SIDEBAR_WIDTH}px` },
        bgcolor: "background.paper",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: "none" } }} aria-label="Open navigation">
          <FiMenu />
        </IconButton>

        <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
          Intrusion Detection System
        </Typography>

        <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          <IconButton onClick={toggleMode} aria-label="Toggle color mode">
            {mode === "dark" ? <FiSun /> : <FiMoon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton onClick={openMenu} sx={{ ml: 1 }} aria-label="Account menu">
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>{initials}</Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
          <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem disabled sx={{ opacity: "0.8 !important" }}>
            <FiUser style={{ marginRight: 8 }} />
            Role: {user?.role}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <FiLogOut style={{ marginRight: 8 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
