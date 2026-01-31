import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DollarSign, History } from "lucide-react";
import { redirect } from "next/navigation";

export default async function VendorPaymentsPage() {
  const session = await getSession();

  if (!session || !session.userId || session.role !== "VENDOR") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: {
      wallet: {
        include: {
          balances: true,
        },
      },
    },
  });

  const bchBalance = user?.wallet?.balances.find((b) => b.currency === "BCH");
  const available = bchBalance?.amount || 0;
  const locked = bchBalance?.locked || 0;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {available.toFixed(8)} BCH
              </div>
              <p className="text-xs text-muted-foreground">
                Available for withdrawal
              </p>
              <div className="mt-4">
                <Button className="w-full">Withdraw Funds</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Locked Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locked.toFixed(8)} BCH</div>
              <p className="text-xs text-muted-foreground">
                Held in pending orders
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent incoming and outgoing transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <History className="h-8 w-8 mb-2 opacity-50" />
              <p>No transactions found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
