"use client";

import { useRef } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { RotateCcw, Download } from "lucide-react";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

interface PosterDisplayProps {
  posterUrl: string;
  brandName: string;
  tagline: string;
  onReset: () => void;
  sharingText?: SocialSharingText;
}

export default function PosterDisplay({ posterUrl, brandName, tagline }: PosterDisplayProps) {
  const posterRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = posterUrl;
    link.download = `ramadan-poster-${brandName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if posterUrl is a short URL (Supabase) or long base64
  const isBase64 = posterUrl.startsWith('data:');
  const qrCodeUrl = isBase64
    ? (typeof window !== 'undefined' ? `${window.location.origin}/activity-2` : 'https://leverate.com')
    : posterUrl;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-start justify-center animate-in fade-in duration-700">
      {/* Preview Section */}
      <div className="w-full max-w-[400px] mx-auto lg:mx-0 relative group">
        <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div 
          ref={posterRef}
          className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-500"
        >
          <img 
            src={posterUrl} 
            alt="Generated Poster" 
            className="absolute inset-0 w-full h-full object-cover" 
            crossOrigin="anonymous" 
          />
          
          {/* Overlay for Brand Info - rendered on the image */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 pt-24 text-center">
            <h2 className="text-3xl font-serif font-bold text-primary mb-2 drop-shadow-lg">{brandName}</h2>
            <p className="text-white font-medium tracking-wide drop-shadow-md">{tagline}</p>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex-1 w-full max-w-md mx-auto lg:mx-0 space-y-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-serif text-primary mb-2">You're the Star!</h2>
          <p className="text-gray-400">Your professional Ramadan campaign is ready.</p>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={handleDownload}
              className="btn btn-primary w-full"
            >
              <Download size={20} /> Download Poster
            </button>
            <Link href="/" className="btn btn-outline w-full no-underline">
              <RotateCcw size={20} /> Start Over
            </Link>
          </div>
        </div>

        <div className="glass-panel p-6 text-center">
          <p className="text-gray-400 text-sm mb-4 uppercase tracking-widest">
            {isBase64 ? 'Share This Page' : 'Scan to Download'}
          </p>
          <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
            <QRCodeSVG value={qrCodeUrl} size={120} />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {isBase64
              ? 'Scan to view page • Use download button to save'
              : 'Scan with your phone to download image'}
          </p>
        </div>
      </div>
    </div>
  );
}
