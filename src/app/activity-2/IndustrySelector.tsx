"use client";

import styles from "./IndustrySelector.module.css";
import { Utensils, Truck, Smartphone, Shirt, Landmark, Plane } from "lucide-react";

interface IndustrySelectorProps {
  onSelect: (industry: string) => void;
}

const industries = [
  { id: "FNB", name: "F&B", icon: Utensils, color: "#FF5722" },
  { id: "Logistics", name: "Logistics", icon: Truck, color: "#FFC107" },
  { id: "Telco", name: "Telco", icon: Smartphone, color: "#2196F3" },
  { id: "Fashion", name: "Fashion", icon: Shirt, color: "#E91E63" },
  { id: "Banking", name: "Banking", icon: Landmark, color: "#4CAF50" },
  { id: "Travel", name: "Travel", icon: Plane, color: "#00BCD4" },
];

export default function IndustrySelector({ onSelect }: IndustrySelectorProps) {
  return (
    <div className={styles.grid}>
      {industries.map((ind) => (
        <button
          key={ind.id}
          className={styles.card}
          onClick={() => onSelect(ind.id)}
          style={{ borderColor: ind.color }}
        >
          <div className={styles.iconWrapper} style={{ backgroundColor: ind.color }}>
            <ind.icon size={32} color="white" />
          </div>
          <span className={styles.name}>{ind.name}</span>
        </button>
      ))}
    </div>
  );
}
