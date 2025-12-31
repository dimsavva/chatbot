export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  model: string;
}

const CHATS_KEY = "chatbot-chats";
const CURRENT_CHAT_KEY = "chatbot-current-chat";
const SELECTED_MODEL_KEY = "chatbot-selected-model";
export const DEFAULT_MODEL = "llama3.2";

export function getChats(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CHATS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function getChat(id: string): Chat | null {
  const chats = getChats();
  return chats.find((c) => c.id === id) || null;
}

export function createChat(model: string): Chat {
  const chats = getChats();
  const newChat: Chat = {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
    model,
  };
  saveChats([newChat, ...chats]);
  return newChat;
}

export function addMessage(chatId: string, message: Message): Chat | null {
  const chats = getChats();
  const chatIndex = chats.findIndex((c) => c.id === chatId);
  if (chatIndex === -1) return null;

  const chat = chats[chatIndex];
  const updatedChat = {
    ...chat,
    title: chat.messages.length === 0 ? message.content.slice(0, 30) : chat.title,
    messages: [...chat.messages, message],
  };

  chats[chatIndex] = updatedChat;
  saveChats(chats);
  return updatedChat;
}

export function updateLastMessage(chatId: string, content: string): Chat | null {
  const chats = getChats();
  const chatIndex = chats.findIndex((c) => c.id === chatId);
  if (chatIndex === -1) return null;

  const chat = chats[chatIndex];
  if (chat.messages.length === 0) return chat;

  const updatedMessages = [...chat.messages];
  updatedMessages[updatedMessages.length - 1] = {
    ...updatedMessages[updatedMessages.length - 1],
    content,
  };

  const updatedChat = { ...chat, messages: updatedMessages };
  chats[chatIndex] = updatedChat;
  saveChats(chats);
  return updatedChat;
}

export function deleteChat(chatId: string) {
  const chats = getChats();
  saveChats(chats.filter((c) => c.id !== chatId));
}

export function getCurrentChatId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_CHAT_KEY);
}

export function setCurrentChatId(id: string | null) {
  if (id) {
    localStorage.setItem(CURRENT_CHAT_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_CHAT_KEY);
  }
}

export function getSelectedModel(): string {
  if (typeof window === "undefined") return DEFAULT_MODEL;
  return localStorage.getItem(SELECTED_MODEL_KEY) || DEFAULT_MODEL;
}

export function setSelectedModel(model: string) {
  localStorage.setItem(SELECTED_MODEL_KEY, model);
}

export function groupChatsByTime(chats: Chat[]) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * dayMs;
  const thirtyDays = 30 * dayMs;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  const yesterdayStart = todayStartMs - dayMs;
  const sevenDaysStart = now - sevenDays;
  const thirtyDaysStart = now - thirtyDays;

  return {
    today: chats.filter((c) => c.createdAt >= todayStartMs),
    yesterday: chats.filter((c) => c.createdAt >= yesterdayStart && c.createdAt < todayStartMs),
    previous7Days: chats.filter((c) => c.createdAt >= sevenDaysStart && c.createdAt < yesterdayStart),
    previous30Days: chats.filter((c) => c.createdAt >= thirtyDaysStart && c.createdAt < sevenDaysStart),
    older: chats.filter((c) => c.createdAt < thirtyDaysStart),
  };
}
