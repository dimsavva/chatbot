"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, User, Loader2, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ModelSelector } from "./model-selector";
import { SuggestedPrompts } from "./suggested-prompts";
import { ChatInput } from "./chat-input";
import {
  Message,
  Chat as ChatType,
  getChat,
  createChat,
  addMessage,
  updateLastMessage,
  getCurrentChatId,
  setCurrentChatId,
  getSelectedModel,
  setSelectedModel,
  DEFAULT_MODEL,
} from "@/lib/chat-store";

const SIDEBAR_COLLAPSED_KEY = "chatbot-sidebar-collapsed";

export function Chat() {
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [selectedModel, setSelectedModelState] = useState(DEFAULT_MODEL);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedModel = getSelectedModel();
    setSelectedModelState(savedModel);

    const currentId = getCurrentChatId();
    if (currentId) {
      const chat = getChat(currentId);
      if (chat) {
        setCurrentChat(chat);
      }
    }

    // Load sidebar state
    const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (savedCollapsed === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages]);

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  const handleModelChange = (model: string) => {
    setSelectedModelState(model);
    setSelectedModel(model);
  };

  const handleNewChat = useCallback(() => {
    const newChat = createChat(selectedModel);
    setCurrentChat(newChat);
    setRefreshKey((k) => k + 1);
  }, [selectedModel]);

  const handleSelectChat = useCallback((chatId: string) => {
    const chat = getChat(chatId);
    if (chat) {
      setCurrentChat(chat);
      setCurrentChatId(chatId);
    }
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setCurrentChatId(null);
    }
    setRefreshKey((k) => k + 1);
  }, [currentChat?.id]);

  const handleSelectPrompt = (prompt: string) => {
    setPendingPrompt(prompt);
  };

  const handleSubmit = async (input: string) => {
    if (!input.trim() || isLoading) return;

    // Create new chat if none exists
    let chat = currentChat;
    if (!chat) {
      chat = createChat(selectedModel);
      setCurrentChat(chat);
      setRefreshKey((k) => k + 1);
    }

    const userMessage: Message = { role: "user", content: input.trim() };

    // Add user message to chat
    const updatedChat = addMessage(chat.id, userMessage);
    if (updatedChat) {
      setCurrentChat(updatedChat);
      setRefreshKey((k) => k + 1);
    }

    setPendingPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...(updatedChat?.messages || [])].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Add empty assistant message
      const chatWithAssistant = addMessage(chat.id, { role: "assistant", content: "" });
      if (chatWithAssistant) {
        setCurrentChat(chatWithAssistant);
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the last message with streaming content
        const updated = updateLastMessage(chat.id, assistantMessage);
        if (updated) {
          setCurrentChat(updated);
        }
      }

      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Error:", error);
      addMessage(chat.id, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      });
      const errorChat = getChat(chat.id);
      if (errorChat) {
        setCurrentChat(errorChat);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const messages = currentChat?.messages || [];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentChatId={currentChat?.id || null}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        refreshKey={refreshKey}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header with model selector */}
        <div className="flex items-center border-b border-border shrink-0 h-[52px] px-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" title="New model">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-[10px] text-muted-foreground pl-3">Set as default</span>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0">
          {isEmpty ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="text-2xl font-semibold">{selectedModel}</span>
                </div>
              </div>
              <ChatInput
                onSubmit={handleSubmit}
                disabled={isLoading}
                initialValue={pendingPrompt}
              />
              <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
            </div>
          ) : (
            // Chat view
            <>
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto"
              >
                <div className="max-w-3xl mx-auto p-4 space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-4">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-muted">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="p-4 border-t border-border shrink-0">
                <ChatInput
                  onSubmit={handleSubmit}
                  disabled={isLoading}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
