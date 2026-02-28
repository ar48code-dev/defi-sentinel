"use client";
import React from "react";
import { AlertTriangle, ShieldCheck, Zap, MoreHorizontal } from "lucide-react";

interface Incident {
    id: string;
    timestamp: number;
    protocol: string;
    description: string;
    threatLevel: "low" | "medium" | "high" | "critical";
    status: "active" | "mitigated" | "monitoring";
}

const levelColors = {
    low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    critical: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function IncidentTable({ incidents }: { incidents: Incident[] }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Live Threat Feed
                </h3>
                <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    View All
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40">
                            <th className="px-6 py-4 font-black">Timestamp</th>
                            <th className="px-6 py-4 font-black">Protocol</th>
                            <th className="px-6 py-4 font-black">Description</th>
                            <th className="px-6 py-4 font-black">Threat Level</th>
                            <th className="px-6 py-4 font-black">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {incidents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-white/30 italic">
                                    No active threats detected. Monitoring...
                                </td>
                            </tr>
                        ) : (
                            incidents.map((incident) => (
                                <tr key={incident.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-white/50">
                                        {new Date(incident.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                                                <Zap className="h-4 w-4 text-indigo-400" />
                                            </div>
                                            <span className="text-sm font-bold text-white">{incident.protocol}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-white/70 line-clamp-1">{incident.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${levelColors[incident.threatLevel]}`}>
                                            {incident.threatLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="rounded-lg p-1 text-white/30 hover:bg-white/5 hover:text-white transition-all">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
