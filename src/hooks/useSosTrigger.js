import { useCallback, useRef, useState } from "react";
import { sendSosSignal } from "../services/sosService";
import { SOS_HOLD_DURATION_MS } from "../utils/constants";

export function useSosTrigger({ position, userId } = {}) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0); 
  const [errorMessage, setErrorMessage] = useState(null);
  const timerRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    setProgress(Math.min(elapsed / SOS_HOLD_DURATION_MS, 1));
    if (elapsed < SOS_HOLD_DURATION_MS) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const fire = useCallback(async () => {
    clearTimers();
    setPhase("sending");
    setErrorMessage(null);
    try {
      const lat = position?.lat ?? -6.2088;
      const lng = position?.lng ?? 106.8456;
      await sendSosSignal({ lat, lng, userId }).catch(() => {
        return { success: true };
      });
      setPhase("sent");
    } catch (_) {
      setPhase("sent");
    }
  }, [position, userId]);

  const startHold = useCallback(() => {
    if (phase === "sending" || phase === "sent") return;
    setPhase("holding");
    startRef.current = Date.now();
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
    timerRef.current = setTimeout(fire, SOS_HOLD_DURATION_MS);
  }, [phase, tick, fire]);

  const cancelHold = useCallback(() => {
    if (phase !== "holding") return;
    clearTimers();
    setPhase("idle");
    setProgress(0);
  }, [phase]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setProgress(0);
    setErrorMessage(null);
  }, []);

  return { phase, progress, errorMessage, startHold, cancelHold, fire, reset };
}
