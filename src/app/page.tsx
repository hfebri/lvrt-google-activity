import ActivityCard from "@/components/ActivityCard";
import { Mail, Camera, Gamepad2, Moon, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 text-primary/20 animate-[float_8s_ease-in-out_infinite]">
          <Moon size={64} />
        </div>
        <div className="absolute top-40 right-20 text-primary/20 animate-[float_10s_ease-in-out_infinite_reverse]">
          <Star size={48} />
        </div>
        <div className="absolute bottom-20 left-1/4 text-primary/10 animate-[float_12s_ease-in-out_infinite]">
          <Star size={32} />
        </div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm tracking-widest uppercase">
            Ramadan 1446 H
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-primary drop-shadow-sm">
            Ramadan Nights
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Experience the magic of the holy month with Leverate. 
            Connect, create, and celebrate with our interactive digital experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <ActivityCard
            title="Greeting Letter"
            description="Craft a heartfelt, AI-generated Eid greeting letter with a bespoke design for your loved ones."
            icon={Mail}
            href="/activity-1"
          />
          <ActivityCard
            title="Brand Star"
            description="Step into the spotlight. Let AI transform your photo into a stunning Ramadan campaign."
            icon={Camera}
            href="/activity-2"
          />
          <ActivityCard
            title="Takjil Rush"
            description="Test your reflexes in this fast-paced hand-tracking game. Catch the takjil before sunset!"
            icon={Gamepad2}
            href="/activity-3"
          />
        </div>
        
        <footer className="mt-24 text-center text-gray-600 text-sm">
          <p>© 2025 Leverate Group. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
