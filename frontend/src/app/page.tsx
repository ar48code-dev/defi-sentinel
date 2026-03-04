"use client";
import React, { useState, useEffect } from "react";
import PriceCard from "@/components/dashboard/PriceCard";
import IncidentTable from "@/components/dashboard/IncidentTable";
import ConfigModal from "@/components/dashboard/ConfigModal";
import { Shield, Activity, Lock, Zap, RefreshCw, AlertTriangle, Search, Bell, Settings, CheckCircle2 } from "lucide-react";
import { fetchPrices, fetchIncidents, fetchHealth } from "@/lib/api/backend";

import { connectWallet, getConnectedAddress, formatAddress, depositToVault } from "@/lib/wallet";

const MOCK_PRICES = {
  "ETH/USD": { price: 2845.42, timestamp: Math.floor(Date.now() / 1000), source: "fallback" },
  "USDC/USD": { price: 1.00, timestamp: Math.floor(Date.now() / 1000), source: "fallback" },
  "DAI/USD": { price: 1.00, timestamp: Math.floor(Date.now() / 1000), source: "fallback" },
  "LINK/USD": { price: 18.24, timestamp: Math.floor(Date.now() / 1000), source: "fallback" }
};

export default function Home() {
  const [prices, setPrices] = useState<any>(MOCK_PRICES); // Start with mocks for UX
  const [incidents, setIncidents] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [threshold, setThreshold] = useState(1.3);

  // Sarah's Scenario State (Mocking a position for demo if wallet connected)
  const [userPosition, setUserPosition] = useState<any>(null);

  const handleConnectWallet = async () => {
    try {
      const data = await connectWallet();
      setWalletAddress(data.address);
      // Simulate fetching Sarah's position
      setUserPosition({
        collateral: 10000,
        borrowed: 5000,
        healthFactor: 1.45,
        protectionReserve: 500,
        status: "safe"
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [priceRes, incidentRes, healthRes] = await Promise.allSettled([
        fetchPrices(),
        fetchIncidents(),
        fetchHealth()
      ]);

      let syncWarning = false;

      if (priceRes.status === "fulfilled" && priceRes.value.success) {
        setPrices(priceRes.value.data);
      } else {
        syncWarning = true;
      }

      if (incidentRes.status === "fulfilled" && incidentRes.value.success) {
        setIncidents(incidentRes.value.data);
      } else {
        syncWarning = true;
      }

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value);
      }

      setLastUpdate(new Date());
      setError(syncWarning ? "Limited Blockchain Sync" : null);
    } catch (err: any) {
      console.error("Data load error:", err);
      // Don't set error if we have prices already
      if (Object.keys(prices).length === 0) {
        setError("Fallback Mode: Local Forensic Cache");
      }
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const checkWallet = async () => {
      const addr = await getConnectedAddress();
      if (addr) setWalletAddress(addr);
    };
    checkWallet();

    // Setup listeners for account changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        setWalletAddress(accounts[0] || null);
      });
    }

    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredPrices = Object.entries(prices).filter(([pair]) =>
    pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      {/* Integrated Interactive Navbar */}
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
              onClick={walletAddress ? undefined : handleConnectWallet}
              className={`rounded-full px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-black transition-all active:scale-95 ${walletAddress
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
                }`}
            >
              {walletAddress ? formatAddress(walletAddress) : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>

      {/* Global Notices */}
      {error && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 overflow-hidden">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500 whitespace-nowrap">
              {error}
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Activity className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                {walletAddress ? "User Position Monitoring" : "Global Protocol Forensics"}
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

        {/* User Position (Sarah's Scenario) */}
        {walletAddress && userPosition && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Auto-Protection Active
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                <div className="md:col-span-1">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Aave V3 Position</h3>
                  <div className="space-y-1">
                    <p className="text-3xl font-black">${userPosition.collateral.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Total Collateral (USDC)</p>
                  </div>
                  <div className="mt-6 space-y-1 text-rose-400">
                    <p className="text-2xl font-black">${userPosition.borrowed.toLocaleString()}</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Total Borrowed (ETH)</p>
                  </div>
                </div>

                <div className="md:col-span-1 flex flex-col justify-center border-l border-white/5 pl-8">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Health Factor</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-emerald-400">{userPosition.healthFactor}</span>
                    <span className="mb-1.5 text-xs font-bold text-white/20">/ 1.0</span>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-1000"
                      style={{ width: `${Math.min(userPosition.healthFactor * 50, 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-4">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter block mb-1">
                      Protection Threshold: <span className="text-indigo-400">{threshold}</span>
                    </label>
                    <input
                      type="range"
                      min="1.1"
                      max="2.0"
                      step="0.05"
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-1 flex flex-col justify-center border-l border-white/5 pl-8">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">SentinelVault Reserve</h3>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-indigo-400">${userPosition.protectionReserve.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Available for Top-up</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const amount = prompt("Enter amount to deposit (USDC):", "100");
                        if (amount) {
                          const val = parseFloat(amount);
                          if (isNaN(val)) return alert("Invalid amount");
                          const res = await depositToVault(val);
                          alert(`✅ Deposit Confirmed! Tx: ${res.hash}`);
                          setUserPosition({ ...userPosition, protectionReserve: userPosition.protectionReserve + val });
                        }
                      } catch (err: any) {
                        alert(`Error: ${err.message}`);
                      }
                    }}
                    className="mt-4 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                  >
                    Deposit Risk-Free
                  </button>
                </div>

                <div className="md:col-span-1 flex flex-col justify-center items-center bg-white/5 rounded-2xl p-4 border border-white/5">
                  <Shield className="h-8 w-8 text-indigo-500 mb-2" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Protection Active</p>
                  <p className="mt-2 text-[10px] text-center text-white/40 font-medium px-4 leading-relaxed">
                    Auto-topping up from Vault if Health Factor drops below <span className="text-white font-bold">{threshold}</span>.
                    <br />
                    <span className="text-[8px] text-emerald-400 mt-1 block">CONNECTED TO ETHEREUM MAINNET (VIA SEPOLIA)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* High-Level Stats */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                <Lock className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Value Guarded</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">$1,245,600</div>
            <div className="mt-1 flex items-center gap-1.5 relative">
              <span className="text-xs text-emerald-400 font-bold">+12.4%</span>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-tight bg-white/5 px-1 rounded">Chainlink · Sepolia</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Protocols</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">12</div>
            <div className="mt-1 flex items-center gap-1.5 relative">
              <span className="text-xs text-indigo-400 font-bold">4 High Alert</span>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-tight bg-white/5 px-1 rounded">Chainlink · Sepolia</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">CRE Workflows</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">8</div>
            <div className="mt-1 flex items-center gap-1.5 relative">
              <span className="text-xs text-amber-400 font-bold">24 Running</span>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-tight bg-white/5 px-1 rounded">Chainlink · Sepolia</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-3 relative">
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Anomaly Score</span>
            </div>
            <div className="mt-4 text-4xl font-black relative">14<span className="text-sm text-white/20 ml-1">/100</span></div>
            <div className="mt-1 text-xs text-emerald-400 font-bold relative uppercase tracking-tighter">Low Correlation</div>
          </div>
        </div>

        {/* Asset Feeds */}
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
            {filteredPrices.length > 0 ? (
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
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-16 text-center text-white/20 italic font-medium">
                No asset found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Incident Monitoring & Protocol Guard */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Activity className="h-5 w-5 text-rose-500" />
                Live Incident Forensics
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newIncident = {
                      id: `inc-${Date.now()}`,
                      timestamp: Date.now(),
                      protocol: "Aave V3",
                      description: "🚨 High value deposit detected ($50M) — Anomaly Score: 84/100",
                      threatLevel: "high",
                      status: "active",
                      source: "ai-detection"
                    };
                    setIncidents([newIncident, ...incidents]);
                    alert("🚨 CRITICAL ALERT: Large whale deposit detected on Aave. AI scoring threat level: 4/5. Execution of 'Pause Borrows' recommended.");
                  }}
                  className="text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded-full hover:bg-rose-500/20 transition-all uppercase tracking-widest"
                >
                  Simulate Whale Anomaly
                </button>
              </div>
            </div>
            <IncidentTable incidents={incidents} />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/20 blur-3xl rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              <h3 className="text-xl font-black relative">Protocol Command Center</h3>
              <p className="mt-4 text-sm text-white/80 leading-relaxed relative">
                Automated 24/7 monitoring for protocol teams. High-fidelity anomaly detection and autonomous incident response.
              </p>
              <div className="mt-6 space-y-3 relative text-[10px] font-black uppercase tracking-widest text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Register Protocol addresses
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Connect Admin Multisig
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/20"></div> Define Safety Rules (No-Code)
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/20"></div> Approve Emergency Actions
                </div>
              </div>
              <button
                onClick={() => alert("Protocol Onboarding: 1. Register Addresses -> 2. Connect Multisig -> 3. Define Rules")}
                className="mt-8 w-full rounded-xl bg-white px-4 py-4 text-xs font-black text-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 relative uppercase tracking-widest"
              >
                Register Your Protocol
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm shadow-inner">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                Security Infrastructure
              </h3>
              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Chainlink Functions</span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Anomaly Detection AI</span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></div>
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Global Node Sync</span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase">
                    <div className="h-1 w-2 rounded-full bg-amber-500"></div>
                    Syncing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-6 md:flex-row sm:px-6 lg:px-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            © 2026 DeFi-Sentinel · Protecting the Future of Finance
          </div>
          <div className="flex gap-10">
            <a href="https://defi-sentinel.app" className="hover:text-indigo-400 transition-colors">defi-sentinel.app</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Forensics API</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
