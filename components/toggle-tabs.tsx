"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ToggleTabsProps {
  tabs: { id: string; label: string }[]
  defaultTabId: string
  onChange: (tabId: string) => void
  className?: string
}

export function ToggleTabs({ tabs, defaultTabId, onChange, className }: ToggleTabsProps) {
  return (
    <Tabs defaultValue={defaultTabId} className={cn("w-full", className)} onValueChange={onChange}>
      <TabsList className="grid grid-cols-2 w-full bg-secondary">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="data-[state=active]:bg-accent data-[state=active]:text-primary-foreground text-xs"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} />
      ))}
    </Tabs>
  )
}
