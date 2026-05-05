// api/weather.ts
// WHY THIS FILE EXISTS:
// Vercel treats any file in the /api directory as a serverless function.
// When deployed, Vercel runs this code on a server, not in the browser.
// This means OPENWEATHER_API_KEY is never exposed to the client.
// The browser calls /api/weather?city=London, not OpenWeatherMap directly.

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  //Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, lat, lon, units = "metric" } = req.query;

  //Validate: must have either city OR coordinates
  if (!city && (!lat || !lon)) {
    return res
      .status(400)
      .json({ error: "Provide either city or lat/lon coordinates" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    //This should never happen  in production - indicates a misconfigured deployment
    console.error("[api/weather] OPENWEATHER_API_KEY is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    //Build query string depending on search type
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
      `https://api.openweathermap.org/data/2.5/weather?${params}`,
    );

    //Forward OpenWeatherMap's status code to the client
    //WHY: 404 means city not found - the frontend needs to know this
    if (!response.ok) {
      const error = await response.json();
      return res
        .status(response.status)
        .json({ error: error.message || "Weather API error" });
    }

    const data = await response.json();

    // Cache the response for 10 minutes at the CDN level
    // WHY: This is defence-in-depth — even if the frontend re-queries,
    // Vercel's CDN serves the cached response without hitting OpenWeatherMap.
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=60");

    return res.status(200).json(data);
  } catch (error) {
    console.error("[api/weather] Upstream fetch failed:", error);
    return res.status(503).json({ error: "Weather service unavailable" });
  }
}
