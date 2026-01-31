"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { ModalProvider } from "./ModalContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponsiveModalProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function ResponsiveModal({
  children,
  title,
  description,
}: ResponsiveModalProps) {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const open = true;

  const onOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl bg-card">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className={description ? "" : "sr-only"}>
              {description || title}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] pr-4">
            <ModalProvider value={true}>{children}</ModalProvider>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] p-0 gap-0 rounded-t-xl bg-card"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className={description ? "" : "sr-only"}>
            {description || title}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 py-4">
          <ModalProvider value={true}>{children}</ModalProvider>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
