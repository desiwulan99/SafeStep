import { useEffect, useRef, useState } from "react";

/**
 * Tracks the user's current position.
 * @param {{ watch?: boolean, enableHighAccuracy?: boolean }} options
 */
export function useGeolocation({ watch = true, enableHighAccuracy = true } = {}) {
  const [position, setPosition] = useState(null);
  const [placeName, setPlaceName] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | locating | ready | error
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("Geolocation tidak didukung di perangkat ini.");
      return;
    }

    setStatus("locating");

    const onSuccess = (pos) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setStatus("ready");
    };

    const onError = (err) => {
      setError(err.message || "Gagal mendapatkan lokasi.");
      setStatus("error");
    };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy,
      });
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy,
      });
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watch, enableHighAccuracy]);

  return { position, placeName, setPlaceName, status, error };
}
