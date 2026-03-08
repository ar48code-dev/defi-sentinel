"use client";
import React, { useState, useEffect } from "react";
import PriceCard from "@/components/dashboard/PriceCard";
import IncidentTable from "@/components/dashboard/IncidentTable";
import ConfigModal from "@/components/dashboard/ConfigModal";
import { Shield, Activity, Lock, Zap, RefreshCw, Search, Bell, Settings } from "lucide-react";
import { fetchPrices, fetchIncidents, fetchHealth } from "@/lib/api/backend";

export default function Home() {
  const [prices, setPrices] = useState<any>({});         // ✅ no mock prices
  const [incidents, setIncidents] = useState<any[]>([]); // ✅ no mock incidents
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [priceRes, incidentRes, healthRes] = await Promise.allSettled([
        fetchPrices(),
        fetchIncidents(),
        fetchHealth(),
      ]);

      if (priceRes.status === "fulfilled" && priceRes.value.success) {
        // ✅ Filter out any fallback prices before setting state
        const realPrices: Record<string, any> = {};
        for (const [pair, data] of Object.entries(priceRes.value.data as Record<string, any>)) {
          if (data.source !== "fallback") realPrices[pair] = data;
        }
        setPrices(realPrices);
      }

      if (incidentRes.status === "fulfilled" && incidentRes.value.success) {
        // ✅ Filter out any fallback incidents before setting state
        const realIncidents = (incidentRes.value.data as any[]).filter(
          (i) => i.source !== "fallback"
        );
        setIncidents(realIncidents);
      }

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value);
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      console.error("Data load error:", err);
      setError("Backend unreachable — retrying...");
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredPrices = Object.entries(prices).filter(([pair]) =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5 shadow-lg shadow-indigo-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:inline">
              DeFi<span className="text-indigo-500">Sentinel</span>
            </span>
          </div>

          <div className="flex-1 px-4 sm:px-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets (ETH, USDC, LINK...)"
                className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative hidden rounded-full p-2 text-white/30 hover:bg-white/5 hover:text-white transition-colors sm:block">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="rounded-full p-2 text-white/30 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-white/10 mx-1 sm:mx-0"></div>
            <button
              onClick={() => setIsWalletConnected(!isWalletConnected)}
              className={`rounded-full px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-black transition-all active:scale-95 ${
                isWalletConnected
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
              }`}
            >
              {isWalletConnected ? "0x14...0e28" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ Only show error banner for real backend errors, never for fallback */}
      {error && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500">
              {error}
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Activity className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {isWalletConnected ? "User Position Monitoring" : "Global Protocol Forensics"}
              </span>
            </div>
            <h1 className="mt-2 text-5xl font-black tracking-tighter">
              Sentinel <span className="text-white/20">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-2 text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Last Sync: {lastUpdate ? lastUpdate.toLocaleTimeString() : "Synchronizing..."}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500"><Lock className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Value Guarded</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">$1,245,600</div>
            <div className="mt-1 flex items-center gap-1.5 relative">
              <span className="text-xs text-emerald-400 font-bold">+12.4%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400"><Shield className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Protocols</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">12</div>
            <div className="mt-1 text-xs text-indigo-400 font-bold">4 High Alert</div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500"><Zap className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">CRE Workflows</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">8</div>
            <div className="mt-1 text-xs text-amber-400 font-bold">24 Running</div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500"><Activity className="h-5 w-5" /></div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Anomaly Score</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">14<span className="text-sm text-white/20 ml-1">/100</span></div>
            <div className="mt-1 text-xs text-emerald-400 font-bold uppercase tracking-tighter">Low Correlation</div>
          </div>
        </div>

        {/* Market Analytics */}
        <div className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Market Analytics</h2>
            <button
              onClick={loadData}
              className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-all border border-indigo-500/30 px-4 py-2 rounded-full hover:bg-indigo-500/10"
            >
              Force Sync
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading && Object.keys(prices).length === 0 ? (
              // ✅ Clean loading skeleton instead of mock prices
              [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 animate-pulse h-36" />
              ))
            ) : filteredPrices.length > 0 ? (
              filteredPrices.map(([pair, data]: [string, any]) => (
                <PriceCard
                  key={pair}
                  pair={pair}
                  price={data.price}
                  timestamp={data.timestamp}
                  source={data.source}
                  change={0.42}
                />
              ))
            ) : searchQuery ? (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-16 text-center text-white/20 italic font-medium">
                No asset found matching "{searchQuery}"
              </div>
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-16 text-center text-white/20 italic font-medium">
                Connecting to price feeds...
              </div>
            )}
          </div>
        </div>

        {/* Incident Monitoring */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* ✅ Only real incidents — empty state if none */}
            {incidents.length > 0 ? (
              <IncidentTable incidents={incidents} />
            ) : (
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-16 text-center">
                <Shield className="h-10 w-10 text-emerald-500/30 mx-auto mb-4" />
                <p className="text-white/20 font-bold uppercase tracking-widest text-xs">
                  No Active Threats Detected
                </p>
                <p className="text-white/10 text-xs mt-2">
                  All monitored protocols operating normally
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/20 blur-3xl rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="text-xl font-black relative">Shield Your Protocol</h3>
              <p className="mt-4 text-sm text-white/80 leading-relaxed relative">
                Integrate Sentinel Core into your protocol's security layer for automated emergency actions.
              </p>
              <button
                onClick={() => alert("Protocol Onboarding Started!")}
                className="mt-8 w-full rounded-xl bg-white px-4 py-4 text-xs font-black text-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 relative uppercase tracking-widest"
              >
                Start Registration
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm shadow-inner">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                Service Health
              </h3>
              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Chainlink CRE</span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Forensic Nodes</span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Sepolia Network</span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase">
                    <div className="h-1 w-1 rounded-full bg-amber-500"></div>
                    {health?.sepolia ?? "Checking..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-6 md:flex-row sm:px-6 lg:px-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
          <div>© 2026 DeFi-Sentinel · Constellation Hackathon</div>
          <div className="flex gap-10">
            <a href="#" className="hover:text-indigo-400 transition-colors">Forensics API</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Github Repo</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Legal Disclosure</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
