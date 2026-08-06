import { apiClient } from "../../../services/apiConfig";

export async function sendSosSignal({ lat, lng, userId }) {
  return apiClient.post("/sos/trigger", {
    lat,
    lng,
    userId,
    triggeredAt: new Date().toISOString(),
  });
}

export async function cancelSosSignal(sosId) {
  return apiClient.post(`/sos/${sosId}/cancel`);
}

export function buildSosSmsFallback({ lat, lng, phoneNumbers = [] }) {
  const body = encodeURIComponent(
    `SOS! Saya butuh bantuan. Lokasi saya: https://maps.google.com/?q=${lat},${lng}`
  );
  const to = phoneNumbers.join(",");
  return `sms:${to}?body=${body}`;
}
