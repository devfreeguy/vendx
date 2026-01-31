import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminOrdersPage() {
  const session = await getSession();

  // Basic Admin Check (role based)
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { email: true } },
      transactions: { select: { txHash: true, status: true, amount: true } },
    },
    take: 50, // Limit for now
  });

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Order Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total (USD)</TableHead>
                <TableHead>BCH Amount</TableHead>
                <TableHead>BCH Address</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id}
                  </TableCell>
                  <TableCell>{order.buyer.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "PAID"
                          ? "default" // "success" if available, else default (primary) often green-ish or black
                          : order.status === "PENDING"
                            ? "outline"
                            : order.status === "EXPIRED" ||
                                order.status === "CANCELLED"
                              ? "destructive"
                              : "secondary"
                      }
                      className={
                        order.status === "PAID"
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{order.bchAmount.toFixed(8)}</TableCell>
                  <TableCell
                    className="font-mono text-xs max-w-37.5 truncate"
                    title={order.bchAddress}
                  >
                    {order.bchAddress}
                  </TableCell>
                  <TableCell>
                    {order.transactions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {order.transactions.map((tx, i) => (
                          <span
                            key={i}
                            className="text-xs flex items-center gap-1"
                          >
                            <Badge
                              variant="outline"
                              className="text-[10px] h-4 px-1"
                            >
                              {tx.status}
                            </Badge>
                            {tx.amount} BCH
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
