import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  Archive,
  ArrowUpDown,
  Bell,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Clock3,
  CreditCard,
  Download,
  Flame,
  Gift,
  Mail,
  MessageSquare,
  PauseCircle,
  Phone,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Timer,
  TrendingDown,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────
// CONSTANTS & FORMATTERS
// ─────────────────────────────────────────
const TODAY = new Date("2026-05-03T12:00:00+05:30");
const TODAY_DATE = "2026-05-03";
const DELETED_MEMBER_STORAGE_KEY = "gymdeck-deleted-member-ids";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const compactDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
});

const cn = (...classes) => classes.filter(Boolean).join(" ");
const normalize = (value) => String(value || "").toLowerCase().replace(/[^\w@.+-]/g, "");
const getSearchIndex = (member) =>
  normalize([member.name, member.phone, member.id, member.email].join(" "));

// ─────────────────────────────────────────
// ACTIVE MEMBERS DATA
// ─────────────────────────────────────────
const members = [
  {
    id: "GYM-MBR-0428",
    name: "Rohan Verma",
    initials: "RV",
    status: "active",
    statusLabel: "Active",
    plan: "PT + Strength Plan",
    trainer: "Ankit Kumar",
    phone: "+91 99000 12345",
    email: "rohan.verma@example.com",
    dueAmount: 4500,
    totalPaid: 42500,
    expiryDate: "2026-05-30",
    lastVisitAt: "2026-05-03T06:25:00+05:30",
    lastVisitLabel: "Today, 6:25 AM",
    visitsThisMonth: 18,
    riskScore: 84,
    note: "Renewal ready",
    nextAction: "Collect PT extension balance",
  },
  {
    id: "GYM-MBR-0417",
    name: "Aisha Khan",
    initials: "AK",
    status: "due",
    statusLabel: "Payment Due",
    plan: "Monthly Fitness",
    trainer: "Sneha Patel",
    phone: "+91 98111 22440",
    email: "aisha.khan@example.com",
    dueAmount: 2499,
    totalPaid: 18000,
    expiryDate: "2026-05-17",
    lastVisitAt: "2026-05-02T19:15:00+05:30",
    lastVisitLabel: "Yesterday, 7:15 PM",
    visitsThisMonth: 9,
    riskScore: 61,
    note: "Payment attention",
    nextAction: "Send due reminder before evening batch",
  },
  {
    id: "GYM-MBR-0398",
    name: "Karthik Rao",
    initials: "KR",
    status: "expired",
    statusLabel: "Expired",
    plan: "PT Package",
    trainer: "Manav Rao",
    phone: "+91 99002 44331",
    email: "karthik.rao@example.com",
    dueAmount: 8000,
    totalPaid: 24000,
    expiryDate: "2026-04-26",
    lastVisitAt: "2026-04-26T08:10:00+05:30",
    lastVisitLabel: "26 Apr 2026",
    visitsThisMonth: 4,
    riskScore: 38,
    note: "Renewal blocked",
    nextAction: "Recover expired PT package",
  },
  {
    id: "GYM-MBR-0435",
    name: "Meera Nair",
    initials: "MN",
    status: "active",
    statusLabel: "Active",
    plan: "Quarterly Fitness",
    trainer: "Sneha Patel",
    phone: "+91 98989 81212",
    email: "meera.nair@example.com",
    dueAmount: 0,
    totalPaid: 21000,
    expiryDate: "2026-05-16",
    lastVisitAt: "2026-05-03T18:18:00+05:30",
    lastVisitLabel: "Today, 6:18 PM",
    visitsThisMonth: 21,
    riskScore: 91,
    note: "Healthy member",
    nextAction: "Renewal conversation this week",
  },
  {
    id: "GYM-MBR-0403",
    name: "Aarav Sharma",
    initials: "AS",
    status: "paused",
    statusLabel: "Paused",
    plan: "Premium Annual",
    trainer: "Ankit Kumar",
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    dueAmount: 0,
    totalPaid: 48000,
    expiryDate: "2027-01-04",
    lastVisitAt: "2026-04-20T07:30:00+05:30",
    lastVisitLabel: "Paused since 20 Apr",
    visitsThisMonth: 0,
    riskScore: 56,
    note: "Membership freeze active",
    nextAction: "Review pause on 20 May",
  },
  {
    id: "GYM-MBR-0441",
    name: "Siya Mehta",
    initials: "SM",
    status: "active",
    statusLabel: "Active",
    plan: "Quarterly Fitness",
    trainer: "Manav Rao",
    phone: "+91 98111 22233",
    email: "siya.mehta@example.com",
    dueAmount: 0,
    totalPaid: 19500,
    expiryDate: "2026-05-16",
    lastVisitAt: "2026-05-01T18:40:00+05:30",
    lastVisitLabel: "1 May 2026",
    visitsThisMonth: 16,
    riskScore: 78,
    note: "Good retention",
    nextAction: "Confirm renewal preference",
  },
];

// ─────────────────────────────────────────
// ARCHIVED MEMBERS DATA
// ─────────────────────────────────────────
const archivedMembersData = [
  // ── Recently Lost ──────────────────────
  {
    id: "GYM-MBR-0388",
    name: "Rohan Mehta",
    initials: "RM",
    plan: "Monthly Fitness",
    trainer: "Sneha Patel",
    phone: "+91 98765 77001",
    email: "rohan.mehta@example.com",
    expiryDate: "2026-04-26",
    archiveDate: "2026-04-26",
    lastVisitAt: "2026-04-24T07:30:00+05:30",
    dueAmount: 0,
    lostRevenue: 2499,
    totalLostRevenue: 2499,
    totalPaid: 14994,
    churnReason: "expired",
    recoverability: "high",
    visitsTotal: 89,
  },
  {
    id: "GYM-MBR-0371",
    name: "Arjun Nair",
    initials: "AN",
    plan: "Quarterly Fitness",
    trainer: "Manav Rao",
    phone: "+91 99011 45678",
    email: "arjun.nair@example.com",
    expiryDate: "2026-04-13",
    archiveDate: "2026-04-13",
    lastVisitAt: "2026-04-10T08:00:00+05:30",
    dueAmount: 0,
    lostRevenue: 5500,
    totalLostRevenue: 5500,
    totalPaid: 22000,
    churnReason: "expired",
    recoverability: "high",
    visitsTotal: 67,
  },
  {
    id: "GYM-MBR-0365",
    name: "Tanya Verma",
    initials: "TV",
    plan: "Monthly Fitness",
    trainer: "Sneha Patel",
    phone: "+91 87654 12399",
    email: "tanya.verma@example.com",
    expiryDate: "2026-03-28",
    archiveDate: "2026-03-28",
    lastVisitAt: "2026-03-25T19:00:00+05:30",
    dueAmount: 0,
    lostRevenue: 2499,
    totalLostRevenue: 4998,
    totalPaid: 9996,
    churnReason: "expired",
    recoverability: "medium",
    visitsTotal: 28,
  },
  // ── Payment Dropouts ───────────────────
  {
    id: "GYM-MBR-0356",
    name: "Priya Sharma",
    initials: "PS",
    plan: "PT Package",
    trainer: "Ankit Kumar",
    phone: "+91 97654 33210",
    email: "priya.sharma@example.com",
    expiryDate: "2026-04-19",
    archiveDate: "2026-04-19",
    lastVisitAt: "2026-04-15T18:45:00+05:30",
    dueAmount: 4000,
    lostRevenue: 8000,
    totalLostRevenue: 12000,
    totalPaid: 32000,
    churnReason: "payment",
    recoverability: "high",
    visitsTotal: 112,
  },
  {
    id: "GYM-MBR-0334",
    name: "Dev Kapoor",
    initials: "DK",
    plan: "Premium Annual",
    trainer: "Ankit Kumar",
    phone: "+91 98001 12345",
    email: "dev.kapoor@example.com",
    expiryDate: "2026-03-19",
    archiveDate: "2026-03-19",
    lastVisitAt: "2026-03-15T07:15:00+05:30",
    dueAmount: 12000,
    lostRevenue: 15000,
    totalLostRevenue: 22500,
    totalPaid: 45000,
    churnReason: "payment",
    recoverability: "medium",
    visitsTotal: 98,
  },
  {
    id: "GYM-MBR-0341",
    name: "Ritika Joshi",
    initials: "RJ",
    plan: "Monthly Fitness",
    trainer: "Sneha Patel",
    phone: "+91 97322 99001",
    email: "ritika.joshi@example.com",
    expiryDate: "2026-03-26",
    archiveDate: "2026-03-26",
    lastVisitAt: "2026-03-20T19:30:00+05:30",
    dueAmount: 2499,
    lostRevenue: 2499,
    totalLostRevenue: 7497,
    totalPaid: 9996,
    churnReason: "payment",
    recoverability: "medium",
    visitsTotal: 34,
  },
  // ── Long Inactive ──────────────────────
  {
    id: "GYM-MBR-0287",
    name: "Suresh Kumar",
    initials: "SK",
    plan: "Quarterly Fitness",
    trainer: "Manav Rao",
    phone: "+91 98123 67890",
    email: "suresh.kumar@example.com",
    expiryDate: "2026-01-03",
    archiveDate: "2026-01-03",
    lastVisitAt: "2025-12-28T08:30:00+05:30",
    dueAmount: 0,
    lostRevenue: 5500,
    totalLostRevenue: 22000,
    totalPaid: 16500,
    churnReason: "inactive",
    recoverability: "low",
    visitsTotal: 45,
  },
  {
    id: "GYM-MBR-0301",
    name: "Neha Gupta",
    initials: "NG",
    plan: "Monthly Fitness",
    trainer: "Sneha Patel",
    phone: "+91 99887 11223",
    email: "neha.gupta@example.com",
    expiryDate: "2026-01-28",
    archiveDate: "2026-01-28",
    lastVisitAt: "2026-01-20T17:00:00+05:30",
    dueAmount: 0,
    lostRevenue: 2499,
    totalLostRevenue: 8247,
    totalPaid: 7497,
    churnReason: "inactive",
    recoverability: "low",
    visitsTotal: 22,
  },
  {
    id: "GYM-MBR-0315",
    name: "Kabir Singh",
    initials: "KS",
    plan: "PT Package",
    trainer: "Ankit Kumar",
    phone: "+91 98432 55667",
    email: "kabir.singh@example.com",
    expiryDate: "2026-02-10",
    archiveDate: "2026-02-10",
    lastVisitAt: "2026-02-05T06:45:00+05:30",
    dueAmount: 0,
    lostRevenue: 8000,
    totalLostRevenue: 23200,
    totalPaid: 24000,
    churnReason: "paused",
    recoverability: "medium",
    visitsTotal: 58,
  },
];

// ─────────────────────────────────────────
// ACTIVE MEMBER UTILITIES
// ─────────────────────────────────────────
const getDaysUntilExpiry = (member) => {
  const expiry = new Date(`${member.expiryDate}T23:59:00+05:30`);
  return Math.ceil((expiry.getTime() - TODAY.getTime()) / 86400000);
};

const getVisitAgeDays = (member) => {
  const [ty, tm, td] = TODAY_DATE.split("-").map(Number);
  const [vy, vm, vd] = member.lastVisitAt.slice(0, 10).split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(vy, vm - 1, vd)) / 86400000);
};

const getPriority = (member) => {
  const daysUntilExpiry = getDaysUntilExpiry(member);
  if (member.status === "expired" || member.status === "due" || member.dueAmount > 0 || daysUntilExpiry <= 7) return "attention";
  if (member.status === "paused" || member.visitsThisMonth < 5 || getVisitAgeDays(member) > 14) return "inactive";
  return "active";
};

const getExpiryCopy = (member) => {
  const days = getDaysUntilExpiry(member);
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
};

const formatTime = (date) => {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
};

const getLastVisitCopy = (member) => {
  if (member.status === "paused") return "Paused";
  const visit = new Date(member.lastVisitAt);
  const days = getVisitAgeDays(member);
  if (days <= 0) return `Today ${formatTime(visit)}`;
  if (days === 1) return "Yesterday";
  return compactDateFormatter.format(visit);
};

const sortMembers = (a, b, sortBy) => {
  if (sortBy === "due") return b.dueAmount - a.dueAmount || new Date(a.expiryDate) - new Date(b.expiryDate);
  if (sortBy === "expiry") return new Date(a.expiryDate) - new Date(b.expiryDate);
  if (sortBy === "lastVisit") return new Date(b.lastVisitAt) - new Date(a.lastVisitAt);
  if (sortBy === "lastVisitOldest") return new Date(a.lastVisitAt) - new Date(b.lastVisitAt);
  return a.name.localeCompare(b.name);
};

// ─────────────────────────────────────────
// ARCHIVE UTILITIES
// ─────────────────────────────────────────
const getArchiveDaysInactive = (member) => {
  const [ty, tm, td] = TODAY_DATE.split("-").map(Number);
  const [vy, vm, vd] = member.lastVisitAt.slice(0, 10).split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(vy, vm - 1, vd)) / 86400000);
};

const getArchiveGroup = (member) => {
  if (member.dueAmount > 0 || member.churnReason === "payment") return "payment-dropout";
  if (getArchiveDaysInactive(member) > 60) return "long-inactive";
  return "recently-lost";
};

const sortArchiveMembers = (a, b, sortBy) => {
  if (sortBy === "lost-revenue") return b.totalLostRevenue - a.totalLostRevenue;
  if (sortBy === "expiry") return new Date(b.expiryDate) - new Date(a.expiryDate);
  if (sortBy === "inactive") return getArchiveDaysInactive(b) - getArchiveDaysInactive(a);
  return a.name.localeCompare(b.name);
};

// ─────────────────────────────────────────
// ACTIVE MEMBER CONFIG
// ─────────────────────────────────────────
const filterOptions = [
  { id: "all", label: "All", predicate: () => true },
  { id: "active", label: "Active", predicate: (m) => m.status === "active" },
  { id: "due", label: "Due", predicate: (m) => m.dueAmount > 0 },
  { id: "expired", label: "Expired", predicate: (m) => m.status === "expired" },
  { id: "paused", label: "Paused", predicate: (m) => m.status === "paused" },
  { id: "clear", label: "Clear", predicate: (m) => m.dueAmount === 0 && m.status === "active" },
];

const sortOptions = [
  { id: "due", label: "Highest due" },
  { id: "expiry", label: "Soonest expiry" },
  { id: "lastVisit", label: "Recent visit" },
  { id: "lastVisitOldest", label: "Oldest visit" },
  { id: "name", label: "Name A-Z" },
];

const priorityConfig = {
  attention: {
    title: "Attention",
    subtitle: "Dues, expiry, low attendance",
    icon: AlertTriangle,
    lane: "border-amber-200 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-700",
    count: "text-amber-800",
  },
  active: {
    title: "Active",
    subtitle: "Healthy payment and visit rhythm",
    icon: CheckCircle2,
    lane: "border-emerald-200 bg-emerald-50/50",
    iconWrap: "bg-emerald-100 text-emerald-700",
    count: "text-emerald-800",
  },
  inactive: {
    title: "Inactive",
    subtitle: "Paused or needs reactivation",
    icon: PauseCircle,
    lane: "border-slate-200 bg-slate-100/70",
    iconWrap: "bg-slate-200 text-slate-700",
    count: "text-slate-800",
  },
};

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  due: "border-amber-200 bg-amber-50 text-amber-700",
  expired: "border-rose-200 bg-rose-50 text-rose-700",
  paused: "border-slate-200 bg-slate-100 text-slate-700",
};

// ─────────────────────────────────────────
// ARCHIVE CONFIG
// ─────────────────────────────────────────
const archiveFilterOptions = [
  { id: "all", label: "All", predicate: () => true },
  {
    id: "recently-expired",
    label: "Recently Expired",
    predicate: (m) => m.churnReason === "expired" && getArchiveDaysInactive(m) <= 45,
  },
  {
    id: "payment-defaulters",
    label: "Payment Defaulters",
    predicate: (m) => m.dueAmount > 0 || m.churnReason === "payment",
  },
  {
    id: "long-inactive",
    label: "Long Inactive",
    predicate: (m) => getArchiveDaysInactive(m) > 60,
  },
  { id: "paused", label: "Paused", predicate: (m) => m.churnReason === "paused" },
];

const archiveSortOptions = [
  { id: "lost-revenue", label: "Highest Lost Revenue" },
  { id: "expiry", label: "Most Recent Expiry" },
  { id: "inactive", label: "Longest Inactive" },
  { id: "name", label: "Name A-Z" },
];

const archiveGroupConfig = {
  "recently-lost": {
    title: "Recently Lost",
    subtitle: "High recovery potential · Expired within 30–45 days",
    icon: Flame,
    lane: "border-emerald-200 bg-emerald-50/40",
    iconWrap: "bg-emerald-100 text-emerald-700",
    count: "text-emerald-800",
    borderAccent: "border-l-emerald-400",
  },
  "payment-dropout": {
    title: "At Risk · Payment Dropouts",
    subtitle: "Outstanding dues or payment failures",
    icon: Wallet,
    lane: "border-rose-200 bg-rose-50/40",
    iconWrap: "bg-rose-100 text-rose-700",
    count: "text-rose-800",
    borderAccent: "border-l-rose-400",
  },
  "long-inactive": {
    title: "Long-term Inactive",
    subtitle: "Dormant for 60+ days · Low recovery window",
    icon: Archive,
    lane: "border-slate-200 bg-slate-100/60",
    iconWrap: "bg-slate-200 text-slate-600",
    count: "text-slate-700",
    borderAccent: "border-l-slate-400",
  },
};

const churnTagConfig = {
  expired: { label: "Expired", className: "bg-amber-50 text-amber-700 border-amber-200" },
  payment: { label: "Payment Issue", className: "bg-rose-50 text-rose-700 border-rose-200" },
  inactive: { label: "Inactive", className: "bg-slate-100 text-slate-600 border-slate-200" },
  paused: { label: "Paused", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

const recoverabilityConfig = {
  high: { label: "High Recovery", className: "bg-emerald-50 text-emerald-700", icon: Zap },
  medium: { label: "Recoverable", className: "bg-amber-50 text-amber-700", icon: Timer },
  low: { label: "Low Recovery", className: "bg-slate-100 text-slate-500", icon: Archive },
};

// ─────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <strong className="mt-1 block overflow-hidden text-ellipsis text-xs font-black leading-5 text-slate-900">{value}</strong>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ACTIVE DASHBOARD COMPONENTS
// ─────────────────────────────────────────
function DashboardHeader({ title, description, stats, visibleCount }) {
  return (
    <header className="grid gap-3 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-enterprise lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Member Profiles</p>
        <h1 className="m-0 text-[clamp(28px,3vw,44px)] font-black leading-none tracking-normal text-slate-950">
          Lifecycle dashboard
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[560px]">
        <StatTile label="Visible" value={visibleCount} />
        <StatTile label="Attention" value={stats.attention} tone="amber" />
        <StatTile label="Due" value={currencyFormatter.format(stats.dueTotal)} tone="rose" />
        <StatTile label="Expiring" value={stats.expiringSoon} tone="blue" />
      </div>
    </header>
  );
}

function StatTile({ label, value, tone = "slate" }) {
  const toneClass = {
    slate: "bg-slate-50 text-slate-950 border-slate-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
  }[tone];

  return (
    <div className={cn("min-w-0 rounded-lg border p-3", toneClass)}>
      <span className="block text-[10px] font-black uppercase tracking-[0.14em] opacity-70">{label}</span>
      <strong className="mt-2 block truncate text-xl font-black leading-none tracking-normal">{value}</strong>
    </div>
  );
}

function FilterTabs({ activeFilter, onChange, members: sourceMembers }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-1" aria-label="Member profile filters">
      <div className="flex min-h-9 flex-wrap gap-1">
        <span className="flex shrink-0 items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filter
        </span>
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count = sourceMembers.filter(filter.predicate).length;
          return (
            <button
              key={filter.id}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-black transition",
                isActive
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              )}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(filter.id)}
            >
              {filter.label}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BulkActionBar({
  allVisibleSelected,
  selectedCount,
  selectedVisibleCount,
  visibleCount,
  notice,
  onToggleVisible,
  onClearSelection,
  onBulkAction,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <label className="inline-flex min-h-9 items-center gap-2 text-sm font-extrabold text-slate-800">
        <input
          className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
          type="checkbox"
          checked={allVisibleSelected}
          onChange={onToggleVisible}
        />
        <span>
          {selectedVisibleCount
            ? `${selectedVisibleCount} of ${visibleCount} visible selected`
            : `${visibleCount} visible`}
        </span>
      </label>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {notice ? <span className="truncate text-xs font-bold text-slate-500">{notice}</span> : null}
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
          onClick={() => onBulkAction("Payment collection")}
        >
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Collect
        </button>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
          onClick={() => onBulkAction("Message")}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Message
        </button>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>
    </div>
  );
}

function PriorityGroup({
  config,
  members: groupMembers,
  selectedIds,
  expandedId,
  onToggleMember,
  onExpand,
  onInlineAction,
  showDelete,
  onDelete,
}) {
  const Icon = config.icon;
  return (
    <section className={cn("min-w-0 rounded-lg border p-3", config.lane)}>
      <header className="mb-3 flex min-h-12 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", config.iconWrap)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-sm font-black leading-tight text-slate-950">{config.title}</h2>
            <p className="m-0 truncate text-[11px] font-bold text-slate-500">{config.subtitle}</p>
          </div>
        </div>
        <strong className={cn("text-2xl font-black leading-none", config.count)}>{groupMembers.length}</strong>
      </header>

      <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {groupMembers.length ? (
          groupMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              selected={selectedIds.has(member.id)}
              expanded={expandedId === member.id}
              onToggleSelected={() => onToggleMember(member.id)}
              onExpand={() => onExpand(expandedId === member.id ? "" : member.id)}
              onInlineAction={onInlineAction}
              onDelete={onDelete}
              showDelete={showDelete}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs font-bold text-slate-500">
            No profiles in this group
          </div>
        )}
      </div>
    </section>
  );
}

function MemberCard({ member, selected, expanded, onToggleSelected, onExpand, onInlineAction, onDelete, showDelete }) {
  const priority = getPriority(member);
  const expiryCopy = getExpiryCopy(member);
  const expiryDate = compactDateFormatter.format(new Date(`${member.expiryDate}T12:00:00+05:30`));
  const statusClass = statusStyles[member.status] || statusStyles.active;
  const priorityBorder = {
    attention: "border-l-amber-400",
    active: "border-l-emerald-400",
    inactive: "border-l-slate-400",
  }[priority];

  return (
    <article
      className={cn(
        "min-w-0 rounded-lg border border-l-4 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-enterprise",
        priorityBorder,
        selected && "ring-2 ring-slate-300"
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <input
          className="mt-5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
          type="checkbox"
          checked={selected}
          onChange={onToggleSelected}
          aria-label={`Select ${member.name}`}
        />
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
          {member.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="m-0 truncate text-base font-black leading-tight text-slate-950">{member.name}</h3>
              <p className="m-0 mt-1 truncate text-xs font-bold text-slate-500">
                {member.id} - {member.plan}
              </p>
            </div>
            <StatusBadge className={statusClass} label={member.statusLabel} />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <MetricPill
              label="Due"
              value={currencyFormatter.format(member.dueAmount)}
              detail={member.dueAmount > 0 ? "Pending" : "Clear"}
              danger={member.dueAmount > 0}
            />
            <MetricPill label="Last visit" value={getLastVisitCopy(member)} detail={`${member.visitsThisMonth} visits`} />
            <MetricPill label="Expiry" value={expiryDate} detail={expiryCopy} danger={member.status === "expired"} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <InlineAction icon={CreditCard} label="Collect" primary={member.dueAmount > 0} onClick={() => onInlineAction(member, "Collection")} />
            <InlineAction icon={MessageSquare} label="Message" onClick={() => onInlineAction(member, "Message")} />
            {showDelete ? <InlineAction icon={Trash2} label="Delete" onClick={() => onDelete(member.id)} /> : null}
            <InlineAction icon={ChevronDown} label={expanded ? "Collapse" : "Expand"} expanded={expanded} onClick={onExpand} />
          </div>
        </div>
      </div>

      {expanded ? <MemberDetails member={member} /> : null}
    </article>
  );
}

function StatusBadge({ className, label }) {
  return (
    <mark className={cn("inline-flex min-h-7 items-center gap-2 rounded-md border px-2.5 text-[11px] font-black not-italic", className)}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {label}
    </mark>
  );
}

function MetricPill({ label, value, detail = "", danger = false }) {
  return (
    <div className={cn("min-w-0 rounded-md border p-2", danger ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50")}>
      <span className="block truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <strong className={cn("mt-1 block truncate text-xs font-black", danger ? "text-rose-700" : "text-slate-950")}>{value}</strong>
      {detail ? <small className="mt-1 block truncate text-[11px] font-bold text-slate-500">{detail}</small> : null}
    </div>
  );
}

function InlineAction({ icon: Icon, label, primary = false, expanded = false, onClick }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-black transition",
        primary
          ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
      )}
      type="button"
      aria-expanded={label === "Expand" || label === "Collapse" ? expanded : undefined}
      onClick={onClick}
    >
      <Icon className={cn("h-3.5 w-3.5 transition", expanded && "rotate-180")} aria-hidden="true" />
      {label}
    </button>
  );
}

function MemberDetails({ member }) {
  return (
    <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 md:grid-cols-2">
      <DetailItem icon={Phone} label="Phone" value={member.phone} />
      <DetailItem icon={Mail} label="Email" value={member.email} />
      <DetailItem icon={Users} label="Trainer" value={member.trainer} />
      <DetailItem icon={CalendarDays} label="Expires" value={dateFormatter.format(new Date(`${member.expiryDate}T12:00:00+05:30`))} />
      <DetailItem icon={Clock3} label="Visits" value={`${member.visitsThisMonth} this month`} />
      <DetailItem icon={CheckSquare} label="Next" value={member.nextAction} />
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <section className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-black text-slate-950">No profiles match this view</h2>
        <button
          className="mt-4 inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          type="button"
          onClick={onReset}
        >
          Reset view
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────
// ACTIVE MEMBERS DASHBOARD
// ─────────────────────────────────────────
function ActiveMembersDashboard() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [expandedId, setExpandedId] = useState("");
  const [notice, setNotice] = useState("");
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return new Set(JSON.parse(window.localStorage.getItem(DELETED_MEMBER_STORAGE_KEY) || "[]"));
    } catch {
      return new Set();
    }
  });

  const activePredicate = filterOptions.find((f) => f.id === activeFilter)?.predicate || filterOptions[0].predicate;
  const normalizedQuery = normalize(query);

  const activeMembers = useMemo(() => members.filter((m) => !deletedIds.has(m.id)), [deletedIds]);

  const filteredMembers = useMemo(() => {
    return [...activeMembers]
      .filter((m) => {
        const matchesQuery = !normalizedQuery || getSearchIndex(m).includes(normalizedQuery);
        return matchesQuery && activePredicate(m);
      })
      .sort((a, b) => sortMembers(a, b, sortBy));
  }, [activeFilter, activePredicate, normalizedQuery, sortBy, activeMembers]);

  const groupedMembers = useMemo(() => {
    return filteredMembers.reduce(
      (groups, m) => {
        groups[getPriority(m)].push(m);
        return groups;
      },
      { attention: [], active: [], inactive: [] }
    );
  }, [filteredMembers]);

  const profileStats = useMemo(() => {
    const dueTotal = activeMembers.reduce((t, m) => t + m.dueAmount, 0);
    const expiringSoon = activeMembers.filter((m) => {
      const d = getDaysUntilExpiry(m);
      return d >= 0 && d <= 14;
    }).length;
    return { dueTotal, expiringSoon, attention: activeMembers.filter((m) => getPriority(m) === "attention").length };
  }, [activeMembers]);

  const visibleIds = filteredMembers.map((m) => m.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const selectedMembers = activeMembers.filter((m) => selectedIds.has(m.id));

  const toggleMember = (memberId) => {
    setSelectedIds((cur) => {
      const next = new Set(cur);
      next.has(memberId) ? next.delete(memberId) : next.add(memberId);
      return next;
    });
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((cur) => {
      const next = new Set(cur);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setNotice("");
  };

  const handleBulkAction = (action) => {
    if (!selectedMembers.length) return;
    setNotice(`${action} queued for ${selectedMembers.length} selected ${selectedMembers.length === 1 ? "member" : "members"}.`);
  };

  const handleInlineAction = (member, action) => setNotice(`${action} queued for ${member.name}.`);

  const handleDeleteMember = (memberId) => {
    setDeletedIds((cur) => {
      if (cur.has(memberId)) return cur;
      const next = new Set(cur);
      next.add(memberId);
      window.localStorage.setItem(DELETED_MEMBER_STORAGE_KEY, JSON.stringify([...next]));
      window.dispatchEvent(new CustomEvent("gymdeck-member-deleted", { detail: { memberId } }));
      setNotice("Member archived and removed from active views.");
      return next;
    });
  };

  return (
    <div className="min-h-full font-sans text-slate-950">
      <section className="grid gap-3">
        <DashboardHeader
          title="Member Profiles"
          description="Payment risk, renewals, and attendance in one operating queue."
          stats={profileStats}
          visibleCount={filteredMembers.length}
        />

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-enterprise">
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_220px]">
            <label className="relative block min-w-0" htmlFor="member-profile-search">
              <span className="sr-only">Search member profiles</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="member-profile-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                placeholder="Search name, phone, ID, email"
                type="search"
              />
              {query ? (
                <button
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </label>

            <label className="relative block min-w-0" htmlFor="member-profile-sort">
              <span className="sr-only">Sort member profiles</span>
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <select
                id="member-profile-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-bold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            </label>
          </div>

          <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} members={activeMembers} />

          <BulkActionBar
            allVisibleSelected={allVisibleSelected}
            selectedCount={selectedIds.size}
            selectedVisibleCount={selectedVisibleCount}
            visibleCount={visibleIds.length}
            notice={notice}
            onToggleVisible={toggleVisibleSelection}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
          />
        </section>

        {filteredMembers.length ? (
          <section className="grid gap-3" aria-label="Member priority groups">
            {Object.entries(priorityConfig)
              .filter(([p]) => groupedMembers[p].length)
              .map(([p, config]) => (
                <PriorityGroup
                  key={p}
                  config={config}
                  members={groupedMembers[p]}
                  selectedIds={selectedIds}
                  expandedId={expandedId}
                  onToggleMember={toggleMember}
                  onExpand={setExpandedId}
                  onInlineAction={handleInlineAction}
                  onDelete={handleDeleteMember}
                  showDelete={true}
                />
              ))}
          </section>
        ) : (
          <EmptyState onReset={() => { setQuery(""); setActiveFilter("all"); }} />
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────
// ARCHIVE DASHBOARD COMPONENTS
// ─────────────────────────────────────────
function ArchiveKPICard({ icon: Icon, label, value, subValue, tone }) {
  const styles = {
    slate: {
      wrapper: "bg-slate-50 border-slate-200",
      icon: "bg-slate-100 text-slate-600",
      value: "text-slate-950",
      label: "text-slate-500",
    },
    rose: {
      wrapper: "bg-rose-50 border-rose-200",
      icon: "bg-rose-100 text-rose-600",
      value: "text-rose-800",
      label: "text-rose-600",
    },
    emerald: {
      wrapper: "bg-emerald-50 border-emerald-200",
      icon: "bg-emerald-100 text-emerald-600",
      value: "text-emerald-800",
      label: "text-emerald-600",
    },
    amber: {
      wrapper: "bg-amber-50 border-amber-200",
      icon: "bg-amber-100 text-amber-600",
      value: "text-amber-800",
      label: "text-amber-600",
    },
  }[tone];

  return (
    <div className={cn("min-w-0 rounded-lg border p-3", styles.wrapper)}>
      <div className={cn("mb-2.5 grid h-7 w-7 place-items-center rounded-md", styles.icon)}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
      <strong className={cn("block truncate text-xl font-black leading-none", styles.value)}>{value}</strong>
      <span className={cn("mt-1.5 block text-[10px] font-black uppercase tracking-[0.12em]", styles.label)}>{label}</span>
      {subValue ? (
        <small className="mt-0.5 block text-[10px] font-bold text-slate-400">{subValue}</small>
      ) : null}
    </div>
  );
}

function ArchiveHeader({ stats }) {
  return (
    <header className="grid gap-4 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-enterprise lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Past Members</p>
        <h1 className="m-0 text-[clamp(24px,2.8vw,40px)] font-black leading-none tracking-normal text-slate-950">
          Member Archive &amp; Recovery
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Analyze churn patterns and take action to recover lost members. High-value members are prioritized for re-engagement.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[560px]">
        <ArchiveKPICard icon={Users} label="Total Archived" value={stats.total} subValue="members" tone="slate" />
        <ArchiveKPICard
          icon={TrendingDown}
          label="Lost Revenue"
          value={currencyFormatter.format(stats.totalLostRevenue)}
          subValue="cumulative"
          tone="rose"
        />
        <ArchiveKPICard
          icon={UserCheck}
          label="Recoverable"
          value={stats.recoverable}
          subValue="high + medium"
          tone="emerald"
        />
        <ArchiveKPICard icon={Timer} label="Long Inactive" value={stats.longInactive} subValue="60+ days" tone="amber" />
      </div>
    </header>
  );
}

function ArchiveFilterTabs({ activeFilter, onChange }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-1" aria-label="Archive filters">
      <div className="flex min-h-9 flex-wrap gap-1">
        <span className="flex shrink-0 items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filter
        </span>
        {archiveFilterOptions.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count = archivedMembersData.filter(filter.predicate).length;
          return (
            <button
              key={filter.id}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-black transition",
                isActive
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              )}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(filter.id)}
            >
              {filter.label}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArchiveBulkBar({
  allVisibleSelected,
  selectedCount,
  selectedVisibleCount,
  visibleCount,
  notice,
  onToggleVisible,
  onClearSelection,
  onBulkAction,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <label className="inline-flex min-h-9 items-center gap-2 text-sm font-extrabold text-slate-800">
        <input
          className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
          type="checkbox"
          checked={allVisibleSelected}
          onChange={onToggleVisible}
        />
        <span>
          {selectedVisibleCount
            ? `${selectedVisibleCount} of ${visibleCount} visible selected`
            : `${visibleCount} visible`}
        </span>
      </label>

      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
        {notice ? <span className="truncate text-xs font-bold text-slate-500">{notice}</span> : null}

        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
          onClick={() => onBulkAction("Rejoin offer")}
        >
          <Gift className="h-3.5 w-3.5" aria-hidden="true" />
          Rejoin Offer
        </button>

        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
          onClick={() => onBulkAction("Restore membership")}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restore
        </button>

        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
          onClick={() => onBulkAction("Reminder")}
        >
          <Bell className="h-3.5 w-3.5" aria-hidden="true" />
          Reminder
        </button>

        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
          onClick={() => onBulkAction("Export")}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export
        </button>

        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          type="button"
          onClick={onClearSelection}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      </div>
    </div>
  );
}

function ArchiveGroup({ config, members: groupMembers, selectedIds, expandedId, onToggleMember, onExpand, onCardAction }) {
  const Icon = config.icon;

  return (
    <section className={cn("min-w-0 rounded-lg border p-3", config.lane)}>
      <header className="mb-3 flex min-h-12 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", config.iconWrap)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-sm font-black leading-tight text-slate-950">{config.title}</h2>
            <p className="m-0 truncate text-[11px] font-bold text-slate-500">{config.subtitle}</p>
          </div>
        </div>
        <strong className={cn("text-2xl font-black leading-none", config.count)}>{groupMembers.length}</strong>
      </header>

      <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {groupMembers.map((member) => (
          <ArchiveMemberCard
            key={member.id}
            member={member}
            groupConfig={config}
            selected={selectedIds.has(member.id)}
            expanded={expandedId === member.id}
            onToggleSelected={() => onToggleMember(member.id)}
            onExpand={() => onExpand(expandedId === member.id ? "" : member.id)}
            onCardAction={onCardAction}
          />
        ))}
      </div>
    </section>
  );
}

function ArchiveMetric({ label, value, detail, danger = false }) {
  return (
    <div className={cn("min-w-0 rounded-md border p-2", danger ? "border-rose-100 bg-rose-50" : "border-slate-100 bg-slate-50")}>
      <span className="block truncate text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{label}</span>
      <strong className={cn("mt-0.5 block truncate text-[11px] font-black leading-snug", danger ? "text-rose-700" : "text-slate-900")}>
        {value}
      </strong>
      {detail ? (
        <small className={cn("mt-0.5 block truncate text-[10px] font-semibold", danger ? "text-rose-500" : "text-slate-400")}>
          {detail}
        </small>
      ) : null}
    </div>
  );
}

function ArchiveMemberCard({ member, groupConfig, selected, expanded, onToggleSelected, onExpand, onCardAction }) {
  const daysInactive = getArchiveDaysInactive(member);
  const expiryDate = compactDateFormatter.format(new Date(`${member.expiryDate}T12:00:00+05:30`));
  const lastVisitDate = compactDateFormatter.format(new Date(member.lastVisitAt));

  const churnTag = churnTagConfig[member.churnReason] || churnTagConfig.inactive;
  const recoveryInfo = recoverabilityConfig[member.recoverability] || recoverabilityConfig.low;
  const RecoveryIcon = recoveryInfo.icon;

  return (
    <article
      className={cn(
        "min-w-0 rounded-lg border border-l-4 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-enterprise",
        groupConfig.borderAccent,
        selected && "ring-2 ring-slate-300"
      )}
    >
      {/* Header row */}
      <div className="flex min-w-0 items-start gap-3">
        <input
          className="mt-5 h-4 w-4 shrink-0 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
          type="checkbox"
          checked={selected}
          onChange={onToggleSelected}
          aria-label={`Select ${member.name}`}
        />

        {/* Avatar — dimmed to indicate archived */}
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-200 text-sm font-black text-slate-600">
          {member.initials}
        </div>

        <div className="min-w-0 flex-1">
          {/* Name + tags row */}
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="m-0 truncate text-base font-black leading-tight text-slate-950">{member.name}</h3>
              <p className="m-0 mt-0.5 truncate text-xs font-bold text-slate-500">
                {member.id} · {member.plan}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              {/* Churn reason */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-black",
                  churnTag.className
                )}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
                {churnTag.label}
              </span>
              {/* Recoverability */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold",
                  recoveryInfo.className
                )}
              >
                <RecoveryIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                {recoveryInfo.label}
              </span>
            </div>
          </div>

          {/* Metrics — 2×2 on mobile, 4-col on sm+ */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ArchiveMetric label="Last Visit" value={lastVisitDate} detail={`${daysInactive}d ago`} />
            <ArchiveMetric label="Expired" value={expiryDate} detail="Expiry date" danger />
            <ArchiveMetric
              label="Days Inactive"
              value={`${daysInactive}`}
              detail="days"
              danger={daysInactive > 90}
            />
            <ArchiveMetric
              label="Lost Revenue"
              value={currencyFormatter.format(member.totalLostRevenue)}
              detail={member.dueAmount > 0 ? `+${currencyFormatter.format(member.dueAmount)} due` : "cumulative"}
              danger={member.dueAmount > 0}
            />
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 text-[11px] font-black text-emerald-800 transition hover:bg-emerald-100"
              type="button"
              onClick={() => onCardAction(member, "Rejoin offer")}
            >
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              Rejoin Offer
            </button>

            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              type="button"
              onClick={() => onCardAction(member, "Restore membership")}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restore
            </button>

            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              type="button"
              onClick={() => onCardAction(member, "Message")}
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Message
            </button>

            <button
              className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              type="button"
              aria-expanded={expanded}
              onClick={onExpand}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition", expanded && "rotate-180")} aria-hidden="true" />
              {expanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded ? (
        <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 md:grid-cols-2">
          <DetailItem icon={Phone} label="Phone" value={member.phone} />
          <DetailItem icon={Mail} label="Email" value={member.email} />
          <DetailItem icon={Users} label="Trainer" value={member.trainer} />
          <DetailItem
            icon={CalendarDays}
            label="Archived"
            value={dateFormatter.format(new Date(`${member.archiveDate}T12:00:00+05:30`))}
          />
          <DetailItem icon={CreditCard} label="Total Paid" value={currencyFormatter.format(member.totalPaid)} />
          <DetailItem icon={CheckSquare} label="Total Visits" value={`${member.visitsTotal} sessions`} />
        </div>
      ) : null}
    </article>
  );
}

function ArchiveEmptyState({ onReset }) {
  return (
    <section className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-400">
          <Archive className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-black text-slate-950">No archived members match this view</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">Try adjusting the search or filter criteria.</p>
        <button
          className="mt-4 inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          type="button"
          onClick={onReset}
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────
// PAST MEMBERS (ARCHIVE) DASHBOARD
// ─────────────────────────────────────────
function PastMembersDashboard() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lost-revenue");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [expandedId, setExpandedId] = useState("");
  const [notice, setNotice] = useState("");

  const activePredicate = archiveFilterOptions.find((f) => f.id === activeFilter)?.predicate || archiveFilterOptions[0].predicate;
  const normalizedQuery = normalize(query);

  const filteredMembers = useMemo(() => {
    return [...archivedMembersData]
      .filter((m) => {
        const matchesQuery = !normalizedQuery || getSearchIndex(m).includes(normalizedQuery);
        return matchesQuery && activePredicate(m);
      })
      .sort((a, b) => sortArchiveMembers(a, b, sortBy));
  }, [activeFilter, activePredicate, normalizedQuery, sortBy]);

  const groupedMembers = useMemo(() => {
    return filteredMembers.reduce(
      (groups, m) => {
        groups[getArchiveGroup(m)].push(m);
        return groups;
      },
      { "recently-lost": [], "payment-dropout": [], "long-inactive": [] }
    );
  }, [filteredMembers]);

  const archiveStats = useMemo(() => {
    const totalLostRevenue = archivedMembersData.reduce((s, m) => s + m.totalLostRevenue, 0);
    const recoverable = archivedMembersData.filter((m) => m.recoverability !== "low").length;
    const longInactive = archivedMembersData.filter((m) => getArchiveDaysInactive(m) > 60).length;
    return { total: archivedMembersData.length, totalLostRevenue, recoverable, longInactive };
  }, []);

  const visibleIds = filteredMembers.map((m) => m.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  const toggleMember = (memberId) => {
    setSelectedIds((cur) => {
      const next = new Set(cur);
      next.has(memberId) ? next.delete(memberId) : next.add(memberId);
      return next;
    });
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((cur) => {
      const next = new Set(cur);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setNotice("");
  };

  const handleBulkAction = (action) => {
    if (!selectedIds.size) return;
    setNotice(`${action} sent to ${selectedIds.size} member${selectedIds.size !== 1 ? "s" : ""}.`);
  };

  const handleCardAction = (member, action) => {
    setNotice(`${action} for ${member.name}.`);
  };

  return (
    <div className="min-h-full font-sans text-slate-950">
      <section className="grid gap-3">
        <ArchiveHeader stats={archiveStats} />

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-enterprise">
          {/* Search + Sort */}
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_240px]">
            <label className="relative block min-w-0" htmlFor="archive-search">
              <span className="sr-only">Search archived members</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="archive-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                placeholder="Search name, phone, ID, email"
                type="search"
              />
              {query ? (
                <button
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </label>

            <label className="relative block min-w-0" htmlFor="archive-sort">
              <span className="sr-only">Sort archived members</span>
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <select
                id="archive-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-bold text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              >
                {archiveSortOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            </label>
          </div>

          <ArchiveFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />

          <ArchiveBulkBar
            allVisibleSelected={allVisibleSelected}
            selectedCount={selectedIds.size}
            selectedVisibleCount={selectedVisibleCount}
            visibleCount={visibleIds.length}
            notice={notice}
            onToggleVisible={toggleVisibleSelection}
            onClearSelection={clearSelection}
            onBulkAction={handleBulkAction}
          />
        </section>

        {filteredMembers.length ? (
          <section className="grid gap-3" aria-label="Archived member groups">
            {Object.entries(archiveGroupConfig)
              .filter(([group]) => groupedMembers[group].length > 0)
              .map(([group, config]) => (
                <ArchiveGroup
                  key={group}
                  config={config}
                  members={groupedMembers[group]}
                  selectedIds={selectedIds}
                  expandedId={expandedId}
                  onToggleMember={toggleMember}
                  onExpand={setExpandedId}
                  onCardAction={handleCardAction}
                />
              ))}
          </section>
        ) : (
          <ArchiveEmptyState
            onReset={() => {
              setQuery("");
              setActiveFilter("all");
            }}
          />
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────
// ROOT — ROUTES BETWEEN VIEWS
// ─────────────────────────────────────────
function MemberProfilesDashboard() {
  const [viewMode, setViewMode] = useState("member-profiles");

  useEffect(() => {
    const onRouteChange = (event) => {
      setViewMode(event?.detail?.screen || "member-profiles");
    };
    window.addEventListener("memberProfilesRoute", onRouteChange);
    return () => window.removeEventListener("memberProfilesRoute", onRouteChange);
  }, []);

  if (viewMode === "past-members") {
    return <PastMembersDashboard />;
  }

  return <ActiveMembersDashboard />;
}

// ─────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────
export function mountMemberProfilesDashboard() {
  const stage = document.querySelector('[data-stage="member-profile"]');
  if (!stage) return;

  const rootElement = document.createElement("div");
  rootElement.dataset.memberProfilesReactRoot = "";
  rootElement.className = "min-h-full";
  stage.replaceChildren(rootElement);

  createRoot(rootElement).render(<MemberProfilesDashboard />);
}
