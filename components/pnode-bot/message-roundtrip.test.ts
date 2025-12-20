/**
 * Property Test: Message Round-Trip Integrity
 * 
 * Property 2: Message Round-Trip Integrity
 * For any valid user message sent to the bot, the message should appear in the 
 * chat history, trigger an API call, and the response should be appended to 
 * the messages array with proper formatting.
 * 
 * Validates: Requirements 1.3, 1.4, 2.4
 * Feature: pnode-bot-and-cleanup, Property 2: Message Round-Trip Integrity
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  ChatState,
  Message,
  addMessage,
  updateMessage,
  setLoading,
  setError,
  createUserMessage,
  createAssistantMessage,
} from "./state";

// Arbitrary for valid user message content (non-empty, reasonable length)
const validMessageContentArb = fc.string({ minLength: 1, maxLength: 1000 })
  .filter(s => s.trim().length > 0);

// Arbitrary for Message
const messageArb: fc.Arbitrary<Message> = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom("user", "assistant") as fc.Arbitrary<"user" | "assistant">,
  content: validMessageContentArb,
  timestamp: fc.date(),
});

// Arbitrary for ChatState with messages
const chatStateWithMessagesArb: fc.Arbitrary<ChatState> = fc.record({
  isOpen: fc.constant(true), // Chat must be open to send messages
  messages: fc.array(messageArb, { minLength: 0, maxLength: 10 }),
  isLoading: fc.constant(false), // Not loading to send new message
  error: fc.constant(null),
});

/**
 * Simulates the message send flow:
 * 1. User sends message -> added to history
 * 2. Loading state set to true
 * 3. API response received -> assistant message added
 * 4. Loading state set to false
 */
function simulateMessageRoundTrip(
  state: ChatState,
  userContent: string,
  assistantContent: string
): { finalState: ChatState; userMessage: Message; assistantMessage: Message } {
  // Step 1: Create and add user message
  const userMessage = createUserMessage(userContent);
  let currentState = addMessage(state, userMessage);
  
  // Step 2: Set loading state
  currentState = setLoading(currentState, true);
  
  // Step 3: Create and add assistant message (simulating API response)
  const assistantMessage = createAssistantMessage(assistantContent);
  currentState = addMessage(currentState, assistantMessage);
  
  // Step 4: Clear loading state
  currentState = setLoading(currentState, false);
  
  return { finalState: currentState, userMessage, assistantMessage };
}

describe("Property 2: Message Round-Trip Integrity", () => {
  /**
   * Property: User message appears in chat history after sending
   */
  it("should add user message to chat history", () => {
    fc.assert(
      fc.property(
        chatStateWithMessagesArb,
        validMessageContentArb,
        (state: ChatState, content: string) => {
          const userMessage = createUserMessage(content);
          const newState = addMessage(state, userMessage);
          
          // User message should be in history
          expect(newState.messages).toContainEqual(userMessage);
          expect(newState.messages.length).toBe(state.messages.length + 1);
          
          // Message should have correct role and content
          const lastMessage = newState.messages[newState.messages.length - 1];
          expect(lastMessage.role).toBe("user");
          expect(lastMessage.content).toBe(content);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Assistant response is appended after user message
   */
  it("should append assistant response after user message", () => {
    fc.assert(
      fc.property(
        chatStateWithMessagesArb,
        validMessageContentArb,
        validMessageContentArb,
        (state: ChatState, userContent: string, assistantContent: string) => {
          const { finalState, userMessage, assistantMessage } = simulateMessageRoundTrip(
            state,
            userContent,
            assistantContent
          );
          
          // Both messages should be in history
          expect(finalState.messages).toContainEqual(userMessage);
          expect(finalState.messages).toContainEqual(assistantMessage);
          
          // Message count should increase by 2
          expect(finalState.messages.length).toBe(state.messages.length + 2);
          
          // User message should come before assistant message
          const userIndex = finalState.messages.findIndex(m => m.id === userMessage.id);
          const assistantIndex = finalState.messages.findIndex(m => m.id === assistantMessage.id);
          expect(userIndex).toBeLessThan(assistantIndex);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Message content is preserved exactly
   */
  it("should preserve message content exactly through round-trip", () => {
    fc.assert(
      fc.property(
        chatStateWithMessagesArb,
        validMessageContentArb,
        validMessageContentArb,
        (state: ChatState, userContent: string, assistantContent: string) => {
          const { finalState, userMessage, assistantMessage } = simulateMessageRoundTrip(
            state,
            userContent,
            assistantContent
          );
          
          // Find messages in final state
          const foundUser = finalState.messages.find(m => m.id === userMessage.id);
          const foundAssistant = finalState.messages.find(m => m.id === assistantMessage.id);
          
          // Content should be exactly preserved
          expect(foundUser?.content).toBe(userContent);
          expect(foundAssistant?.content).toBe(assistantContent);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Loading state is false after round-trip completes
   */
  it("should have loading false after round-trip completes", () => {
    fc.assert(
      fc.property(
        chatStateWithMessagesArb,
        validMessageContentArb,
        validMessageContentArb,
        (state: ChatState, userContent: string, assistantContent: string) => {
          const { finalState } = simulateMessageRoundTrip(
            state,
            userContent,
            assistantContent
          );
          
          expect(finalState.isLoading).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Previous messages are preserved during round-trip
   */
  it("should preserve all previous messages during round-trip", () => {
    fc.assert(
      fc.property(
        chatStateWithMessagesArb,
        validMessageContentArb,
        validMessageContentArb,
        (state: ChatState, userContent: string, assistantContent: string) => {
          const { finalState } = simulateMessageRoundTrip(
            state,
            userContent,
            assistantContent
          );
          
          // All original messages should still be present
          for (const originalMessage of state.messages) {
            expect(finalState.messages).toContainEqual(originalMessage);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Message IDs are unique
   */
  it("should generate unique message IDs", () => {
    fc.assert(
      fc.property(
        fc.array(validMessageContentArb, { minLength: 2, maxLength: 20 }),
        (contents: string[]) => {
          const messages = contents.map(c => createUserMessage(c));
          const ids = messages.map(m => m.id);
          const uniqueIds = new Set(ids);
          
          // All IDs should be unique
          expect(uniqueIds.size).toBe(ids.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Messages have valid timestamps
   */
  it("should create messages with valid timestamps", () => {
    fc.assert(
      fc.property(validMessageContentArb, (content: string) => {
        const before = new Date();
        const message = createUserMessage(content);
        const after = new Date();
        
        // Timestamp should be between before and after
        expect(message.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(message.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Streaming updates preserve message integrity
   */
  it("should preserve message integrity during streaming updates", () => {
    fc.assert(
      fc.property(
        chatStateWithMessagesArb,
        validMessageContentArb,
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
        (state: ChatState, userContent: string, chunks: string[]) => {
          // Add user message
          const userMessage = createUserMessage(userContent);
          let currentState = addMessage(state, userMessage);
          
          // Add empty assistant message (start of streaming)
          const assistantMessage = createAssistantMessage("");
          currentState = addMessage(currentState, assistantMessage);
          
          // Simulate streaming by updating message content
          let accumulatedContent = "";
          for (const chunk of chunks) {
            accumulatedContent += chunk;
            currentState = updateMessage(currentState, assistantMessage.id, accumulatedContent);
          }
          
          // Final content should be all chunks concatenated
          const finalAssistant = currentState.messages.find(m => m.id === assistantMessage.id);
          expect(finalAssistant?.content).toBe(chunks.join(""));
          
          // User message should be unchanged
          const finalUser = currentState.messages.find(m => m.id === userMessage.id);
          expect(finalUser?.content).toBe(userContent);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error state doesn't corrupt message history
   */
  it("should preserve message history when error occurs", () => {
    fc.assert(
      fc.property(
        chatStateWithMessagesArb,
        validMessageContentArb,
        fc.string({ minLength: 1 }),
        (state: ChatState, userContent: string, errorMsg: string) => {
          // Add user message
          const userMessage = createUserMessage(userContent);
          let currentState = addMessage(state, userMessage);
          
          // Set loading
          currentState = setLoading(currentState, true);
          
          // Simulate error
          currentState = setError(currentState, errorMsg);
          
          // User message should still be in history
          expect(currentState.messages).toContainEqual(userMessage);
          
          // All original messages should be preserved
          for (const originalMessage of state.messages) {
            expect(currentState.messages).toContainEqual(originalMessage);
          }
          
          // Error should be set
          expect(currentState.error).toBe(errorMsg);
          expect(currentState.isLoading).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
