import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import categoriesData from "@/data/categories.json";
import { useState } from "react";

interface FilterState {
  category: string | null;
  subCategory: string | null;
  priceRange: [number, number];
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSubCategoryClick = (sub: string) => {
    onFilterChange({
      ...filters,
      subCategory: sub === filters.subCategory ? null : sub,
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
      <div className="space-y-8 pb-10">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Categories
          </h3>
          <div className="space-y-3">
            {categoriesData.map((cat) => (
              <div key={cat.label} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.label}`}
                    checked={filters.category === cat.label}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFilterChange({
                          ...filters,
                          category: cat.label,
                          subCategory: null,
                        });
                        setExpandedCategory(cat.label);
                      } else {
                        onFilterChange({
                          ...filters,
                          category: null,
                          subCategory: null,
                        });
                        setExpandedCategory(null);
                      }
                    }}
                  />
                  <label
                    htmlFor={`cat-${cat.label}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat.label}
                  </label>
                </div>

                {/* Subcategories */}
                {(filters.category === cat.label ||
                  expandedCategory === cat.label) && (
                  <div className="pl-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {cat.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`sub-${item.label}`}
                          checked={filters.subCategory === item.label}
                          onCheckedChange={() =>
                            handleSubCategoryClick(item.label)
                          }
                        />
                        <label
                          htmlFor={`sub-${item.label}`}
                          className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Price Range */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Price Range
          </h3>
          <div className="px-4">
            <Slider
              defaultValue={[0, 1000]}
              max={5000}
              step={10}
              value={filters.priceRange}
              onValueChange={(val) =>
                onFilterChange({
                  ...filters,
                  priceRange: val as [number, number],
                })
              }
              className="mb-4"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}+</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Availability */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Availability
          </h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStock}
              onCheckedChange={(checked) =>
                onFilterChange({ ...filters, inStock: checked as boolean })
              }
            />
            <label
              htmlFor="in-stock"
              className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              In Stock Only
            </label>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
