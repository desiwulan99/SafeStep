import { NAV_ITEMS } from "../../utils/constants";
import "./Sidebar.css";
function HomeIcon({ className, size = 32, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5 20V9.49997L12 4.21198L19 9.49997V20H13.808V13.616H10.192V20H5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MapPinIcon({ className, size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 6C10.8647 6 7.50008 9.40955 7.50008 13.5952C7.47289 19.718 14.715 24.7948 15 25C15 25 22.5271 19.718 22.4999 13.6C22.4999 9.40955 19.1353 6 15 6ZM15 17.4C12.9281 17.4 11.25 15.6995 11.25 13.6C11.25 11.5005 12.9281 9.8 15 9.8C17.0719 9.8 18.75 11.5005 18.75 13.6C18.75 15.6995 17.0719 17.4 15 17.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function HeartWingIcon({ className, size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3.19512 6.95685C2.27971 11.3446 4.3916 14.199 6.9525 15.7787C5.01521 15.3211 3.14086 14.6371 1.19566 13.6198C2.6898 18.1601 5.95142 19.2341 8.80734 18.9372C7.22924 19.7723 5.56172 20.4198 3.88916 20.858C7.95826 23.3859 10.9269 21.8224 12.5769 19.609C12.4562 19.5008 12.3348 19.3934 12.2126 19.2868C11.9083 19.0702 11.6191 18.821 11.3467 18.5421C10.997 18.2436 10.6409 17.9389 10.2819 17.6204C8.31029 15.8722 6.29877 13.7759 6.21369 11.0093L6.21357 11.0005C5.09168 9.70812 4.07654 8.34599 3.19518 6.95679L3.19512 6.95685ZM26.8049 6.95685C25.9236 8.34581 24.9083 9.70741 23.7864 10.9994L23.7867 11.004C23.868 13.6974 21.8252 15.8473 19.8042 17.6477C18.9915 18.3716 18.1717 19.0436 17.466 19.6657C19.1241 21.8489 22.0764 23.3644 26.111 20.858C24.4385 20.4198 22.7723 19.7723 21.1944 18.9373C24.05 19.2336 27.3104 18.1592 28.8043 13.62C26.8591 14.6373 24.9847 15.3213 23.0474 15.7788C25.6083 14.199 27.7203 11.3448 26.8048 6.95696L26.8049 6.95685ZM19.0459 7.18987C17.7483 7.19983 16.386 7.88421 15.4702 9.43753L15.0142 10.211L14.5609 9.43589C13.4199 7.48554 11.3737 6.87985 9.74742 7.34116H9.74683C8.31211 7.74821 7.20469 8.92067 7.26791 10.9768C7.33746 13.2391 9.061 15.1283 10.9816 16.8314C11.9419 17.6829 12.9363 18.4792 13.7596 19.2642C14.2493 19.731 14.6841 20.1924 15.0095 20.6787C15.3358 20.2265 15.7668 19.7915 16.2527 19.3393C17.0954 18.5551 18.1193 17.736 19.1027 16.86C21.0695 15.108 22.7968 13.1618 22.7326 11.0359C22.6671 8.8694 21.4012 7.61515 19.8839 7.27841C19.6088 7.21731 19.3276 7.18757 19.0458 7.18976L19.0459 7.18987Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReportIcon({ className, size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18.5117 5H11.4989C11.2243 5 10.9497 5.11611 10.7596 5.30611L5.80628 10.2567C5.61618 10.4467 5.5 10.7211 5.5 10.9956V17.9939C5.5 18.2789 5.61618 18.5428 5.80628 18.7433L10.749 23.6833C10.9497 23.8839 11.2243 24 11.4989 24H18.5011C18.7863 24 19.0503 23.8839 19.251 23.6939L24.1937 18.7539C24.2916 18.6553 24.369 18.5383 24.4216 18.4097C24.4741 18.2811 24.5008 18.1434 24.5 18.0044V10.9956C24.5 10.7106 24.3838 10.4467 24.1937 10.2461L19.251 5.30611C19.0609 5.11611 18.7863 5 18.5117 5ZM15.0053 20.0944C14.2448 20.0944 13.6323 19.4822 13.6323 18.7222C13.6323 17.9622 14.2448 17.35 15.0053 17.35C15.7657 17.35 16.3783 17.9622 16.3783 18.7222C16.3783 19.4822 15.7657 20.0944 15.0053 20.0944ZM15.0053 15.5556C14.4244 15.5556 13.9491 15.0806 13.9491 14.5V10.2778C13.9491 9.69722 14.4244 9.22222 15.0053 9.22222C15.5861 9.22222 16.0614 9.69722 16.0614 10.2778V14.5C16.0614 15.0806 15.5861 15.5556 15.0053 15.5556Z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICONS = {
  home: (props) => <HomeIcon {...props} />,
  "map-pin": (props) => <MapPinIcon {...props} />,
  "heart-wing": (props) => <HeartWingIcon {...props} />,
  alert: (props) => <ReportIcon {...props} />,
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
                fill={isActive ? "currentColor" : "white"}
              />
              <span className="sidebar__label">{displayLabel}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
