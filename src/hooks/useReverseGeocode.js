import { useEffect, useRef, useState } from "react";
import { reverseGeocode, distanceInMeters } from "../services/locationService";

const REFRESH_DISTANCE_M = 40;
const REFRESH_INTERVAL_MS = 30000;

export function useReverseGeocode(position) {
  const [placeName, setPlaceName] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastLookupRef = useRef({ position: null, time: 0 });
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!position) return;

    const { position: lastPos, time: lastTime } = lastLookupRef.current;
    const movedEnough =
      !lastPos || distanceInMeters(lastPos, position) >= REFRESH_DISTANCE_M;
    const staleEnough = Date.now() - lastTime >= REFRESH_INTERVAL_MS;

    if (lastPos && !movedEnough && !staleEnough) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    reverseGeocode(position, { signal: controller.signal })
      .then((name) => {
        setPlaceName(name);
        lastLookupRef.current = { position, time: Date.now() };
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          lastLookupRef.current = { position, time: Date.now() };
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [position]);

  return { placeName, loading };
}
