import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ActivityCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string; // Kept for backward compatibility but might override for theme consistency
}

export default function ActivityCard({ title, description, icon: Icon, href }: ActivityCardProps) {
  return (
    <Link href={href} className="group relative block h-full touch-manipulation">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />

      <div className="card h-full flex flex-col items-center text-center relative z-10 border border-slate-200 group-hover:border-primary/50 active:border-primary overflow-hidden group-hover:scale-105 active:scale-95 transition-transform duration-300">
        {/* Decorative circle background for icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />

        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-full bg-surface border border-slate-200 shadow-lg group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 relative">
          <Icon size={28} className="text-primary group-hover:text-foreground transition-colors sm:w-8 sm:h-8" />
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold mb-3 text-primary group-hover:text-primary-hover transition-colors px-4">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed group-hover:text-slate-800 transition-colors px-4">
          {description}
        </p>

        <div className="mt-auto opacity-0 sm:opacity-100 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 font-semibold text-primary flex items-center gap-2 text-sm sm:text-base">
          Start Experience <span className="text-xl">→</span>
        </div>
      </div>
    </Link>
  );
}
