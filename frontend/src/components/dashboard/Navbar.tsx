"use client";
import React from "react";
import { Shield, Bell, Settings, Search } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-600 p-1.5 shadow-lg shadow-indigo-500/20">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        DeFi<span className="text-indigo-500">Sentinel</span>
                    </span>
                </div>

                <div className="hidden flex-1 px-8 md:block">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search assets, protocols..."
                            className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative rounded-full p-2 text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                        </span>
                    </button>
                    <button className="rounded-full p-2 text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                        <Settings className="h-5 w-5" />
                    </button>
                    <div className="h-8 w-px bg-white/10"></div>
                    <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors">
                        Connect Wallet
                    </button>
                </div>
            </div>
        </nav>
    );
}
