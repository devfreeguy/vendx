import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Store } from "lucide-react";

interface VendorBadgeProps {
  name: string;
  image?: string;
  type: "Platinum" | "Gold" | "Silver" | "New";
  sales: number;
  online?: boolean;
}

export function VendorBadge({
  name,
  image,
  type,
  sales,
  online,
}: VendorBadgeProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-colors group">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            {name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{type} Vendor</span>
            <span>•</span>
            <span>
              {sales >= 1000 ? `${(sales / 1000).toFixed(1)}k` : sales} sales
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {online && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        )}
      </div>
    </div>
  );
}
