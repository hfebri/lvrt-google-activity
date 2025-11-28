"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Receipt } from "lucide-react";
import GameCanvas from "./GameCanvas";
import { supabase } from "@/lib/supabase";

interface GameStats {
  totalScore: number;
  itemsCollected: Record<string, number>;
}

export default function Activity3Page() {
  const [gameState, setGameState] = useState<"playing" | "ended">("playing");
  const [score, setScore] = useState(0);
  const [itemsCollected, setItemsCollected] = useState<Record<string, number>>({});
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const handleGameEnd = async (stats: GameStats) => {
    setScore(stats.totalScore);
    setItemsCollected(stats.itemsCollected);
    setGameState("ended");
    
    try {
      // Save score
      await supabase.from("scores").insert({ score: stats.totalScore });
      
      // Fetch leaderboard
      const { data } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(5);
        
      if (data) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-6 group">
            <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
            Back to Home
          </Link>
        </div>

        <div className="flex justify-center">
          {gameState === "playing" ? (
            <GameCanvas onEnd={handleGameEnd} />
          ) : (
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
              <div className="glass-panel p-8 text-center mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent" />
                
                <h2 className="text-3xl font-serif text-white mb-6">Payment Due</h2>
                
                {/* Receipt Paper Effect */}
                <div className="bg-white text-slate-900 p-6 rounded-sm shadow-lg mb-6 max-w-xs mx-auto relative font-mono text-sm transform rotate-1">
                  {/* Jagged top/bottom edges (simulated with CSS or SVG if needed, keeping simple for now) */}
                  <div className="border-b-2 border-dashed border-slate-300 pb-4 mb-4 text-center">
                    <h3 className="text-xl font-bold uppercase">Warung Takjil</h3>
                    <p className="text-xs text-slate-500">Ramadan Nights Special</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {Object.entries(itemsCollected).map(([item, count]) => (
                      count > 0 && (
                        <div key={item} className="flex justify-between">
                          <span>{count}x {item}</span>
                          <span>Rp {(count * 1000).toLocaleString()}</span>
                        </div>
                      )
                    ))}
                    {Object.values(itemsCollected).every(c => c === 0) && (
                      <div className="text-center italic text-slate-400">No items collected</div>
                    )}
                  </div>
                  
                  <div className="border-t-2 border-dashed border-slate-300 pt-4 flex justify-between font-bold text-lg">
                    <span>TOTAL</span>
                    <span>Rp {score.toLocaleString()}</span>
                  </div>
                  
                  <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Thank you for shopping!</p>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setGameState("playing")} 
                  className="btn btn-primary w-full"
                >
                  <RotateCcw size={20} /> Play Again
                </button>
              </div>

              <div className="glass-panel p-6">
                <h3 className="flex items-center justify-center gap-2 text-xl font-serif text-white mb-6">
                  <Trophy className="text-yellow-500" /> Leaderboard
                </h3>
                
                <div className="space-y-3">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((entry, i) => (
                      <div 
                        key={entry.id} 
                        className={`flex justify-between items-center p-4 rounded-xl border ${
                          i === 0 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/50' 
                            : 'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                            i === 0 ? 'bg-yellow-500 text-black' : 
                            i === 1 ? 'bg-gray-400 text-black' :
                            i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'
                          }`}>
                            {i + 1}
                          </div>
                          <span className="font-medium text-gray-200">Player {entry.id.toString().slice(0, 4)}</span>
                        </div>
                        <span className="font-mono font-bold text-primary">Rp {entry.score.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No high scores yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
