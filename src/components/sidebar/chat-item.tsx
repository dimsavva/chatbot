"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  isCollapsed?: boolean;
}

export function ChatItem({
  id,
  title,
  isActive,
  onClick,
  onDelete,
  isCollapsed = false,
}: ChatItemProps) {
  if (isCollapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 mx-auto"
        onClick={onClick}
        title={title}
      >
        <span className="text-xs font-medium">{title.charAt(0).toUpperCase()}</span>
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "hover:bg-sidebar-accent/50"
      )}
      onClick={onClick}
    >
      <span className="truncate flex-1">{title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
