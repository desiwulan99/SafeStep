import { useEffect } from "react";
import { Check } from "lucide-react";
import { useSosTrigger } from "../../hooks/useSosTrigger";
import sosButtonImg from "../../assets/images/sos-button.svg";
import "./SosButton.css";

export default function SosButton({ position, userId, onSent }) {
  const { phase, progress, errorMessage, startHold, cancelHold, fire, reset } =
    useSosTrigger({ position, userId });

  useEffect(() => {
    if (phase === "sent") {
      onSent?.();
      const t = setTimeout(reset, 4000);
      return () => clearTimeout(t);
    }
  }, [phase, onSent, reset]);

  const handleClick = () => {
    if (phase === "idle" || phase === "holding") {
      fire();
    }
  };

  const label =
    phase === "holding"
      ? "Tahan..."
      : phase === "sending"
      ? "Mengirim..."
      : phase === "sent"
      ? "Terkirim"
      : "SOS";

  const circumference = 2 * Math.PI * 46;

  return (
    <div className="sos-wrap">
      <button
        type="button"
        className={`sos-btn sos-btn--${phase}`}
        onClick={handleClick}
        onPointerDown={startHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        aria-label="Tekan untuk mengirim sinyal SOS"
        disabled={phase === "sending" || phase === "sent"}
      >
        <svg className="sos-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="sos-ring__track" cx="50" cy="50" r="46" />
          <circle
            className="sos-ring__progress"
            cx="50"
            cy="50"
            r="46"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference * (1 - progress),
            }}
          />
        </svg>
        {phase === "sent" ? (
          <>
            <span className="sos-btn__icon" aria-hidden="true">
              <Check size={26} strokeWidth={3} />
            </span>
            <span className="sos-btn__label">{label}</span>
          </>
        ) : phase === "sending" ? (
          <span className="sos-btn__label">{label}</span>
        ) : (
          <img src={sosButtonImg} alt="SOS Button" className="sos-btn__svg" />
        )}
      </button>
      <p className="sos-hint">Klik atau tahan tombol untuk memicu SOS</p>
      {errorMessage && <p className="sos-hint sos-hint--error">{errorMessage}</p>}
    </div>
  );
}
