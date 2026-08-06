import { TriangleAlert } from "lucide-react";
import "./ReportBanner.css";

export default function ReportBanner({ onReport }) {
  return (
    <button type="button" className="report-banner" onClick={onReport}>
      <span className="report-banner__icon" aria-hidden="true">
        <TriangleAlert size={17} strokeWidth={2.4} />
      </span>
      <span className="report-banner__text">
        <span className="report-banner__title">Laporkan Insiden</span>
        <span className="report-banner__desc">
          Laporkan area yang tidak aman dan jaga sesama, identitasmu tetap anonim.
        </span>
      </span>
    </button>
  );
}
