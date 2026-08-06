export const APP_NAME = "SafeStep";

export const THEME_COLORS = {
  primaryMagenta: "#B01A5B",
  primaryPink: "#F472A6",
  softPink: "#FDEEF4",
  blush: "#FFE3EE",
  ink: "#241422",
  slate: "#6B5C66",
  success: "#1FA55C",
  danger: "#E33A57",
  skyChip: "#EAF3FF",
};

export const SOS_HOLD_DURATION_MS = 2000;
export const SOS_CANCEL_WINDOW_MS = 5000;
export const GUARDIAN_TIMEOUT_MS = 2 * 60 * 1000;
export const SAFE_POINT_RADIUS_M = 2000;

export const NAV_ITEMS = [
  { key: "home", label: "Beranda", icon: "home", path: "/" },
  { key: "safe-route", label: "Peta Aman", icon: "map-pin", path: "/safe-route" },
  { key: "live-guardian", label: "Live Guardian", shortLabel: "Guardian", icon: "heart-wing", path: "/live-guardian" },
  { key: "report", label: "Lapor", icon: "alert", path: "/report" },
];

export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "https://api.safestep.local/v1";
