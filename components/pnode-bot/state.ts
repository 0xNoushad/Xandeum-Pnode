/**
 * Chat State Management
 * Pure functions for managing chat state, enabling property-based testing
 */

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export const INITIAL_STATE: ChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
};

/**
 * Toggle chat open/closed state
 * Preserves messages when toggling
 */
export function toggleChat(state: ChatState): ChatState {
  return {
    ...state,
    isOpen: !state.isOpen,
  };
}

/**
 * Open the chat
 */
export function openChat(state: ChatState): ChatState {
  return {
    ...state,
    isOpen: true,
  };
}

/**
 * Close the chat
 */
export function closeChat(state: ChatState): ChatState {
  return {
    ...state,
    isOpen: false,
  };
}

/**
 * Add a message to the chat
 */
export function addMessage(state: ChatState, message: Message): ChatState {
  return {
    ...state,
    messages: [...state.messages, message],
  };
}

/**
 * Update a message by ID
 */
export function updateMessage(
  state: ChatState,
  id: string,
  content: string
): ChatState {
  return {
    ...state,
    messages: state.messages.map((m) =>
      m.id === id ? { ...m, content } : m
    ),
  };
}

/**
 * Set loading state
 */
export function setLoading(state: ChatState, isLoading: boolean): ChatState {
  return {
    ...state,
    isLoading,
    error: isLoading ? null : state.error,
  };
}

/**
 * Set error state
 */
export function setError(state: ChatState, error: string | null): ChatState {
  return {
    ...state,
    error,
    isLoading: false,
  };
}

/**
 * Create a user message
 */
export function createUserMessage(content: string): Message {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role: "user",
    content,
    timestamp: new Date(),
  };
}

/**
 * Create an assistant message
 */
export function createAssistantMessage(content: string): Message {
  return {
    id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role: "assistant",
    content,
    timestamp: new Date(),
  };
}
