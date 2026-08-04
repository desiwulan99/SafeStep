import { Home, MapPin, ShieldCheck, AlertTriangle } from "lucide-react";
import { NAV_ITEMS } from "../../utils/constants";
import "./Sidebar.css";

const ICONS = {
  home: Home,
  "map-pin": MapPin,
  "shield-heart": ShieldCheck,
  alert: AlertTriangle,
};

export default function Sidebar({ activeKey = "home", onNavigate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav" aria-label="Navigasi utama">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = activeKey === item.key;
          const displayLabel = item.shortLabel || item.label;

          return (
            <button
              key={item.key}
              type="button"
              className={`sidebar__item ${isActive ? "sidebar__item--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate?.(item)}
            >
              <Icon
                className="sidebar__icon"
                size={22}
                strokeWidth={2.2}
                fill={isActive ? "currentColor" : "none"}
              />
              <span className="sidebar__label">{displayLabel}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
