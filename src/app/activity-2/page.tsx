"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Star, Moon } from "lucide-react";
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
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  const handleIndustrySelect = (industry: string) => {
    setSelectedIndustry(industry);
    setStep("camera");
  };

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep("loading");
    setProgress(0);
    
    // Simulate progress
    const simulateProgress = (start: number, end: number, duration: number) => {
      const increment = (end - start) / (duration / 100);
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + increment;
          if (next >= end) {
            clearInterval(interval);
            return end;
          }
          return next;
        });
      }, 100);
      return interval;
    };

    try {
      setLoadingText("Analyzing your photo...");
      const p1 = simulateProgress(0, 30, 2000);
      
      // Wait a bit to simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(p1);
      setProgress(30);

      setLoadingText("Generating brand concept...");
      const p2 = simulateProgress(30, 60, 3000);
      
      const data = await generatePoster(selectedIndustry, imageSrc);
      clearInterval(p2);
      setProgress(60);

      setLoadingText("Designing final poster...");
      const p3 = simulateProgress(60, 95, 4000);
      
      // Artificial delay for effect if generation was too fast
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(p3);
      setProgress(100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setResult(data);
      setStep("result");
    } catch (error) {
      console.error(error);
      alert("Failed to generate poster. Please try again.");
      setStep("camera");
    }
  };

  const handleReset = () => {
    setStep("industry");
    setSelectedIndustry("");
    setCapturedImage("");
    setResult(null);
    setProgress(0);
  };

  return (
    <main className="min-h-screen py-12 px-4 relative overflow-hidden">
       {/* Background Decorative Elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 text-primary/10 animate-[float_8s_ease-in-out_infinite]">
          <Star size={120} />
        </div>
        <div className="absolute bottom-40 left-20 text-primary/5 animate-[float_12s_ease-in-out_infinite_reverse]">
          <Moon size={80} />
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
              Brand Star Generator
            </h1>
            <p className="text-slate-600 text-lg">
              Step into the spotlight. Choose an industry and let AI transform your photo into a stunning Ramadan campaign.
            </p>
          </div>
        </div>

        <div className="flex justify-center min-h-[500px]">
          {step === "industry" && (
            <div className="w-full">
              <h2 className="text-2xl font-serif text-center text-foreground mb-8">Choose Your Industry</h2>
              <IndustrySelector onSelect={handleIndustrySelect} />
            </div>
          )}

          {step === "camera" && (
            <div className="w-full">
              <h2 className="text-2xl font-serif text-center text-foreground mb-8">Take Your Photo</h2>
              <WebcamCapture onCapture={handleCapture} />
            </div>
          )}

          {step === "loading" && (
            <div className="flex flex-col items-center justify-center p-12 text-center w-full max-w-md mx-auto bg-surface/50 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="relative text-primary animate-spin" size={64} />
              </div>
              <h3 className="text-2xl font-serif text-primary mb-2">{loadingText}</h3>
              <p className="text-slate-600 mb-8 text-sm">AI is crafting your masterpiece...</p>
              
              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="mt-2 text-primary/80 font-mono text-sm">{Math.round(progress)}%</p>
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
      </div>
    </main>
  );
}
