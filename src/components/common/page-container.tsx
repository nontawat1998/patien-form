import React from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export type PageContainerProps = {
  header:
    | string
    | {
        extra?: React.ReactNode;
        children?: React.ReactNode;
      };
  children: React.ReactNode;
};

export function PageContainer(props: PageContainerProps) {
  const { header, children } = props;

  return (
    <SidebarInset>
      <div className="@container/main flex flex-1 flex-col gap-0">
        <div className="flex flex-col gap-4 pt-4 pb-32 md:gap-6 md:py-6 bg-transparent">
          {children}
        </div>
      </div>
    </SidebarInset>
  );
}

type PageHeaderProps = {
  children: React.ReactNode;
  extra?: React.ReactNode;
};

