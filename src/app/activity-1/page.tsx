"use client";

import { useState } from "react";
import QuizForm from "./QuizForm";
import LetterDisplay from "./LetterDisplay";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

export default function Activity1Page() {
  const [result, setResult] = useState<{ letter: string; imageUrl: string; sharingText?: SocialSharingText } | null>(null);

  return (
    <main className="container" style={{ padding: "2rem 1rem", minHeight: "100vh" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", marginBottom: "2rem", color: "#a0a0a0" }}>
        <ArrowLeft size={20} style={{ marginRight: "0.5rem" }} />
        Back to Home
      </Link>

      <div className="flex-center" style={{ flexDirection: "column" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", marginBottom: "1rem", color: "var(--secondary)", textAlign: "center" }}>
          Surat Ucapan Lebaran
        </h1>
        <p style={{ color: "#a0a0a0", marginBottom: "3rem", textAlign: "center", maxWidth: "600px" }}>
          Create a personalized Eid greeting card with AI. Answer a few questions and let us craft the perfect message for your loved ones.
        </p>

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
    </main>
  );
}
