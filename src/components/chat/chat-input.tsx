"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit: (input: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export function ChatInput({ onSubmit, disabled, initialValue = "" }: ChatInputProps) {
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        disabled={disabled}
        className="min-h-[48px] max-h-[200px] pr-12 resize-none rounded-2xl"
        rows={1}
      />
      <Button
        size="icon"
        variant="ghost"
        disabled={disabled || !input.trim()}
        onClick={handleSubmit}
        className="absolute right-2 bottom-2 h-8 w-8"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
