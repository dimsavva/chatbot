"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const MODELS = [
  "llama3.2",
  "llama3.1",
  "mistral",
  "codellama",
  "deepseek-r1",
];

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent gap-1">
          <span className="font-medium text-sm">{selectedModel}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {MODELS.map((model) => (
          <DropdownMenuItem
            key={model}
            onClick={() => onModelChange(model)}
            className={model === selectedModel ? "bg-accent" : ""}
          >
            {model}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
