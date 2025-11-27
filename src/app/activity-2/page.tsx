"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import IndustrySelector from "./IndustrySelector";
import WebcamCapture from "./WebcamCapture";
import PosterDisplay from "./PosterDisplay";
import { generatePoster } from "./actions";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

export default function Activity2Page() {
  const [step, setStep] = useState<"industry" | "camera" | "loading" | "result">("industry");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [capturedImage, setCapturedImage] = useState("");
  const [result, setResult] = useState<{ posterUrl: string; brandName: string; tagline: string; sharingText?: SocialSharingText } | null>(null);

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
    setStep("camera");
  };

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep("loading");
    
    try {
      const data = await generatePoster(selectedIndustry, imageSrc);
      setResult(data);
      setStep("result");
    } catch (error) {
      alert("Failed to generate poster. Please try again.");
      setStep("camera");
    }
  };

  const handleReset = () => {
    setStep("industry");
    setSelectedIndustry("");
    setCapturedImage("");
    setResult(null);
  };

  return (
    <main className="container" style={{ padding: "2rem 1rem", minHeight: "100vh" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", marginBottom: "2rem", color: "#a0a0a0" }}>
        <ArrowLeft size={20} style={{ marginRight: "0.5rem" }} />
        Back to Home
      </Link>

      <div className="flex-center" style={{ flexDirection: "column" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", marginBottom: "1rem", color: "var(--secondary)", textAlign: "center" }}>
          Foto Iklan Generator
        </h1>
        
        {step === "industry" && (
          <>
            <p style={{ color: "#a0a0a0", marginBottom: "3rem", textAlign: "center" }}>
              Choose an industry to start your brand campaign.
            </p>
            <IndustrySelector onSelect={handleIndustrySelect} />
          </>
        )}

        {step === "camera" && (
          <>
            <p style={{ color: "#a0a0a0", marginBottom: "2rem", textAlign: "center" }}>
              Take a photo for your advertisement. Smile!
            </p>
            <WebcamCapture onCapture={handleCapture} />
          </>
        )}

        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <Loader2 size={48} className="animate-spin" style={{ color: "var(--secondary)", marginBottom: "1rem" }} />
            <p style={{ fontSize: "1.2rem" }}>Generating your campaign...</p>
            <p style={{ color: "#a0a0a0", marginTop: "0.5rem" }}>Creating brand identity, designing poster, and applying magic.</p>
          </div>
        )}

        {step === "result" && result && (
          <PosterDisplay
            posterUrl={result.posterUrl}
            brandName={result.brandName}
            tagline={result.tagline}
            sharingText={result.sharingText}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}
