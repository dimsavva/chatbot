export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "chatbot-chats";
const CURRENT_CHAT_KEY = "chatbot-current-chat";
const SELECTED_MODEL_KEY = "chatbot-selected-model";

export interface Model {
  id: string;
  name: string;
  owned_by?: string;
}

export const DEFAULT_MODEL = "llama-3.3-70b";

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate title from first message
export function generateTitle(content: string): string {
  const maxLength = 30;
  const title = content.trim().split("\n")[0];
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + "...";
}

// Get all chats from localStorage
export function getChats(): Chat[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save all chats to localStorage
export function saveChats(chats: Chat[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

// Create a new chat
export function createChat(model: string = DEFAULT_MODEL): Chat {
  const chat: Chat = {
    id: generateId(),
    title: "New Chat",
    messages: [],
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const chats = getChats();
  chats.unshift(chat);
  saveChats(chats);
  setCurrentChatId(chat.id);
  return chat;
}

// Get a single chat by ID
export function getChat(id: string): Chat | undefined {
  const chats = getChats();
  return chats.find((chat) => chat.id === id);
}

// Update a chat
export function updateChat(id: string, updates: Partial<Chat>): Chat | undefined {
  const chats = getChats();
  const index = chats.findIndex((chat) => chat.id === id);
  if (index === -1) return undefined;

  chats[index] = {
    ...chats[index],
    ...updates,
    updatedAt: Date.now(),
  };
  saveChats(chats);
  return chats[index];
}

// Add a message to a chat
export function addMessage(chatId: string, message: Message): Chat | undefined {
  const chat = getChat(chatId);
  if (!chat) return undefined;

  const messages = [...chat.messages, message];
  const updates: Partial<Chat> = { messages };

  // Update title if this is the first user message
  if (message.role === "user" && chat.messages.length === 0) {
    updates.title = generateTitle(message.content);
  }

  return updateChat(chatId, updates);
}

// Update the last message in a chat (for streaming)
export function updateLastMessage(chatId: string, content: string): Chat | undefined {
  const chat = getChat(chatId);
  if (!chat || chat.messages.length === 0) return undefined;

  const messages = [...chat.messages];
  messages[messages.length - 1] = {
    ...messages[messages.length - 1],
    content,
  };

  return updateChat(chatId, { messages });
}

// Delete a chat
export function deleteChat(id: string): void {
  const chats = getChats();
  const filtered = chats.filter((chat) => chat.id !== id);
  saveChats(filtered);

  // Clear current chat if it was deleted
  if (getCurrentChatId() === id) {
    setCurrentChatId(null);
  }
}

// Get current chat ID
export function getCurrentChatId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_CHAT_KEY);
}

// Set current chat ID
export function setCurrentChatId(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(CURRENT_CHAT_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_CHAT_KEY);
  }
}

// Get selected model
export function getSelectedModel(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL;
  return localStorage.getItem(SELECTED_MODEL_KEY) || DEFAULT_MODEL;
}

// Set selected model
export function setSelectedModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SELECTED_MODEL_KEY, model);
}

// Group chats by time period
export function groupChatsByTime(chats: Chat[]): {
  today: Chat[];
  yesterday: Chat[];
  previous7Days: Chat[];
  previous30Days: Chat[];
  older: Chat[];
} {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - oneDay;
  const sevenDaysAgo = today - 7 * oneDay;
  const thirtyDaysAgo = today - 30 * oneDay;

  return {
    today: chats.filter((c) => c.updatedAt >= today),
    yesterday: chats.filter((c) => c.updatedAt >= yesterday && c.updatedAt < today),
    previous7Days: chats.filter((c) => c.updatedAt >= sevenDaysAgo && c.updatedAt < yesterday),
    previous30Days: chats.filter((c) => c.updatedAt >= thirtyDaysAgo && c.updatedAt < sevenDaysAgo),
    older: chats.filter((c) => c.updatedAt < thirtyDaysAgo),
  };
}
