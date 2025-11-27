import Link from "next/link";
import styles from "./ActivityCard.module.css";
import { LucideIcon } from "lucide-react";

interface ActivityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export default function ActivityCard({ title, description, icon: Icon, href, color }: ActivityCardProps) {
  return (
    <Link href={href} className={styles.card} style={{ borderColor: color }}>
      <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
        <Icon size={32} color="white" />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <div className={styles.arrow} style={{ color: color }}>
        Start Activity &rarr;
      </div>
    </Link>
  );
}
