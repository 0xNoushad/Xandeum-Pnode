import { NextRequest, NextResponse } from "next/server";

export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  isp: string;
  org: string;
}

export async function POST(request: NextRequest) {
  try {
    const ips: string[] = await request.json();

    if (!Array.isArray(ips) || ips.length === 0) {
      return NextResponse.json({ error: "Invalid IPs array" }, { status: 400 });
    }

    // Limit to 100 IPs (ip-api batch limit)
    const limitedIPs = ips.slice(0, 100);

    const response = await fetch(
      "http://ip-api.com/batch?fields=status,query,country,countryCode,region,regionName,city,lat,lon,isp,org",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limitedIPs),
      }
    );

    if (!response.ok) {
      throw new Error(`ip-api returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Geo API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geolocation data" },
      { status: 500 }
    );
  }
}
