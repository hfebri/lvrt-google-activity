"use client";

import { ArrowLeft } from "lucide-react";

interface HostOrJoinProps {
  onSelectHost: () => void;
  onSelectJoin: () => void;
  onBack: () => void;
}

export default function HostOrJoin({
  onSelectHost,
  onSelectJoin,
  onBack,
}: HostOrJoinProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-6 group"
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Mode Selection
        </button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-primary mb-4">
            Multiplayer
          </h1>
          <p className="text-xl text-gray-400">
            Choose how you want to play
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Host Room */}
          <button
            onClick={onSelectHost}
            className="group relative card p-8 hover:shadow-2xl transition-all duration-300 border-2 border-white/10 hover:border-primary/50 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Host Room
              </h2>
              <p className="text-gray-400">
                Create a new game session and invite friends
              </p>
              <div className="mt-4 text-sm text-gray-500">
                <p>• Generate session code</p>
                <p>• Share QR code</p>
                <p>• Start game when ready</p>
              </div>
            </div>
          </button>

          {/* Join Room */}
          <button
            onClick={onSelectJoin}
            className="group relative card p-8 hover:shadow-2xl transition-all duration-300 border-2 border-white/10 hover:border-primary/50 hover:scale-105"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                <svg
                  className="w-10 h-10 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                Join Room
              </h2>
              <p className="text-gray-400">
                Enter a session code to join an existing game
              </p>
              <div className="mt-4 text-sm text-gray-500">
                <p>• Enter session code</p>
                <p>• Wait in lobby</p>
                <p>• Play when host starts</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Tip: Use hand gestures to collect takjil items!</p>
          <p className="mt-1">Pinch your thumb and index finger to grab items</p>
        </div>
      </div>
    </div>
  );
}
