import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { FiActivity, FiAlertTriangle, FiBarChart2, FiHome, FiMessageSquare, FiSettings, FiShield } from "react-icons/fi";

export const SIDEBAR_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: <FiHome size={18} />, end: true },
  { label: "Alerts", path: "/alerts", icon: <FiAlertTriangle size={18} /> },
  { label: "Prediction", path: "/predict", icon: <FiActivity size={18} /> },
  { label: "Chatbot", path: "/chatbot", icon: <FiMessageSquare size={18} /> },
  { label: "Analytics", path: "/analytics", icon: <FiBarChart2 size={18} /> },
  { label: "Settings", path: "/settings", icon: <FiSettings size={18} /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar sx={{ gap: 1 }}>
        <FiShield size={22} />
        <Typography variant="h6" fontWeight={700} noWrap>
          SentinelAI
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "& .MuiListItemIcon-root": { color: "inherit" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
        SentinelAI v2.0.0
      </Typography>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile: temporary overlay drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>

      {/* Desktop: permanent sidebar */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <SidebarContent onNavigate={() => undefined} />
      </Drawer>
    </Box>
  );
}
