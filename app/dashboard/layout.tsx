import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">{children}</ScrollArea>
        </div>
      </div>
      {modal}
    </div>
  );
}
