"use client";

import { useState } from "react";
import {
  Mail,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { getCustomerEmails } from "@/lib/actions";

interface Produto {
  id: string;
  nome: string;
  fotoPrincipal: string | null;
}

interface Customer {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastPurchase: string | null;
  produtos: Produto[];
}

type Toast = { type: "success" | "error"; msg: string };

const STAGE_OPTIONS = [
  "Order confirmed",
  "In preparation",
  "Processing update",
  "Dispatched",
  "In transit",
  "Delivery update",
  "Final stage",
  "Post-delivery",
  "Completed",
];

export default function AdminEmailsClient({
  initialCustomers,
}: {
  initialCustomers: Customer[];
}) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState(STAGE_OPTIONS[0]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const showToast = (type: Toast["type"], msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomerEmails();
      setCustomers(data as Customer[]);
    } catch {
      showToast("error", "Failed to refresh emails.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const allSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selected.has(c.email));

  const toggleOne = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filteredCustomers.forEach((c) => next.delete(c.email));
      } else {
        filteredCustomers.forEach((c) => next.add(c.email));
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest transition-all animate-in slide-in-from-bottom-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-500 text-black"
              : "bg-rose-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
            Customer Emails
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            {customers.length} customers who purchased
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STAGE_OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => setStage(option)}
            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              stage === option
                ? "bg-white text-black"
                : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
        />
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
        />
      </div>
      <button
        className="fixed bottom-6 right-6 z-50 size-14 h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:bg-white/90 transition-all"
        aria-label="Enviar"
      >
        <Send size={20} />
      </button>

      {/* Emails Table */}
      <div className="bg-black border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-20 flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-white/20" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-center">
            <Mail size={40} className="text-white/10 mb-4" />
            <p className="text-sm text-white/30">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-5 px-6 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="size-4 rounded accent-white cursor-pointer"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                    Customer
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                    Products Purchased
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-white/20">
                    Last Purchase
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">
                    Orders
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredCustomers.map((customer) => {
                  const lastPurchaseDate = customer.lastPurchase
                    ? new Date(customer.lastPurchase)
                    : null;

                  return (
                    <tr
                      key={customer.email}
                      className="group hover:bg-white/[0.01] transition-colors"
                    >
                      <td
                        className="py-5 px-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(customer.email)}
                          onChange={() => toggleOne(customer.email)}
                          className="size-4 rounded accent-white cursor-pointer"
                          aria-label={`Select ${customer.email}`}
                        />
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-[10px] font-black text-white/40 uppercase shrink-0">
                            {customer.name?.[0] || "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white mb-0.5">
                              {customer.name || "Guest"}
                            </span>
                            <span className="text-[10px] text-white/20">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-6 max-w-[220px]">
                        {customer.produtos?.length ? (
                          <div className="flex flex-col gap-1">
                            {customer.produtos.slice(0, 2).map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center gap-2"
                              >
                                {p.fotoPrincipal && (
                                  <img
                                    src={p.fotoPrincipal}
                                    alt={p.nome}
                                    className="w-6 h-6 rounded object-cover border border-white/10 shrink-0"
                                  />
                                )}
                                <span className="text-[10px] font-bold text-white/60 truncate">
                                  {p.nome}
                                </span>
                              </div>
                            ))}
                            {customer.produtos.length > 2 && (
                              <span className="text-[9px] text-white/30 font-bold">
                                +{customer.produtos.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/20">—</span>
                        )}
                      </td>

                      <td className="py-5 px-6">
                        {lastPurchaseDate ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/60">
                              {lastPurchaseDate.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                            <span className="text-[9px] text-white/20">
                              {lastPurchaseDate.toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/20">—</span>
                        )}
                      </td>

                      <td className="py-5 px-6 text-right">
                        <span className="text-xs font-black text-white/60">
                          {customer.orderCount}
                        </span>
                      </td>

                      <td className="py-5 px-6 text-right">
                        <span className="text-sm font-black text-white">
                          £{customer.totalSpent.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
