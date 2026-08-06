import { NAV_ITEMS } from "../../utils/constants";
import "./Sidebar.css";

const ICONS = {
  home: <img src="src\assets\images\home.svg" alt="Home Icon" width="22" height="22" />,
  "map-pin": <img src="src\assets\images\map-pin.svg" alt="Map Pin Icon" width="22" height="22" />,
  "heart-wing": <img src="src\assets\images\heart-wing.svg" alt="Alert Icon" width="22" height="22" />,
  alert: <img src="src\assets\images\report.svg" alt="Alert Icon" width="22" height="22" />,
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
