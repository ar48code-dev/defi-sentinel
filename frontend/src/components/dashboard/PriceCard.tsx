"use client";
import React from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface PriceCardProps {
    pair: string;
    price: number;
    change?: number;
    timestamp: number;
}

export default function PriceCard({ pair, price, change = 0, timestamp }: PriceCardProps) {
    const isPositive = change >= 0;

    const [timeString, setTimeString] = React.useState<string>("");

    React.useEffect(() => {
        setTimeString(new Date(timestamp * 1000).toLocaleTimeString());
    }, [timestamp]);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:bg-white/[0.07]"
        >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>

            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/50">{pair}</span>
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    }`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(change).toFixed(2)}%
                </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">$</span>
                <span className="text-3xl font-black tracking-tight text-white">
                    {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-1 text-[10px] text-white/30">
                    <Clock className="h-3 w-3" />
                    {timeString || "..."}
                </div>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
                    <div
                        className={`h-full rounded-full ${isPositive ? "bg-emerald-500" : "bg-rose-500"}`}
                        style={{ width: `${Math.min(100, Math.abs(change) * 20)}%` }}
                    ></div>
                </div>
            </div>
        </motion.div>
    );
}
