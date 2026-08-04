import "./QuickCard.css";

export default function QuickCard({
  title,
  description,
  icon,
  tone = "pink", 
  onClick,
  actionLabel,
}) {
  return (
    <button
      type="button"
      className={`quick-card quick-card--${tone}`}
      onClick={onClick}
    >
      <div className="quick-card__text">
        <p className="quick-card__title">{title}</p>
        <p className="quick-card__desc">{description}</p>
        {actionLabel && <span className="quick-card__cta">{actionLabel} →</span>}
      </div>
      {icon && <div className="quick-card__icon">{icon}</div>}
    </button>
  );
}
