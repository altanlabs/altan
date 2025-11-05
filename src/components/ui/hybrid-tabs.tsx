"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HybridTabItem {
  value: string;
  icon: React.ReactNode;
  label: string;
}

interface HybridTabsProps {
  items: HybridTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function HybridTabs({
  items,
  value,
  onValueChange,
  className,
}: HybridTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn("w-auto", className)}>
      <TabsList className="inline-flex w-auto h-auto justify-center gap-0.5 bg-background/60 backdrop-blur-md p-0.5 rounded-lg border shadow-sm">
        {items.map((item) => {
          const isActive = value === item.value;
          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className={cn(
                "relative flex items-center gap-1.5 rounded-md transition-all px-2 py-1 h-auto min-h-0",
                "data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
                "hover:bg-primary/5"
              )}
            >
              <span className="shrink-0 flex items-center">{item.icon}</span>
              <AnimatePresence mode="wait">
                {isActive && (
                  <m.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden whitespace-nowrap text-xs font-medium"
                  >
                    {item.label}
                  </m.span>
                )}
              </AnimatePresence>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

