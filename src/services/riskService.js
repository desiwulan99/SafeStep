export const predictSafetyRisk = async (latitude, longitude, hour = null, day_of_week = null, month = null) => {
  const url = "http://localhost:8000/predict";
  const payload = { latitude, longitude, hour, day_of_week, month };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    return { risk_score: 50.0, risk_level: "Medium", is_mock: true };
  }
};
