"use client";

import { useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  CheckCircle2,
  Truck,
  Clock,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDENTE: { label: "Pendente", color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
  PAGO:     { label: "Pago",     color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
  ENVIADO:  { label: "Enviado",  color: "text-blue-400",    bg: "bg-blue-500/10",    icon: Truck },
  ENTREGUE: { label: "Entregue", color: "text-purple-400",  bg: "bg-purple-500/10",  icon: Package },
};

const STATUS_OPTIONS = ["PENDENTE", "PAGO", "ENVIADO", "ENTREGUE"];

interface Produto {
  id: string;
  nome: string;
  fotoPrincipal: string | null;
}

interface Order {
  id: string;
  status: string;
  totalAmmount: number;
  produtosIds: string[];
  produtos: Produto[];
  dataCompra: string;
  dataEntrega?: string | null;
  user?: { name: string; email: string };
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingPostcode?: string | null;
  shippingCountry?: string | null;
  shippingState?: string | null;
  shippingComplement?: string | null;
}

export default function OrderDrawer({
  order,
  onClose,
  onStatusChange,
  updatingId,
}: {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  updatingId: string | null;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const isOpen = !!order;
  const isUpdating = order ? updatingId === order.id : false;

  const config = order ? STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDENTE"] : null;
  const StatusIcon = config?.icon;

  const addressParts = order
    ? [
        order.shippingAddress,
        order.shippingComplement,
        order.shippingCity,
        order.shippingState,
        order.shippingPostcode,
        order.shippingCountry,
      ].filter(Boolean)
    : [];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-black border-l border-white/5 z-50 overflow-y-auto transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {order && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
                  Order
                </p>
                <h3 className="text-sm font-black uppercase tracking-widest text-white font-mono">
                  #{order.id.slice(-8)}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-8">
              {/* Status */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                  Status
                </p>
                {config && StatusIcon && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 ${config.bg}`}>
                    <StatusIcon size={12} className={config.color} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => {
                    const optionConfig = STATUS_CONFIG[status];
                    const isActive = order.status === status;
                    return (
                      <button
                        key={status}
                        disabled={isUpdating || isActive}
                        onClick={() => onStatusChange(order.id, status)}
                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          isActive
                            ? `${optionConfig.bg} ${optionConfig.color} border-transparent`
                            : "bg-white/5 text-white/40 border-white/10 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        {optionConfig.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                  Customer
                </p>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-white/20 shrink-0" />
                    <span className="text-xs font-bold text-white">
                      {order.customerName || order.user?.name || "Guest"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-white/20 shrink-0" />
                    <span className="text-xs text-white/60">
                      {order.customerEmail || order.user?.email || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-white/20 shrink-0" />
                    <span className="text-xs text-white/60">
                      {order.customerPhone || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                  Shipping Address
                </p>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-white/20 shrink-0 mt-0.5" />
                    {addressParts.length ? (
                      <p className="text-xs text-white/60 leading-relaxed">
                        {addressParts.join(", ")}
                      </p>
                    ) : (
                      <p className="text-xs text-white/20">No address on file</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                  Products
                </p>
                <div className="space-y-2">
                  {order.produtos?.length ? (
                    order.produtos.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl p-3"
                      >
                        {p.fotoPrincipal ? (
                          <img
                            src={p.fotoPrincipal}
                            alt={p.nome}
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-white/80 truncate">{p.nome}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/20">
                      {order.produtosIds.length} item{order.produtosIds.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                  Details
                </p>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-white/20 shrink-0" />
                    <span className="text-xs text-white/60">
                      {new Date(order.dataCompra).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Total
                    </span>
                    <span className="text-sm font-black text-white">
                      £{order.totalAmmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
