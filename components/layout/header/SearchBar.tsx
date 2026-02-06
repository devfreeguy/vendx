import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="hidden md:flex flex-1 max-w-xl mx-auto">
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search for products..."
          className="block w-full rounded-lg border-0 bg-secondary py-2.5 pl-10 pr-4 text-foreground ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
        />
      </div>
    </div>
  );
}
