import { cn } from "@/lib/utils";
import Image from "next/image";

interface ShowcaseCardProps {
  src: string;
  alt: string;
  category: string;
  title: string;
  className?: string;
  badgeClassName?: string;
  priority?: boolean;
}

export function ShowcaseCard({
  src,
  alt,
  category,
  title,
  className,
  badgeClassName,
  priority = false,
}: ShowcaseCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group",
        "bg-linear-to-br from-white/5 to-white/0 backdrop-blur-sm",
        className,
      )}
    >
      {/* Background Accent */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700 z-10 drop-shadow-2xl"
        sizes="(max-width: 768px) 80vw, 60vw"
        priority={priority}
      />

      {/* Content Overlay */}
      <div className="absolute top-0 left-0 w-full h-full p-6 flex flex-col justify-end z-20 bg-linear-to-t from-black/80 via-transparent to-transparent">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-2 inline-block backdrop-blur-md border border-white/20 shadow-lg",
              badgeClassName || "bg-primary/80 text-white",
            )}
          >
            {category}
          </span>
          <h3 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
}
