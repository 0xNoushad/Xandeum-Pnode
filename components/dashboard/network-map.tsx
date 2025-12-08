"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PNode } from "@/lib/xandeum"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface NetworkMapProps {
    nodes: PNode[]
}

export function NetworkMap({ nodes }: NetworkMapProps) {
    const data = nodes.map(node => ({
        x: node.coordinates[1], // Longitude
        y: node.coordinates[0], // Latitude
        z: node.storage.used, // Size based on storage
        name: node.location,
        status: node.status
    }));

    return (
        <Card className="col-span-1 lg:col-span-2 rounded-xl border-none shadow-sm flex flex-col">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Global Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <XAxis type="number" dataKey="x" name="Longitude" hide domain={[-180, 180]} />
                        <YAxis type="number" dataKey="y" name="Latitude" hide domain={[-90, 90]} />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Location
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {data.name}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Status
                                                    </span>
                                                    <span className={`font-bold ${data.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {data.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Scatter name="Nodes" data={data} fill="var(--color-primary)">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.status === 'Active' ? 'var(--color-primary)' : 'var(--color-destructive)'} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
                {/* Placeholder for world map bg - in a real app, you'd put a transparent world map image behind the chart */}
                <div className="absolute inset-x-6 inset-y-16 -z-10 opacity-10 pointer-events-none">
                    {/* Simple CSS-only world map approximation or grid could go here */}
                    <svg viewBox="0 0 100 50" className="w-full h-full fill-foreground">
                        <path d="M20,10 Q30,5 40,15 T60,20 T90,10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                </div>
            </CardContent>
        </Card>
    )
}
