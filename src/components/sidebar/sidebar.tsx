"use client";

import { useState, useEffect } from "react";
import {
  PenSquare,
  Search,
  StickyNote,
  Layout,
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatItem } from "./chat-item";
import {
  Chat,
  getChats,
  groupChatsByTime,
  deleteChat,
} from "@/lib/chat-store";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  refreshKey?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  refreshKey,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    setChats(getChats());
  }, [refreshKey]);

  const grouped = groupChatsByTime(chats);

  const handleDelete = (chatId: string) => {
    deleteChat(chatId);
    onDeleteChat(chatId);
    setChats(getChats());
  };

  const renderChatGroup = (title: string, chatList: Chat[]) => {
    if (chatList.length === 0) return null;
    return (
      <div className="mb-4">
        {!isCollapsed && (
          <h3 className="px-2 mb-1 text-xs font-medium text-sidebar-foreground/60">
            {title}
          </h3>
        )}
        <div className="space-y-1">
          {chatList.map((chat) => (
            <ChatItem
              key={chat.id}
              id={chat.id}
              title={chat.title}
              isActive={chat.id === currentChatId}
              onClick={() => onSelectChat(chat.id)}
              onDelete={() => handleDelete(chat.id)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className={cn("px-3 flex items-center gap-2 h-[52px] border-b border-sidebar-border", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && (
          <span className="font-semibold text-lg">Open WebUI</span>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-sidebar-accent/50"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5 text-gray-600" />
            ) : (
              <PanelLeftClose className="h-5 w-5 text-gray-600" />
            )}
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className={cn("mb-2", isCollapsed ? "px-2" : "px-3")}>
        <Button
          variant="outline"
          className={cn(
            "bg-sidebar hover:bg-sidebar-accent",
            isCollapsed ? "w-full justify-center px-0" : "w-full justify-start gap-2"
          )}
          onClick={onNewChat}
          title="New Chat"
        >
          <PenSquare className="h-4 w-4 shrink-0" />
          {!isCollapsed && "New Chat"}
        </Button>
      </div>

      {/* Navigation */}
      <div className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
        <Button
          variant="ghost"
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed ? "w-full justify-center px-0" : "w-full justify-start gap-2"
          )}
          title="Search"
        >
          <Search className="h-4 w-4 shrink-0" />
          {!isCollapsed && "Search"}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed ? "w-full justify-center px-0" : "w-full justify-start gap-2"
          )}
          title="Notes"
        >
          <StickyNote className="h-4 w-4 shrink-0" />
          {!isCollapsed && "Notes"}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed ? "w-full justify-center px-0" : "w-full justify-start gap-2"
          )}
          title="Workspace"
        >
          <Layout className="h-4 w-4 shrink-0" />
          {!isCollapsed && "Workspace"}
        </Button>
      </div>

      <Separator className="my-3 bg-sidebar-border" />

      {/* Folders */}
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <Button
            variant="ghost"
            className="w-full justify-between text-xs font-medium text-sidebar-foreground/60 hover:bg-transparent px-2"
          >
            Folders
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Chats */}
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <span className="px-2 text-xs font-medium text-sidebar-foreground/60">
            Chats
          </span>
        </div>
      )}

      {/* Chat History */}
      <ScrollArea className={cn("flex-1", isCollapsed ? "px-2" : "px-3")}>
        {renderChatGroup("Today", grouped.today)}
        {renderChatGroup("Yesterday", grouped.yesterday)}
        {renderChatGroup("Previous 7 days", grouped.previous7Days)}
        {renderChatGroup("Previous 30 days", grouped.previous30Days)}
        {renderChatGroup("Older", grouped.older)}
        {chats.length === 0 && !isCollapsed && (
          <p className="text-sm text-sidebar-foreground/50 px-2">
            No conversations yet
          </p>
        )}
      </ScrollArea>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2")}>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0">
            U
          </div>
          {!isCollapsed && <span className="text-sm font-medium">User</span>}
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps & { isCollapsed?: boolean; onToggleCollapse?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-3 left-3 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent {...props} isCollapsed={false} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden md:flex border-r border-sidebar-border shrink-0 transition-all duration-300 overflow-hidden",
          props.isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent {...props} />
      </div>
    </>
  );
}
