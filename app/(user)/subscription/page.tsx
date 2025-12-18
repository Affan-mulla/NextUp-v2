import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

const FEATURES = [
  { id: "launches", label: "Product launches", free: "Single product", pro: "Unlimited" },
  { id: "follow", label: "Follow products & launches", free: true, pro: true },
  { id: "feedback", label: "Post feedback, ideas, and bugs", free: true, pro: true },
  { id: "comments", label: "Comments & discussions", free: true, pro: true },
  { id: "reputation", label: "Profile & reputation score", free: true, pro: true },
  { id: "votes", label: "Vote on ideas and feedback", free: true, pro: true },
  { id: "public_pages", label: "Public launch pages", free: true, pro: true },
  { id: "email_notifications", label: "Email notifications", free: true, pro: true },

  { id: "dashboard", label: "Advanced feedback dashboard", free: false, pro: true },
  { id: "private", label: "Private feedback & internal notes", free: false, pro: true },
  { id: "analytics", label: "Launch analytics & insights", free: false, pro: true },
  { id: "pinned", label: "Pinned feedback & priority tagging", free: false, pro: true },
  { id: "branding", label: "Custom product branding", free: false, pro: true },
  { id: "early", label: "Early access to new features", free: false, pro: true },
  { id: "support", label: "Priority support", free: false, pro: true },
  { id: "export", label: "Export feedback & analytics", free: false, pro: true },
];

function FeatureRow({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div
        className={clsx(
          "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border",
          enabled
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-muted-foreground"
        )}
      >
        <HugeiconsIcon
          icon={enabled ? Tick01Icon : Cancel01Icon}
          className="h-3 w-3"
        />
      </div>
      <span
        className={clsx(
          enabled ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function PricingColumn({
  title,
  price,
  cta,
  highlighted,
  planKey,
}: {
  title: string;
  price: string;
  cta: React.ReactNode;
  highlighted?: boolean;
  planKey: "free" | "pro";
}) {
  return (
    <div
      className={clsx(
        "relative flex w-full max-w-sm flex-col rounded-2xl border bg-card p-6",
        highlighted
          ? "border-primary/20 shadow-[0_0_0_1px_rgba(245,64,0,1),0_20px_40px_-20px_rgba(245,64,0,.6)]"
          : "border-border shadow-lg"
      )}  
    >
      {highlighted && (
        <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Best value
        </span>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          For individuals and small teams
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className="pb-1 text-sm text-muted-foreground">/ month</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          per user, billed monthly
        </p>
      </div>

      {/* CTA */}
      <div className="mb-8">{cta}</div>

      {/* Features */}
      <div className="flex flex-col gap-3">
        {FEATURES.map((f) => (
          <FeatureRow
            key={f.id}
            enabled={Boolean(f[planKey])}
            label={f.label}
          />
        ))}
      </div>
    </div>
  );
}

export default function PricingCard() {
  return (
    <div className="mx-auto px-4 py-6 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
      <PricingColumn
        title="Free"
        price="$0"
        planKey="free"
        cta={
          <Button disabled variant="secondary" className="w-full">
            Current plan
          </Button>
        }
      />

      <PricingColumn
        title="Pro"
        price="$19.99"
        planKey="pro"
        highlighted
        cta={
          <Button className="w-full" variant={"default"}>
            Get started
          </Button>
        }
      />
    </div>
  );
}
