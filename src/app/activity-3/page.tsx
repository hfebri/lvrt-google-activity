"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import GameCanvas from "./GameCanvas";
import { supabase } from "@/lib/supabase";

export default function Activity3Page() {
  const [gameState, setGameState] = useState<"playing" | "ended">("playing");
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const handleGameEnd = async (finalScore: number) => {
    setScore(finalScore);
    setGameState("ended");
    
    try {
      // Save score
      await supabase.from("scores").insert({ score: finalScore });
      
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
    <main className="container" style={{ padding: "2rem 1rem", minHeight: "100vh" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", marginBottom: "2rem", color: "#a0a0a0" }}>
        <ArrowLeft size={20} style={{ marginRight: "0.5rem" }} />
        Back to Home
      </Link>

      <div className="flex-center" style={{ flexDirection: "column" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", marginBottom: "1rem", color: "var(--secondary)", textAlign: "center" }}>
          Game Rebutan Takjil
        </h1>

        {gameState === "playing" ? (
          <>
            <p style={{ color: "#a0a0a0", marginBottom: "2rem", textAlign: "center" }}>
              Use your hand to catch the falling takjil!
            </p>
            <GameCanvas onEnd={handleGameEnd} />
          </>
        ) : (
          <div style={{ textAlign: "center", maxWidth: "500px", width: "100%" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "2rem", borderRadius: "1rem", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Game Over!</h2>
              <p style={{ fontSize: "1.5rem", color: "var(--secondary)", fontWeight: "bold" }}>
                Your Score: {score}
              </p>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", padding: "1.5rem", borderRadius: "1rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Trophy color="gold" /> Leaderboard
              </h3>
              <ul style={{ listStyle: "none", textAlign: "left" }}>
                {leaderboard.map((entry, i) => (
                  <li key={entry.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <span>#{i + 1} {entry.name || "Anonymous"}</span>
                    <span>{entry.score} pts</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => setGameState("playing")} 
              className="btn btn-primary" 
              style={{ marginTop: "2rem", width: "100%" }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
