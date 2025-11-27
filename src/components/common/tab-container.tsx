import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabsProps = Omit<
  React.ComponentPropsWithoutRef<typeof Tabs>,
  "value" | "defaultValue" | "onValueChange"
>;
type TabConfig =
  | { label: React.ReactNode; render: () => React.ReactNode }
  | (() => React.ReactNode);

export type TabSet<K extends string = string> = Record<K, TabConfig>;
export type TabContainerProps<
  T extends TabSet<K>,
  K extends string = string,
> = TabsProps & {
  tabs: T;
  defaultTab: K;
  onTabChange?: (tab: K) => void;
};

export function TabContainer<T extends TabSet<K>, K extends string>({
  tabs,
  defaultTab,
  onTabChange,
  children,
  className,
  ...props
}: TabContainerProps<T, K>) {
  const tabKeys = Object.keys(tabs) as K[];

  return (
    <Tabs
      {...props}
      defaultValue={defaultTab}
      onValueChange={(value) => onTabChange?.(value as K)}
      className={cn("w-full flex-col justify-start gap-6", className)}
    >
      <div className="flex justify-between gap-8">
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          {tabKeys.map((tabKey) => {
            let label: React.ReactNode = tabKey;
            if (typeof tabs[tabKey] !== "function") {
              label = tabs[tabKey].label;
            }

            return (
              <TabsTrigger key={tabKey} value={tabKey}>
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <div className='flex gap-2 justify-end'>{children}</div>
      </div>
      {tabKeys.map((tabKey) => (
        <TabsContent
          key={tabKey}
          value={tabKey}
          className="relative flex flex-col gap-4 overflow-auto"
          children={
            typeof tabs[tabKey] === "function"
              ? tabs[tabKey]()
              : tabs[tabKey].render()
          }
        />
      ))}
    </Tabs>
  );
}
