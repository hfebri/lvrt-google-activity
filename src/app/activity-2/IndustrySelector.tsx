"use client";

import { Utensils, Truck, Smartphone, Shirt, Landmark, Plane } from "lucide-react";

interface IndustrySelectorProps {
  onSelect: (industry: string) => void;
}

const industries = [
  { id: "FNB", name: "F&B", icon: Utensils },
  { id: "Logistics", name: "Logistics", icon: Truck },
  { id: "Telco", name: "Telco", icon: Smartphone },
  { id: "Fashion", name: "Fashion", icon: Shirt },
  { id: "Banking", name: "Banking", icon: Landmark },
  { id: "Travel", name: "Travel", icon: Plane },
];

export default function IndustrySelector({ onSelect }: IndustrySelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 px-4">
      {industries.map((ind, index) => (
        <button
          key={ind.id}
          className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-surface/50 backdrop-blur-md border border-white/5 hover:border-primary/50 active:border-primary/70 transition-all duration-300 hover:-translate-y-2 active:scale-95 hover:shadow-[0_10px_30px_rgba(192,160,98,0.15)] touch-manipulation min-h-[140px] sm:min-h-[160px]"
          onClick={() => onSelect(ind.id)}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Gold Glow effect on hover */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-primary blur-xl"
          />
          
          <div
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300 group-hover:scale-110 shadow-lg bg-white/5 group-hover:bg-primary/20 border border-white/10 group-hover:border-primary/50"
          >
            <ind.icon size={32} className="text-gray-300 group-hover:text-primary transition-colors duration-300" />
          </div>

          <span className="relative text-lg sm:text-xl font-serif font-semibold text-gray-400 group-hover:text-primary transition-colors duration-300">
            {ind.name}
          </span>
        </button>
      ))}
    </div>
  );
}
