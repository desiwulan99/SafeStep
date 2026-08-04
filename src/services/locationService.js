export async function reverseGeocode({ lat, lng }, { signal } = {}) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;

  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`);
    const data = await res.json();

    const addr = data.address || {};
    const name =
      addr.railway ||
      addr.amenity ||
      addr.building ||
      addr.road ||
      addr.neighbourhood ||
      addr.suburb ||
      data.name;

    const area = addr.village || addr.suburb || addr.city_district || addr.city;

    if (name && area && name !== area) return `${name}, ${area}`;
    return name || area || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (err) {
    if (err.name === "AbortError") throw err;
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export function distanceInMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}
