"use client";

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  "Help me write a function to sort an array",
  "Explain the concept of closures in JavaScript",
  "What are the best practices for React hooks?",
  "How do I implement authentication in Next.js?",
];

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelectPrompt(prompt)}
          className="text-xs text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
