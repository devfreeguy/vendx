"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import { Calendar, Eye, MoreHorizontal, Search, User } from "lucide-react";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
// import { format } from "date-fns";

export interface DashboardOrder {
  id: string;
  status: string;
  createdAt: string;
  customer: string;
  customerEmail: string;
  itemsCount: number;
  total: number;
  items: {
    id: string;
    title: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

interface OrdersTableProps {
  orders: DashboardOrder[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "SHIPPED":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "COMPLETED":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters (Optional, can be hidden if simplified view needed) */}
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-2 rounded-xl border border-border/40">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10 h-10 bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-5 sm:w-auto">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="PAID">Paid</TabsTrigger>
            <TabsTrigger value="SHIPPED">Shipped</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <ScrollArea className="w-full whitespace-nowrap">
          <Table className="min-w-200">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-muted/30">
                <TableHead className="w-32 font-semibold text-xs uppercase tracking-wider pl-6">
                  Order ID
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Items
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">
                  Total
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
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="pl-6 py-4">
                      <span className="font-mono text-xs">
                        {order.id.substring(0, 8)}...
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 font-medium text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {order.customer}
                        </div>
                        <div className="text-xs text-muted-foreground pl-5.5">
                          {order.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.itemsCount} item{order.itemsCount !== 1 && "s"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${order.total.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-medium border px-2 py-0.5 ${getStatusColor(order.status)}`}
                      >
                        {order.status}
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Footer/Pagination */}
      <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 rounded-b-xl border-x-0 border-b-0">
        <span className="text-xs text-muted-foreground text-center sm:text-left">
          Showing{" "}
          <strong>
            {Math.min(
              (currentPage - 1) * ITEMS_PER_PAGE + 1,
              filteredOrders.length,
            )}
          </strong>{" "}
          to{" "}
          <strong>
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
          </strong>{" "}
          of <strong>{filteredOrders.length}</strong> orders
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs bg-background hover:bg-muted disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs bg-background hover:bg-muted disabled:opacity-50"
            disabled={currentPage * ITEMS_PER_PAGE >= filteredOrders.length}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
