"use client";
import React, { useState } from "react";
import { X, Key, Shield, Send, Globe, CheckCircle2 } from "lucide-react";

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({
        SEPOLIA_RPC_URL: "",
        PRIVATE_KEY: "",
        TELEGRAM_BOT_TOKEN: "",
        SENDGRID_API_KEY: "",
    });

    const [status, setStatus] = useState<{
        loading: boolean;
        success: boolean;
        error: string | null;
    }>({
        loading: false,
        success: false,
        error: null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, error: null });

        try {
            const response = await fetch("http://localhost:3001/api/status/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            const data = await response.json();
            if (data.success) {
                setStatus({ loading: false, success: true, error: null });
                setTimeout(() => setStatus(s => ({ ...s, success: false })), 3000);
            } else {
                throw new Error(data.error || "Failed to update configuration");
            }
        } catch (err: any) {
            setStatus({ loading: false, success: false, error: err.message });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f0f] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
                            <Key className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">System Config</h2>
                            <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Session Configuration</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-white/20 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block flex items-center gap-2">
                                <Globe className="h-3 w-3" /> Sepolia RPC URL
                            </label>
                            <input
                                type="text"
                                placeholder="https://eth-sepolia.g.alchemy.com/v2/..."
                                value={config.SEPOLIA_RPC_URL}
                                onChange={(e) => setConfig({ ...config, SEPOLIA_RPC_URL: e.target.value })}
                                className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block flex items-center gap-2">
                                <Shield className="h-3 w-3" /> Private Key
                            </label>
                            <input
                                type="password"
                                placeholder="0x..."
                                value={config.PRIVATE_KEY}
                                onChange={(e) => setConfig({ ...config, PRIVATE_KEY: e.target.value })}
                                className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block flex items-center gap-2">
                                    <Send className="h-3 w-3" /> Telegram Token
                                </label>
                                <input
                                    type="password"
                                    placeholder="Bot Token"
                                    value={config.TELEGRAM_BOT_TOKEN}
                                    onChange={(e) => setConfig({ ...config, TELEGRAM_BOT_TOKEN: e.target.value })}
                                    className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 block flex items-center gap-2">
                                    <Key className="h-3 w-3" /> SendGrid API
                                </label>
                                <input
                                    type="password"
                                    placeholder="SG.key..."
                                    value={config.SENDGRID_API_KEY}
                                    onChange={(e) => setConfig({ ...config, SENDGRID_API_KEY: e.target.value })}
                                    className="w-full rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-white placeholder:text-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-[9px] text-white/20 italic leading-relaxed text-center">
                        Note: These values are applied only to the current server session and are not stored permanently.
                    </p>

                    <button
                        type="submit"
                        disabled={status.loading}
                        className={`w-full rounded-xl py-4 text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${status.success
                                ? "bg-emerald-500 text-white"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                            }`}
                    >
                        {status.loading ? (
                            "Updating..."
                        ) : status.success ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Config Applied!
                            </>
                        ) : (
                            "Update Session Config"
                        )}
                    </button>

                    {status.error && (
                        <p className="text-center text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                            {status.error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ConfigModal;
