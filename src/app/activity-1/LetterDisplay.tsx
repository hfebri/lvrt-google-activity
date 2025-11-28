"use client";

import { useRef } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { RotateCcw } from "lucide-react";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

interface LetterDisplayProps {
  letter: string;
  imageUrl: string;
  onReset: () => void;
  sharingText?: SocialSharingText;
}

export default function LetterDisplay({ letter, imageUrl }: LetterDisplayProps) {
  const letterRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start justify-center animate-in fade-in duration-700">
      {/* Preview Section */}
      <div className="w-full max-w-[400px] mx-auto lg:mx-0 relative group">
        <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div 
          ref={letterRef}
          className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          <img 
            src={imageUrl} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover" 
            crossOrigin="anonymous" 
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/50 w-full max-h-[80%] overflow-y-auto custom-scrollbar">
              <p className="font-serif text-gray-900 text-center leading-relaxed whitespace-pre-wrap text-lg">
                {letter}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex-1 w-full max-w-md mx-auto lg:mx-0 space-y-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-serif text-primary mb-2">Your Greeting is Ready</h2>
          <p className="text-gray-400">Share your heartfelt message with the world.</p>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-col gap-4">
            <Link href="/" className="btn btn-primary w-full no-underline">
              <RotateCcw size={20} /> Start Over
            </Link>
          </div>
        </div>

        <div className="glass-panel p-6 text-center">
          <p className="text-gray-400 text-sm mb-4 uppercase tracking-widest">Scan to Download</p>
          <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
            <QRCodeSVG value="https://leverate.com" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
}
