import { Check, TriangleAlert, X } from "lucide-react";
import "./Toast.css";

export default function Toast({ tone = "success", title, description, onClose }) {
  const Icon = tone === "success" ? Check : TriangleAlert;

  return (
    <div className={`toast toast--${tone}`} role="status">
      <span className="toast__icon" aria-hidden="true">
        <Icon size={20} strokeWidth={3} />
      </span>
      <div className="toast__text">
        <p className="toast__title">{title}</p>
        {description && <p className="toast__desc">{description}</p>}
      </div>
      {onClose && (
        <button className="toast__close" onClick={onClose} aria-label="Tutup notifikasi">
          <X size={16} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}
