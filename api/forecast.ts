// api/forecast.ts
// Same pattern as api/weather.ts — proxies the 5-day forecast endpoint
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Simple origin check at the top of the handler
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://weather-dashboard-contactalangreen.vercel.app",
    "http://localhost:3000",
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, lat, lon, units = "metric" } = req.query;

  if (!city && (!lat || !lon)) {
    return res
      .status(400)
      .json({ error: "Provide either city or lat/lon coordinates" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const params = new URLSearchParams({
      appid: apiKey,
      units: units as string,
      lang: "en",
    });

    if (city) {
      params.set("q", city as string);
    } else {
      params.set("lat", lat as string);
      params.set("lon", lon as string);
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${params}`,
    );

    if (!response.ok) {
      const error = await response.json();
      return res
        .status(response.status)
        .json({ error: error.message || "Forecast API error" });
    }

    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json(data);
  } catch (error) {
    console.error("[api/forecast] Upstream fetch failed:", error);
    return res.status(503).json({ error: "Forecast service unavailable" });
  }
}
