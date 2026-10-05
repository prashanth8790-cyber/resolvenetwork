/**
 * Reverse geocode latitude and longitude to a human readable street address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CivicConnectApp/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }

    const data = await res.json();

    if (data && data.address) {
      const parts: string[] = [];
      const { house_number, road, neighbourhood, suburb, city, town, village, state, postcode, country } = data.address;

      const street = [house_number, road].filter(Boolean).join(' ');
      if (street) parts.push(street);

      const area = neighbourhood || suburb;
      if (area && area !== street) parts.push(area);

      const locality = city || town || village;
      if (locality && !parts.includes(locality)) parts.push(locality);

      if (state && !parts.includes(state)) parts.push(state);

      if (parts.length > 0) {
        return parts.join(', ');
      }
    }

    if (data && data.display_name) {
      return data.display_name;
    }

    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}
