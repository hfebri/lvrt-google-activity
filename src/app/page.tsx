import styles from "./page.module.css";
import ActivityCard from "@/components/ActivityCard";
import { Mail, Camera, Gamepad2 } from "lucide-react";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Ramadhan Interactive Hub</h1>
        <p className={styles.subtitle}>
          Celebrate the holy month with Leverate. Create personalized greetings, 
          generate unique brand ads, or challenge yourself in our Takjil game.
        </p>
      </div>

      <div className={styles.grid}>
        <ActivityCard
          title="Surat Ucapan Lebaran"
          description="Create a heartfelt, AI-generated Eid greeting letter with a custom design."
          icon={Mail}
          href="/activity-1"
          color="#4CAF50" // Green for religious/peaceful vibe
        />
        <ActivityCard
          title="Foto Iklan Generator"
          description="Star in your own brand advertisement. Choose an industry and let AI do the rest."
          icon={Camera}
          href="/activity-2"
          color="#2196F3" // Blue for professional/business vibe
        />
        <ActivityCard
          title="Game Rebutan Takjil"
          description="Catch falling takjil snacks in this interactive hand-tracking game."
          icon={Gamepad2}
          href="/activity-3"
          color="#FF9800" // Orange for fun/energy
        />
      </div>
    </main>
  );
}
