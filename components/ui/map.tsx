"use client";

import { memo } from "react";
import { GeoJsonMap } from "@/components/ui/geojson-map";

interface Location {
    lat: number;
    lng: number;
    label: string;
    count: number;
}

interface MapProps {
    locations: Location[];
    dotColor?: string;
}

export const WorldMap = memo(function WorldMap({
    locations = [],
    dotColor = "#10b981",
}: MapProps) {
    // Convert locations to markers, filter invalid
    const markers = locations
        .filter(loc => loc.label !== "Unknown, Unknown" && loc.lat !== 0 && loc.lng !== 0)
        .map(loc => ({
            lat: loc.lat,
            lng: loc.lng,
            size: Math.min(1.2, 0.4 + loc.count * 0.15),
            label: loc.label,
            count: loc.count,
        }));

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg">
            <GeoJsonMap 
                markers={markers} 
                markerColor={dotColor}
                showLabel={false}
            />
        </div>
    );
});
