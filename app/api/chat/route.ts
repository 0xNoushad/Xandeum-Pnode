import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion, type ChatMessage } from "@/lib/bot/huggingface";
import { buildSystemPrompt, type NetworkStats, type NodeData } from "@/lib/bot/prompts";

export interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
  networkStats?: NetworkStats;
  nodeData?: NodeData;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, history = [], networkStats, nodeData } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(networkStats, nodeData);

    // Construct messages array
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-5), // Keep last 5 messages
      { role: "user", content: message },
    ];

    // Get response from HuggingFace
    const response = await createChatCompletion(messages);

    // Return as plain text (not streaming for simplicity)
    return new Response(response, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    
    return new Response(
      "I'm having trouble right now. Try asking about Xandeum, pNodes, or pods!",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
