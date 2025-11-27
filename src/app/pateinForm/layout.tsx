import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <div className="relative min-h-screen bg-white">
      <div 
        className="absolute top-0 left-0 right-0 h-[50vh] rounded-b-[40%] bg-[#E3F6FF]" 
      >
      </div>
      <div className="relative z-10 mx-auto  pt-[2vh] pb-[2vh] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
