/**
 * Property Test: Chat State Toggle Consistency
 * 
 * Property 1: Chat State Toggle Consistency
 * For any sequence of open/close operations on the chat interface, the isOpen 
 * state should accurately reflect the current visibility, and closing then 
 * reopening should preserve the messages array.
 * 
 * Validates: Requirements 1.1, 1.5
 * Feature: pnode-bot-and-cleanup, Property 1: Chat State Toggle Consistency
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  ChatState,
  Message,
  toggleChat,
  openChat,
  closeChat,
  addMessage,
  setLoading,
  setError,
  createUserMessage,
  createAssistantMessage,
} from "./state";

// Arbitrary for Message
const messageArb: fc.Arbitrary<Message> = fc.record({
  id: fc.uuid(),
  role: fc.constantFrom("user", "assistant") as fc.Arbitrary<"user" | "assistant">,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  timestamp: fc.date(),
});

// Arbitrary for ChatState
const chatStateArb: fc.Arbitrary<ChatState> = fc.record({
  isOpen: fc.boolean(),
  messages: fc.array(messageArb, { maxLength: 20 }),
  isLoading: fc.boolean(),
  error: fc.option(fc.string(), { nil: null }),
});

// Arbitrary for toggle operations
type ToggleOp = "toggle" | "open" | "close";
const toggleOpArb: fc.Arbitrary<ToggleOp> = fc.constantFrom("toggle", "open", "close");

describe("Property 1: Chat State Toggle Consistency", () => {
  /**
   * Property: Toggle twice returns to original isOpen state
   */
  it("should return to original isOpen state after toggling twice", () => {
    fc.assert(
      fc.property(chatStateArb, (state: ChatState) => {
        const afterFirstToggle = toggleChat(state);
        const afterSecondToggle = toggleChat(afterFirstToggle);
        
        expect(afterSecondToggle.isOpen).toBe(state.isOpen);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Toggle changes isOpen state
   */
  it("should change isOpen state on toggle", () => {
    fc.assert(
      fc.property(chatStateArb, (state: ChatState) => {
        const toggled = toggleChat(state);
        
        expect(toggled.isOpen).toBe(!state.isOpen);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Messages are preserved across any sequence of toggle operations
   */
  it("should preserve messages across any sequence of toggle operations", () => {
    fc.assert(
      fc.property(
        chatStateArb,
        fc.array(toggleOpArb, { minLength: 1, maxLength: 20 }),
        (initialState: ChatState, operations: ToggleOp[]) => {
          let state = initialState;
          
          for (const op of operations) {
            switch (op) {
              case "toggle":
                state = toggleChat(state);
                break;
              case "open":
                state = openChat(state);
                break;
              case "close":
                state = closeChat(state);
                break;
            }
          }
          
          // Messages should be unchanged
          expect(state.messages).toEqual(initialState.messages);
          expect(state.messages.length).toBe(initialState.messages.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Open always results in isOpen = true
   */
  it("should always set isOpen to true when opening", () => {
    fc.assert(
      fc.property(chatStateArb, (state: ChatState) => {
        const opened = openChat(state);
        
        expect(opened.isOpen).toBe(true);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Close always results in isOpen = false
   */
  it("should always set isOpen to false when closing", () => {
    fc.assert(
      fc.property(chatStateArb, (state: ChatState) => {
        const closed = closeChat(state);
        
        expect(closed.isOpen).toBe(false);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Close then open preserves messages
   */
  it("should preserve messages when closing then reopening", () => {
    fc.assert(
      fc.property(chatStateArb, (state: ChatState) => {
        const closed = closeChat(state);
        const reopened = openChat(closed);
        
        expect(reopened.messages).toEqual(state.messages);
        expect(reopened.isOpen).toBe(true);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Adding a message increases message count by 1
   */
  it("should increase message count by 1 when adding a message", () => {
    fc.assert(
      fc.property(chatStateArb, messageArb, (state: ChatState, message: Message) => {
        const newState = addMessage(state, message);
        
        expect(newState.messages.length).toBe(state.messages.length + 1);
        expect(newState.messages[newState.messages.length - 1]).toEqual(message);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Loading state clears error
   */
  it("should clear error when setting loading to true", () => {
    fc.assert(
      fc.property(chatStateArb, (state: ChatState) => {
        const loading = setLoading(state, true);
        
        expect(loading.isLoading).toBe(true);
        expect(loading.error).toBeNull();
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Setting error clears loading state
   */
  it("should clear loading when setting error", () => {
    fc.assert(
      fc.property(chatStateArb, fc.string(), (state: ChatState, errorMsg: string) => {
        const withError = setError(state, errorMsg);
        
        expect(withError.error).toBe(errorMsg);
        expect(withError.isLoading).toBe(false);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Created user messages have role "user"
   */
  it("should create user messages with role user", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (content: string) => {
        const message = createUserMessage(content);
        
        expect(message.role).toBe("user");
        expect(message.content).toBe(content);
        expect(message.id).toContain("user-");
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Created assistant messages have role "assistant"
   */
  it("should create assistant messages with role assistant", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (content: string) => {
        const message = createAssistantMessage(content);
        
        expect(message.role).toBe("assistant");
        expect(message.content).toBe(content);
        expect(message.id).toContain("assistant-");
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
