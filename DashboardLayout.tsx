import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FloatingChatbot } from "@/components/FloatingChatbot";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-14 glass border-b border-border/50 flex items-center px-4 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1" />
          </header>

          {/* Content */}
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>

        <FloatingChatbot />
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
