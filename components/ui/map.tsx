"use client";

import { memo } from "react";
import { DottedMap } from "@/components/ui/dotted-map";

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
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-zinc-950">
            {/* Radial gradient overlay */}
            <div 
                className="absolute inset-0 pointer-events-none z-10" 
                style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(9,9,11,0.8) 100%)" }}
            />
            
            {/* Map */}
            <DottedMap 
                markers={markers} 
                markerColor={dotColor}
                dotRadius={0.15}
            />
        </div>
    );
});
