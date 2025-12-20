import { NextResponse } from "next/server";

const CREDITS_API = "https://podcredits.xandeum.network/api/pods-credits";

export async function GET() {
    try {
        const response = await fetch(CREDITS_API, {
            next: { revalidate: 60 }
        });
        
        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch credits", status: "error" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("[PodCredits API] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch credits", status: "error" },
            { status: 500 }
        );
    }
}
