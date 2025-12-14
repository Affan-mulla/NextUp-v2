"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Billing = () => {
  return (
    <div className="max-w-6xl space-y-6 px-4 py-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your subscription, payments, and invoices.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 auto-rows-[minmax(140px,auto)] grid-flow-dense">
        {/* CURRENT PLAN */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Current plan</CardTitle>
            <Badge variant="secondary">Free</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You{'\u2019'}re currently on the Free plan.
            </p>

            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/ month</span>
            </div>

            <Separator />

            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Single product launch</li>
              <li>• Public launch pages</li>
              <li>• Community feedback & voting</li>
            </ul>
          </CardContent>
        </Card>

        {/* UPGRADE */}
        <Card className="col-span-1 border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Unlock analytics, private feedback, and priority support.
            </p>

            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">$19.99</span>
              <span className="text-muted-foreground">/ month</span>
            </div>

            <Button className="w-full" variant={"default"}>Upgrade now</Button>
          </CardContent>
        </Card>

        {/* USAGE */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <UsageRow label="Product launches" value="1 / 1" />
            <UsageRow label="Feedback entries" value="Unlimited" />
            <UsageRow label="Team members" value="1" />
          </CardContent>
        </Card>

        {/* PAYMENT METHOD */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">No payment method</p>
              <p className="text-sm text-muted-foreground">
                Add a card to upgrade your plan
              </p>
            </div>
            <Button variant="outline">Add payment method</Button>
          </CardContent>
        </Card>

        {/* INVOICES */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InvoiceRow date="—" amount="—" status="No invoices yet" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const UsageRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const InvoiceRow = ({
  date,
  amount,
  status,
}: {
  date: string;
  amount: string;
  status: string;
}) => (
  <div className="flex items-center justify-between border rounded-lg px-4 py-3">
    <span>{date}</span>
    <span>{amount}</span>
    <span className="text-muted-foreground">{status}</span>
  </div>
);


export default Billing;
