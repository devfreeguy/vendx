import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 shrink-0">
      <div className="relative w-6 sm:w-7 h-6 sm:h-7">
        <Image
          src="/assets/images/icon.svg"
          alt="VendX"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
        VendX
      </span>
    </Link>
  );
}
