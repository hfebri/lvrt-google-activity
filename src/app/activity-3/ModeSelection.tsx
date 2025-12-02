"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ModeSelectionProps {
  onSelectSinglePlayer: () => void;
  onSelectMultiplayer: () => void;
}

export default function ModeSelection({
  onSelectSinglePlayer,
  onSelectMultiplayer,
}: ModeSelectionProps) {
  return (
    <div className="items-center flex justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-4 group"
          >
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
            Back to Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-primary mb-4">
            Takjil War
          </h1>
          <p className="text-lg sm:text-xl text-slate-700">
            Choose your game mode
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Single Player Mode */}
          <button
            onClick={onSelectSinglePlayer}
            className="group relative bg-surface/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 hover:border-primary/50 hover:bg-surface-hover/60 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(192,160,98,0.2)] touch-manipulation min-h-[180px]"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                Single Player
              </h2>
              <p className="text-slate-600 group-hover:text-slate-800 transition-colors">
                Play solo and compete for the high score
              </p>
            </div>
          </button>

          {/* Multiplayer Mode */}
          <button
            onClick={onSelectMultiplayer}
            className="group relative bg-surface/50 backdrop-blur-md rounded-2xl p-6 border border-slate-200 hover:border-primary/50 hover:bg-surface-hover/60 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(192,160,98,0.2)] touch-manipulation min-h-[180px]"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                Multiplayer
              </h2>
              <p className="text-slate-600 group-hover:text-slate-800 transition-colors">
                Compete with friends in real-time
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center text-xs sm:text-sm text-primary/80 font-medium px-4">
          <p>Use hand gestures to collect takjil items!</p>
          <p className="mt-1">Pinch your thumb and index finger to grab items</p>
        </div>
      </div>
    </div>
  );
}
