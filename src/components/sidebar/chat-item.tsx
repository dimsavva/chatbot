"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  isCollapsed?: boolean;
}

export function ChatItem({ id, title, isActive, onClick, onDelete, isCollapsed }: ChatItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground",
        isCollapsed && "justify-center"
      )}
      onClick={onClick}
      title={title}
    >
      <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate text-sm">{title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </div>
  );
}
