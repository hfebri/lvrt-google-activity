"use client";

import { useState } from "react";
import QuizForm from "./QuizForm";
import LetterDisplay from "./LetterDisplay";
import Link from "next/link";
import { ArrowLeft, Moon, Star } from "lucide-react";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

export default function Activity1Page() {
  const [result, setResult] = useState<{ letter: string; imageUrl: string; sharingText?: SocialSharingText } | null>(null);

  return (
    <main className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 text-primary/10 animate-[float_8s_ease-in-out_infinite]">
          <Moon size={120} />
        </div>
        <div className="absolute bottom-40 left-20 text-primary/5 animate-[float_12s_ease-in-out_infinite_reverse]">
          <Star size={80} />
        </div>
      </div>

      <div className="container relative z-10">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-6 group">
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
            Back to Home
          </Link>
          
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-primary">
              Lebaran Letter Creator
            </h1>
            <p className="text-slate-600 text-lg">
              Craft a heartfelt, AI-generated Eid greeting letter with a bespoke design for your loved ones.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          {result ? (
            <LetterDisplay
              letter={result.letter}
              imageUrl={result.imageUrl}
              sharingText={result.sharingText}
              onReset={() => setResult(null)}
            />
          ) : (
            <QuizForm onComplete={setResult} />
          )}
        </div>
      </div>
    </main>
  );
}
