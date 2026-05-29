import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  Archive,
  ArrowUpDown,
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  Filter,
  Globe,
  HelpCircle,
  Info,
  Layers,
  LayoutGrid,
  List,
  Lock,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────
// CONSTANTS & FORMATTERS
// ─────────────────────────────────────────
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const cn = (...classes) => classes.filter(Boolean).join(" ");

const PLAN_CATEGORIES = [
  "General Fitness",
  "Weight Loss",
  "Muscle Gain",
  "Premium",
  "Corporate",
  "Student",
  "Yoga",
  "CrossFit",
  "Personal Training",
];

const INITIAL_PLANS = [
  {
    id: "PLN-001",
    name: "Premium Annual Elite",
    category: "Premium",
    price: 24999,
    duration: "1 Year",
    members: 142,
    status: "Active",
    statusLabel: "Active",
    revenue: "₹35.5L",
    revenueValue: 3550000,
    retention: 92,
    color: "#3b82f6",
    benefits: ["All Branch Access", "24/7 Access", "12 PT Sessions", "Steam/Sauna", "Diet Consultation"],
  },
  {
    id: "PLN-002",
    name: "Monthly Starter",
    category: "General Fitness",
    price: 2499,
    duration: "1 Month",
    members: 86,
    status: "Trending",
    statusLabel: "Trending",
    revenue: "₹2.1L",
    revenueValue: 210000,
    retention: 65,
    color: "#10b981",
    benefits: ["Base Branch Access", "Standard Hours", "Locker Access", "App Support"],
  },
  {
    id: "PLN-003",
    name: "Quarterly Transformation",
    category: "Weight Loss",
    price: 6999,
    duration: "3 Months",
    members: 54,
    status: "Active",
    statusLabel: "Active",
    revenue: "₹3.8L",
    revenueValue: 380000,
    retention: 78,
    color: "#f59e0b",
    benefits: ["Branch Access", "Extended Hours", "Progress Tracking", "Meal Plans"],
  },
  {
    id: "PLN-004",
    name: "Student Basic",
    category: "Student",
    price: 1499,
    duration: "1 Month",
    members: 112,
    status: "Active",
    statusLabel: "Active",
    revenue: "₹1.6L",
    revenueValue: 160000,
    retention: 82,
    color: "#6366f1",
    benefits: ["Single Branch", "10AM - 4PM", "App Support"],
  },
  {
    id: "PLN-005",
    name: "Corporate Wellness",
    category: "Corporate",
    price: 18000,
    duration: "1 Year",
    members: 230,
    status: "Most Popular",
    statusLabel: "Most Popular",
    revenue: "₹41.4L",
    revenueValue: 4140000,
    retention: 88,
    color: "#ec4899",
    benefits: ["Multi Branch", "Full Access", "Health Checks", "Guest Passes"],
  },
];

const getPlanPriority = (plan) => {
  if (plan.status === "Most Popular" || plan.status === "Trending") return "popular";
  if (plan.status === "Active") return "standard";
  return "legacy";
};

const planGroupConfig = {
  popular: {
    title: "High Performance",
    subtitle: "Most popular & trending plans",
    icon: Zap,
    lane: "border-amber-200 bg-amber-50/60",
    iconWrap: "bg-amber-100 text-amber-700",
    count: "text-amber-800",
  },
  standard: {
    title: "Active Inventory",
    subtitle: "Standard membership products",
    icon: Layers,
    lane: "border-emerald-200 bg-emerald-50/50",
    iconWrap: "bg-emerald-100 text-emerald-700",
    count: "text-emerald-800",
  },
  legacy: {
    title: "Legacy & Draft",
    subtitle: "Hidden or archived offerings",
    icon: Archive,
    lane: "border-slate-200 bg-slate-100/70",
    iconWrap: "bg-slate-200 text-slate-700",
    count: "text-slate-800",
  },
};

const statusStyles = {
  Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Trending: "border-blue-200 bg-blue-50 text-blue-700",
  "Most Popular": "border-indigo-200 bg-indigo-50 text-indigo-700",
  Hidden: "border-slate-200 bg-slate-50 text-slate-700",
  Archived: "border-rose-200 bg-rose-50 text-rose-700",
};

// ─────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────
function DashboardHeader({ title, description, stats, visibleCount }) {
  return (
    <header className="grid gap-3 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-enterprise lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Membership Inventory</p>
        <h1 className="m-0 text-[clamp(28px,3vw,44px)] font-black leading-none tracking-normal text-slate-950">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[640px]">
        <StatTile label="Visible" value={visibleCount} />
        <StatTile label="Active" value={stats.activePlans} tone="blue" />
        <StatTile label="Revenue" value={currencyFormatter.format(stats.monthlyRevenue / 100000) + "L"} tone="emerald" />
        <StatTile label="Retention" value={stats.avgRetention + "%"} tone="amber" />
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
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  }[tone];

  return (
    <div className={cn("min-w-0 rounded-lg border p-3", toneClass)}>
      <span className="block text-[10px] font-black uppercase tracking-[0.14em] opacity-70">{label}</span>
      <strong className="mt-2 block truncate text-xl font-black leading-none tracking-normal">{value}</strong>
    </div>
  );
}

function FilterTabs({ activeFilter, onChange, plans }) {
  const options = [
    { id: "all", label: "All Plans", predicate: () => true },
    { id: "active", label: "Active", predicate: (p) => p.status === "Active" },
    { id: "popular", label: "Most Popular", predicate: (p) => p.status === "Most Popular" || p.status === "Trending" },
    { id: "premium", label: "Premium", predicate: (p) => p.category === "Premium" },
    { id: "archived", label: "Archived", predicate: (p) => p.status === "Archived" || p.status === "Hidden" },
  ];

  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-1" aria-label="Plan filters">
      <div className="flex min-h-9 flex-wrap gap-1">
        <span className="flex shrink-0 items-center gap-1.5 px-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filter
        </span>
        {options.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count = plans.filter(filter.predicate).length;
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

function BulkActionBar({ selectedCount, onClearSelection, onCreatePlan, viewMode, setViewMode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg bg-slate-200/50 p-1">
          <button 
            onClick={() => setViewMode("grid")}
            className={cn("w-9 h-8 flex items-center justify-center rounded-md transition-all", viewMode === "grid" ? "bg-white shadow-sm text-slate-950" : "text-slate-500 hover:text-slate-700")}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode("table")}
            className={cn("w-9 h-8 flex items-center justify-center rounded-md transition-all", viewMode === "table" ? "bg-white shadow-sm text-slate-950" : "text-slate-500 hover:text-slate-700")}
            title="Table View"
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setViewMode("analytics")}
            className={cn("w-9 h-8 flex items-center justify-center rounded-md transition-all", viewMode === "analytics" ? "bg-white shadow-sm text-slate-950" : "text-slate-500 hover:text-slate-700")}
            title="Analytics"
          >
            <BarChart3 size={16} />
          </button>
        </div>
        <div className="h-5 w-px bg-slate-300"></div>
        <span className="text-xs font-extrabold text-slate-800">
          {selectedCount > 0 ? `${selectedCount} selected` : "Global Actions"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          type="button"
          onClick={onCreatePlan}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create
        </button>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={!selectedCount}
        >
          <Edit className="h-4 w-4" aria-hidden="true" />
          Bulk Edit
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

function PriorityGroup({ config, plans, selectedIds, expandedId, onTogglePlan, onExpand, onEdit }) {
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
        <strong className={cn("text-2xl font-black leading-none", config.count)}>{plans.length}</strong>
      </header>

      <div className="grid items-start gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        {plans.length ? (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedIds.has(plan.id)}
              expanded={expandedId === plan.id}
              onToggleSelected={() => onTogglePlan(plan.id)}
              onExpand={() => onExpand(expandedId === plan.id ? "" : plan.id)}
              onEdit={() => onEdit(plan)}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs font-bold text-slate-500">
            No plans in this group
          </div>
        )}
      </div>
    </section>
  );
}

function PlanCard({ plan, selected, expanded, onToggleSelected, onExpand, onEdit }) {
  const priority = getPlanPriority(plan);
  const statusClass = statusStyles[plan.status] || statusStyles.Active;
  const priorityBorder = {
    popular: "border-l-amber-400",
    standard: "border-l-emerald-400",
    legacy: "border-l-slate-400",
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
          aria-label={`Select ${plan.name}`}
        />
        <div 
          className="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-white shadow-sm" 
          style={{ backgroundColor: plan.color }}
        >
          <Layers className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="m-0 truncate text-base font-black leading-tight text-slate-950">{plan.name}</h3>
              <p className="m-0 mt-1 truncate text-xs font-bold text-slate-500">
                {plan.id} · {plan.category}
              </p>
            </div>
            <StatusBadge className={statusClass} label={plan.statusLabel} />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <MetricPill
              label="Price"
              value={currencyFormatter.format(plan.price)}
              detail={`/ ${plan.duration}`}
            />
            <MetricPill 
              label="Members" 
              value={plan.members} 
              detail={`${plan.retention}% retention`} 
            />
            <MetricPill 
              label="Revenue" 
              value={plan.revenue} 
              detail="Cumulative"
              success={plan.revenueValue > 1000000}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <InlineAction icon={Edit} label="Edit" primary onClick={onEdit} />
            <InlineAction icon={BarChart3} label="Analytics" />
            <InlineAction icon={Copy} label="Clone" />
            <InlineAction 
              icon={ChevronDown} 
              label={expanded ? "Collapse" : "Expand"} 
              expanded={expanded} 
              onClick={onExpand} 
            />
          </div>
        </div>
      </div>

      {expanded ? <PlanDetails plan={plan} /> : null}
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

function MetricPill({ label, value, detail = "", danger = false, success = false }) {
  return (
    <div className={cn("min-w-0 rounded-md border p-2", danger ? "border-rose-200 bg-rose-50" : success ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50")}>
      <span className="block truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <strong className={cn("mt-1 block truncate text-xs font-black", danger ? "text-rose-700" : success ? "text-emerald-700" : "text-slate-950")}>{value}</strong>
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

function PlanDetails({ plan }) {
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Benefits</p>
      <div className="grid gap-2 md:grid-cols-2">
        {plan.benefits.map((benefit, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-100 bg-slate-50/50">
            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-slate-600 truncate">{benefit}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <DetailItem icon={Smartphone} label="App Features" value="Mobile Check-in, Workout Log" />
        <DetailItem icon={Lock} label="Access Policy" value="Standard Hours" />
      </div>
    </div>
  );
}

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

function TableView({ plans, selectedIds, onTogglePlan, onEdit }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-enterprise">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 w-10">
               <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
            </th>
            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Plan Details</th>
            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Category</th>
            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Pricing</th>
            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Performance</th>
            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {plans.map((plan) => (
            <tr key={plan.id} className={cn("hover:bg-slate-50 transition-colors group", selectedIds.has(plan.id) && "bg-slate-50/50")}>
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(plan.id)}
                  onChange={() => onTogglePlan(plan.id)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-950"
                />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: plan.color }}>
                    <Layers size={20} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-black text-slate-950 truncate">{plan.name}</span>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{plan.id}</span>
                  </div>
                </div>
              </td>
              <td className="p-4 text-xs font-bold text-slate-600 uppercase tracking-tight">{plan.category}</td>
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-950">{currencyFormatter.format(plan.price)}</span>
                  <span className="text-[10px] font-bold text-slate-500">per {plan.duration}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col min-w-[60px]">
                    <span className="text-sm font-black text-slate-900">{plan.members}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Members</span>
                  </div>
                  <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${plan.retention}%` }}></div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <StatusBadge className={statusStyles[plan.status] || statusStyles.Active} label={plan.status} />
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(plan)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:shadow-sm">
                    <Edit size={14} />
                  </button>
                  <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:shadow-sm">
                    <Copy size={14} />
                  </button>
                  <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:shadow-sm">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsView({ plans }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-enterprise">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            Revenue Contribution
          </h3>
          <button className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-colors">View Deep Report</button>
        </div>
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">{plan.name}</span>
                <span className="text-slate-950 font-black">{plan.revenue}</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.random() * 60 + 30}%` }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-enterprise flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-inner shadow-indigo-100/50">
          <Zap size={40} />
        </div>
        <h3 className="text-lg font-black text-slate-950">AI Intelligence Suite</h3>
        <p className="text-sm font-semibold text-slate-500 mt-3 max-w-xs leading-relaxed">
          GymDeck AI is analyzing your membership patterns. Detailed forecasting and churn predictions will appear here.
        </p>
        <button className="mt-8 px-8 py-3 rounded-xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
          Run Optimization
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SHARED FORM COMPONENTS
// ─────────────────────────────────────────
function CustomSelect({ label, value, options, onChange, placeholder = "Select option..." }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 block">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-5 text-sm font-bold text-left flex items-center justify-between transition-all outline-none",
          isOpen ? "border-indigo-400 bg-white ring-4 ring-indigo-50" : "hover:border-slate-300"
        )}
      >
        <span className={cn(!value && "text-slate-400")}>{value || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-5 py-3 text-sm font-bold text-left flex items-center justify-between transition-colors",
                    value === opt ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {opt}
                  {value === opt && <Check className="h-4 w-4" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────
// CREATE/EDIT DRAWER
// ─────────────────────────────────────────
const CreatePlanDrawer = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    name: "",
    category: PLAN_CATEGORIES[0],
    status: "Active",
    description: "",
    price: "",
    duration: "1 Month",
    incentive: "10"
  });

  if (!isOpen) return null;

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Info },
    { id: "pricing", label: "Pricing Engine", icon: DollarSign },
    { id: "access", label: "Access Controls", icon: Lock },
    { id: "benefits", label: "Benefits", icon: Tag },
    { id: "renewal", label: "Renewal", icon: RotateCcw },
  ];

  return (
    <div className="fixed inset-0 z-[10001] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
        className="relative w-full max-w-4xl bg-white h-[82vh] shadow-2xl flex flex-col rounded-t-[32px] border-t border-white/20 overflow-hidden"
      >
        {/* Grabber Handle */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full z-10" />

        <header className="px-6 pt-8 pb-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Create Membership Plan</h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Configure a new financial product for your ecosystem.</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-56 border-r border-slate-50 bg-slate-50/30 p-5">
            <nav className="space-y-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id
                      ? "bg-slate-950 text-white shadow-xl shadow-slate-200 translate-x-1"
                      : "text-slate-500 hover:bg-white hover:text-slate-950 hover:translate-x-0.5"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
            
            <div className="mt-10 p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50">
               <Zap size={20} className="text-indigo-600 mb-2.5" />
               <p className="text-[9px] font-black text-indigo-900 uppercase tracking-widest leading-relaxed">
                  Compliance: Data validated against branch tax policies.
               </p>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {activeTab === "basic" && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="grid gap-5">
                    <label className="block">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 block">Plan Name</span>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Annual Elite Membership"
                        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-5 text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-5">
                      <CustomSelect
                        label="Category"
                        value={formData.category}
                        options={PLAN_CATEGORIES}
                        onChange={(val) => setFormData({...formData, category: val})}
                      />
                      <CustomSelect
                        label="Inventory Status"
                        value={formData.status}
                        options={["Active", "Draft", "Hidden"]}
                        onChange={(val) => setFormData({...formData, status: val})}
                      />
                    </div>
                    <label className="block">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 block">Executive Summary</span>
                      <textarea
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe the primary value proposition..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                      ></textarea>
                    </label>
                  </div>
                </motion.div>
              )}

              {activeTab === "pricing" && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 block">Base Price (₹)</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="2499"
                        className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/50 px-5 text-sm font-bold outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                      />
                    </label>
                    <CustomSelect
                      label="Subscription Term"
                      value={formData.duration}
                      options={["1 Month", "3 Months", "6 Months", "1 Year"]}
                      onChange={(val) => setFormData({...formData, duration: val})}
                    />
                  </div>
                  
                  <div className="p-6 rounded-[24px] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <BarChart3 size={12} /> Revenue Projection
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">Merchant Amount</span>
                        <span className="font-black text-white">₹{formData.price || "0.00"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-400">GST (18%)</span>
                        <span className="font-black text-white">₹{(formData.price * 0.18).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-white/10 my-3" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest">Total Payable</span>
                        <span className="text-2xl font-black text-indigo-400 tracking-tighter">₹{(formData.price * 1.18).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "access" && (
                <motion.div
                  key="access"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-200">
                    <h4 className="text-[9px] font-black text-slate-950 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                      <Lock size={12} /> Access Control Rules
                    </h4>
                    <div className="space-y-4">
                       <label className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
                         <input type="checkbox" className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" defaultChecked />
                         <div>
                            <span className="block text-xs font-black text-slate-950">Multi-Branch Roaming</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Access network facilities</span>
                         </div>
                       </label>
                       <label className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
                         <input type="checkbox" className="w-4.5 h-4.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                         <div>
                            <span className="block text-xs font-black text-slate-950">24/7 Priority Entry</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Unlimited timestamped check-ins</span>
                         </div>
                       </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "benefits" && (
                <motion.div
                  key="benefits"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-2xl space-y-6"
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Product Inclusions</span>
                  <div className="grid grid-cols-2 gap-3.5">
                    {["Steam/Sauna", "Diet Plan", "Locker Access", "Personal Trainer", "Guest Pass", "Health Check"].map(b => (
                      <button key={b} className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 text-xs font-bold text-slate-700 transition-all group">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                           <Plus size={14} />
                        </div>
                        {b}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "renewal" && (
                <motion.div
                  key="renewal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="max-w-2xl space-y-6"
                >
                  <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-200">
                    <h4 className="text-[9px] font-black text-slate-950 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                      <RotateCcw size={12} /> Automation Engine
                    </h4>
                    <label className="block">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 block">Early Renewal Incentive (%)</span>
                      <input type="number" 
                        value={formData.incentive}
                        onChange={(e) => setFormData({...formData, incentive: e.target.value})}
                        placeholder="10" className="w-full h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all" />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <footer className="px-8 py-6 border-t border-slate-100 bg-white flex justify-end gap-3.5 items-center">
          <button
            onClick={onClose}
            className="px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition-all"
          >
            Cancel
          </button>
          <button className="px-8 h-12 rounded-xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            Publish Product
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────
const MembershipPlansPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [expandedId, setExpandedId] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [plans] = useState(INITIAL_PLANS);

  const filterOptions = useMemo(() => [
    { id: "all", predicate: () => true },
    { id: "active", predicate: (p) => p.status === "Active" },
    { id: "popular", predicate: (p) => p.status === "Most Popular" || p.status === "Trending" },
    { id: "premium", predicate: (p) => p.category === "Premium" },
    { id: "archived", predicate: (p) => p.status === "Archived" || p.status === "Hidden" },
  ], []);

  const activePredicate = useMemo(() => 
    filterOptions.find((f) => f.id === activeFilter)?.predicate || filterOptions[0].predicate,
    [activeFilter, filterOptions]
  );

  const filteredPlans = useMemo(() => {
    const lowQuery = query.toLowerCase();
    return plans.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(lowQuery) ||
        p.category.toLowerCase().includes(lowQuery) ||
        p.id.toLowerCase().includes(lowQuery);
      return matchesQuery && activePredicate(p);
    });
  }, [plans, query, activePredicate]);

  const groupedPlans = useMemo(() => {
    return filteredPlans.reduce(
      (groups, p) => {
        groups[getPlanPriority(p)].push(p);
        return groups;
      },
      { popular: [], standard: [], legacy: [] }
    );
  }, [filteredPlans]);

  const stats = useMemo(() => {
    return {
      activePlans: plans.filter((p) => p.status === "Active" || p.status === "Most Popular" || p.status === "Trending").length,
      totalMembers: plans.reduce((acc, p) => acc + p.members, 0),
      monthlyRevenue: plans.reduce((acc, p) => acc + p.revenueValue, 0),
      avgRetention: Math.round(plans.reduce((acc, p) => acc + p.retention, 0) / plans.length),
    };
  }, [plans]);

  const togglePlan = useCallback((id) => {
    setSelectedIds((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const resetView = useCallback(() => {
    setQuery("");
    setActiveFilter("all");
  }, []);

  return (
    <div className="min-h-full font-sans text-slate-950 bg-slate-50/30">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <button className="h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-3 hover:bg-white transition-all">
              <Globe size={14} className="text-slate-400" />
              Main Branch • Koramangala
              <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search plans, revenue, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-semibold outline-none focus:bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 border border-slate-200 px-1.5 py-0.5 rounded">
              ⌘ K
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
            <Bell size={18} />
          </button>
          <button className="h-10 px-4 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="h-10 px-6 rounded-xl bg-slate-950 text-white flex items-center gap-2 text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Plus size={18} />
            Create Plan
          </button>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto space-y-4">
        <DashboardHeader 
          title="Product Lifecycle" 
          description="Manage subscriptions, pricing models, and access policies. High-end financial infrastructure for your gym ecosystem."
          stats={stats}
          visibleCount={filteredPlans.length}
        />
        
        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-enterprise">
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_max-content]">
            <label className="relative block min-w-0" htmlFor="plan-search-main">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="plan-search-main"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                placeholder="Quick search plans..."
                type="search"
              />
            </label>
            <div className="flex gap-2">
              <button className="h-11 px-4 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center gap-2 border border-emerald-100">
                <Zap size={14} />
                AI Insights
              </button>
              <button className="h-11 px-4 rounded-lg bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors flex items-center gap-2 border border-slate-200">
                Pricing Templates
              </button>
            </div>
          </div>

          <FilterTabs activeFilter={activeFilter} onChange={setActiveFilter} plans={plans} />

          <BulkActionBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onCreatePlan={() => setIsDrawerOpen(true)}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </section>

        <section className="pt-2">
          {viewMode === "grid" && (
            <div className="grid gap-4">
              {Object.entries(planGroupConfig)
                .filter(([p]) => groupedPlans[p].length)
                .map(([p, config]) => (
                  <PriorityGroup
                    key={p}
                    config={config}
                    plans={groupedPlans[p]}
                    selectedIds={selectedIds}
                    expandedId={expandedId}
                    onTogglePlan={togglePlan}
                    onExpand={setExpandedId}
                    onEdit={() => setIsDrawerOpen(true)}
                  />
                ))}
              
              {!filteredPlans.length && (
                <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <Search className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-lg font-black text-slate-950">No plans match this view</h2>
                    <button
                      className="mt-4 inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setActiveFilter("all");
                      }}
                    >
                      Reset view
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {viewMode === "table" && (
            <TableView plans={filteredPlans} selectedIds={selectedIds} onTogglePlan={togglePlan} onEdit={() => setIsDrawerOpen(true)} />
          )}
          
          {viewMode === "analytics" && (
            <AnalyticsView plans={filteredPlans} />
          )}
        </section>
      </main>

      <AnimatePresence>
        {isDrawerOpen && <CreatePlanDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

import { ErrorBoundary } from "./ErrorHandlers.jsx";

// ─────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────
export function mountMembershipPlans() {
  const stage = document.querySelector('[data-stage="membership-plans"]');
  if (!stage) return null;

  const rootElement = document.createElement("div");
  rootElement.dataset.membershipPlansReactRoot = "";
  rootElement.className = "min-h-full";
  stage.replaceChildren(rootElement);

  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <MembershipPlansPage />
      </ErrorBoundary>
    );
    return root;
  } catch (err) {
    console.error("Failed to render Membership Plans UI:", err);
    return null;
  }
}

export default MembershipPlansPage;
