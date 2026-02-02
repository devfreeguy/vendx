import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SectionProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  action,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`py-24 ${className}`}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-12 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
            )}
          </div>
          {action && (
            <Link
              href={action.href}
              className="text-sm sm:text-base group flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium whitespace-nowrap"
            >
              {action.label}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}
