"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit2,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

import { Product } from "@prisma/client";

// No change needed as Product type from Prisma already has optional discountPrice after previous schema update? Wait, user asked to update ProductTable too.
// I need to check schema again or assume it was added.
// In step 765 schema.prisma showed:
// 34:     price         Float
// 35:     discountPrice Float?
// So Product type has it.
// I just need to update the table cell for price.

// ... existing imports

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-2 rounded-xl border border-border/40">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 h-10 bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 border-border/50 bg-background text-muted-foreground hover:text-foreground flex-1 sm:flex-none"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            size="sm"
            className="h-10 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 gap-2 flex-1 sm:flex-none"
            asChild
          >
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <ScrollArea className="w-full whitespace-nowrap">
          <Table className="min-w-200">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/30">
                <TableHead className="w-20 font-semibold text-xs uppercase tracking-wider pl-6">
                  Image
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Product Info
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Price
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Stock
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-border hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="h-10 w-10 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary/50" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground text-sm whitespace-nowrap">
                      {product.title}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
                      {product.sku}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-foreground whitespace-nowrap">
                      {product.discountPrice &&
                      product.discountPrice < product.price ? (
                        <div className="flex flex-col">
                          <span>${product.discountPrice.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span>${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          product.stock === 0
                            ? "bg-red-500"
                            : product.stock < 10
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      />
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} units`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-normal border-0 px-2 py-0.5 text-xs whitespace-nowrap ${
                        product.stock > 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {product.stock > 0 ? "Active" : "OOS"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="cursor-pointer gap-2 flex items-center w-full"
                          >
                            <Edit2 className="h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Footer/Pagination */}
        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20">
          <span className="text-xs text-muted-foreground text-center sm:text-left">
            Showing <strong>{products.length}</strong> product
            {products.length !== 1 && "s"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-background hover:bg-muted disabled:opacity-50"
              disabled
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-background hover:bg-muted disabled:opacity-50"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
