import { apiClient } from "./apiConfig";

export async function getAreaRiskSummary({ lat, lng }) {
  try {
    return await apiClient.get(`/risk/summary?lat=${lat}&lng=${lng}`);
  } catch (err) {
    return {
      score: null,
      level: "unknown",
      limitedData: true,
      message: "Data risiko terbatas di area ini.",
    };
  }
}

export async function getNearbySafePoints({ lat, lng, radius = 2000 }) {
  try {
    return await apiClient.get(
      `/safe-points?lat=${lat}&lng=${lng}&radius=${radius}`
    );
  } catch (err) {
    return [];
  }
}
