"use client";

import { Sparkles } from "lucide-react";

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS = [
  {
    title: "Help me study",
    description: "vocabulary for a college entrance exam",
    prompt: "Help me study vocabulary for a college entrance exam. Give me 10 important words with definitions and example sentences.",
  },
  {
    title: "Show me a code snippet",
    description: "of a website's sticky header",
    prompt: "Show me a code snippet for implementing a sticky header on a website using HTML, CSS, and JavaScript.",
  },
  {
    title: "Give me ideas",
    description: "for what to do with my kids' art",
    prompt: "Give me creative ideas for what to do with my kids' artwork. I want to preserve and display their creations in meaningful ways.",
  },
];

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Suggested</span>
      </div>
      <div className="space-y-2">
        {PROMPTS.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
