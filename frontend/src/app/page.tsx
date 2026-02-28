"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import PriceCard from "@/components/dashboard/PriceCard";
import IncidentTable from "@/components/dashboard/IncidentTable";
import { Shield, Activity, Lock, Zap, RefreshCw } from "lucide-react";
import { fetchPrices, fetchIncidents, fetchHealth } from "@/lib/api/backend";

export default function Home() {
  const [prices, setPrices] = useState<any>({});
  const [incidents, setIncidents] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadData = async () => {
    try {
      const [priceData, incidentData, healthData] = await Promise.all([
        fetchPrices(),
        fetchIncidents(),
        fetchHealth()
      ]);

      setPrices(priceData.data || {});
      setIncidents(incidentData.data || []);
      setHealth(healthData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest transition-all">System Monitoring Active</span>
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Sentinel <span className="text-white/40">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/60">
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-500">
                <Lock className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/50">Total Value Guarded</span>
            </div>
            <div className="mt-4 text-3xl font-black">$1.2M</div>
            <div className="mt-1 text-xs text-emerald-500 font-bold">+12.4% vs last week</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/50">Active Protocols</span>
            </div>
            <div className="mt-4 text-3xl font-black">12</div>
            <div className="mt-1 text-xs text-indigo-400 font-bold">4 on high alert</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2 text-amber-500">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/50">CRE Workflows</span>
            </div>
            <div className="mt-4 text-3xl font-black">8</div>
            <div className="mt-1 text-xs text-amber-500 font-bold">24 executions today</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-500/20 p-2 text-rose-500">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-white/50">Anomaly Score</span>
            </div>
            <div className="mt-4 text-3xl font-black">14<span className="text-sm text-white/30 ml-1">/100</span></div>
            <div className="mt-1 text-xs text-emerald-500 font-bold">Low correlation</div>
          </div>
        </div>

        {/* Real-time Prices */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Market Feeds</h2>
            <button className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
              Refresh All
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(prices).length > 0 ? (
              Object.entries(prices).map(([pair, data]: [string, any]) => (
                <PriceCard
                  key={pair}
                  pair={pair}
                  price={data.price}
                  timestamp={data.timestamp}
                  change={0.42} // Would be calculated in real app
                />
              ))
            ) : (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5 border border-white/10"></div>
              ))
            )}
          </div>
        </div>

        {/* Incident Table */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <IncidentTable incidents={incidents} />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-indigo-600 p-6 shadow-2xl shadow-indigo-600/20">
              <h3 className="text-lg font-bold">Secure Your Protocol</h3>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">
                Connect your protocol to Sentinel Core to enable automated emergency actions and real-time forensics.
              </p>
              <button className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-white/90 transition-all active:scale-95">
                Register Protocol
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold">System Status</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Chainlink CRE</span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase text-[10px]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Data Feeds</span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase text-[10px]">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    Synched
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Sepolia RPC</span>
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold uppercase text-[10px]">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                    Slow
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-6 md:flex-row sm:px-6 lg:px-8 text-white/40 text-xs">
          <div>© 2026 DeFi-Sentinel. Built for Chainlink Hackathon.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Github</a>
            <a href="#" className="hover:text-white transition-colors">Security Audit</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

