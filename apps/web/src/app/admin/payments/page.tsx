"use client";

import React, { useEffect, useState } from "react";
import { CatalogTable, Column, FieldDef } from "@/components/admin/catalog-table";
import { listCoupons, upsertCoupon, deleteCoupon, listPayments } from "@/lib/actions/admin-actions";
import { CreditCard, DollarSign, Tag, Calendar, User, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

type CouponRow = {
  id?: string;
  code: string;
  discountPercentage: number;
  maxUses?: number;
  currentUses: number;
  expiresAt?: string;
  isActive: boolean;
};

type PaymentRow = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  tier: string;
  couponCode?: string | null;
  stripePaymentId?: string | null;
  paidAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
};

const COUPON_COLUMNS: Column<CouponRow>[] = [
  { key: "code", label: "Coupon Code" },
  {
    key: "discountPercentage",
    label: "Discount",
    render: (row) => `${row.discountPercentage}% OFF`,
  },
  {
    key: "currentUses",
    label: "Usage stats",
    render: (row) => `${row.currentUses} / ${row.maxUses || "∞"} used`,
  },
  {
    key: "expiresAt",
    label: "Expiration Date",
    render: (row) =>
      row.expiresAt
        ? new Date(row.expiresAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Never",
  },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          row.isActive
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {row.isActive ? "Active" : "Disabled"}
      </span>
    ),
  },
];

const COUPON_FIELDS: FieldDef[] = [
  { key: "code", label: "Coupon Code (Alphanumeric)", placeholder: "e.g. WELCOME50" },
  { key: "discountPercentage", label: "Discount Percentage (1-100)", type: "number", placeholder: "e.g. 50" },
  { key: "maxUses", label: "Maximum Usage Limit (Leave blank for unlimited)", type: "number", placeholder: "e.g. 100" },
  { key: "expiresAt", label: "Expiration Date (Leave blank for never)", type: "date" },
  { key: "isActive", label: "Is Coupon Active", type: "boolean" },
];

const COUPON_EMPTY_TEMPLATE: CouponRow = {
  code: "",
  discountPercentage: 10,
  currentUses: 0,
  isActive: true,
};

export default function AdminPaymentsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  async function loadCoupons() {
    setLoadingCoupons(true);
    try {
      const data = await listCoupons();
      setCoupons(data as unknown as CouponRow[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch coupons");
    } finally {
      setLoadingCoupons(false);
    }
  }

  async function loadPayments() {
    setLoadingPayments(true);
    try {
      const data = await listPayments();
      // Safely map dates to strings
      const formattedPayments = (data as any[]).map((p) => ({
        ...p,
        paidAt: p.paidAt.toISOString(),
      }));
      setPayments(formattedPayments);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch payments");
    } finally {
      setLoadingPayments(false);
    }
  }

  useEffect(() => {
    loadCoupons();
    loadPayments();
  }, []);

  async function handleSaveCoupon(row: CouponRow) {
    const toastId = toast.loading("Saving coupon...");
    try {
      await upsertCoupon(row);
      toast.success("Coupon saved successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to save coupon", { id: toastId });
      throw e;
    }
  }

  async function handleDeleteCoupon(id: string) {
    const toastId = toast.loading("Deleting coupon...");
    try {
      await deleteCoupon(id);
      toast.success("Coupon deleted successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message || "Failed to delete coupon", { id: toastId });
      throw e;
    }
  }

  // Aggregate stats
  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS" || p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent sm:text-4xl">
          Billing & Payments
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View platform revenues, track subscription payments, generate active discount coupons, and check redemption metrics.
        </p>
      </div>

      {/* Revenue Widget Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Platform Revenue
            </p>
            <div className="rounded-xl bg-primary/10 p-2 text-primary shadow-inner">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              ₹{(totalRevenue / 100).toLocaleString("en-IN")}.00
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              All settled payment totals
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Subscription Count
            </p>
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 shadow-inner">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {payments.length}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Successful & pending transactions
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 p-6 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Coupon Codes
            </p>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 shadow-inner">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              {coupons.filter((c) => c.isActive).length}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Enabled promo-codes in system
            </p>
          </div>
        </div>
      </div>

      {/* Coupons Catalog section */}
      <div>
        <CatalogTable<CouponRow>
          eyebrow="Redemption Manager"
          title="Promo Coupons"
          description="Create and delete active discount percentage codes for registration tiers."
          rows={coupons}
          isLoading={loadingCoupons}
          columns={COUPON_COLUMNS}
          fields={COUPON_FIELDS}
          emptyTemplate={COUPON_EMPTY_TEMPLATE}
          onSave={handleSaveCoupon}
          onDelete={handleDeleteCoupon}
          refetch={loadCoupons}
          searchKeys={["code"]}
        />
      </div>

      {/* Transaction list section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Transaction History</h2>
          <p className="text-sm text-muted-foreground">
            Logs of settled subscriptions bought by users
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {loadingPayments ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading payment entries...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No subscription payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase font-semibold text-muted-foreground tracking-wider border-b border-border">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User details</th>
                    <th className="px-5 py-4 font-semibold">Plan tier</th>
                    <th className="px-5 py-4 font-semibold">Coupon used</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Date Settled</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{pay.user?.name || "Unnamed Account"}</span>
                          <span className="text-xs text-muted-foreground font-mono">{pay.user?.email || "No email"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold uppercase text-xs text-muted-foreground">
                        {pay.tier}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
                        {pay.couponCode ? (
                          <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-1.5 py-0.5 font-bold text-purple-400">
                            <Tag className="h-3 w-3" /> {pay.couponCode}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        ₹{(pay.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {new Date(pay.paidAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            pay.status === "SUCCESS" || pay.status === "COMPLETED"
                              ? "bg-emerald-500/15 text-emerald-500"
                              : "bg-amber-500/15 text-amber-500"
                          }`}
                        >
                          {pay.status === "SUCCESS" || pay.status === "COMPLETED" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Success
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3" /> Pending
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
