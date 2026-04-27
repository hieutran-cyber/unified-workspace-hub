"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn nhiều...",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  const selectedOptions = normalizedOptions.filter((opt) => value.includes(opt.value));

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitive.Trigger asChild>
        <div
          className={cn(
            "w-full min-h-[44px] p-2 rounded-xl border border-border/60 bg-background/30 text-sm flex flex-wrap items-center gap-1.5 hover:bg-background/50 transition-all focus-within:ring-1 focus-within:ring-primary/30 outline-none drop-shadow-sm cursor-pointer",
            isOpen && "ring-1 ring-primary/30 border-primary/40 bg-background/50",
            className
          )}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 flex-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 group transition-all hover:bg-primary/20"
                >
                  {option.label}
                  <X
                    className="h-2.5 w-2.5 cursor-pointer hover:text-red-500"
                    onClick={(e) => removeOption(e, option.value)}
                  />
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground/50 font-medium px-2 flex-1">
              {placeholder}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200 mr-2 shrink-0",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          className="z-[999] w-[var(--radix-popover-trigger-width)] p-1.5 rounded-2xl border border-border/50 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top overflow-hidden"
        >
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {normalizedOptions.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.value);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 last:mb-0",
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center transition-all",
                      isSelected ? "bg-primary border-primary" : "border-border/60 bg-background"
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {option.label}
                  </div>
                </button>
              );
            })}
            {normalizedOptions.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground italic">
                Không có dữ liệu
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
