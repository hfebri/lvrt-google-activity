"use client";

import { useRef, useState } from "react";
import styles from "./PosterDisplay.module.css";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Share2, Copy, Check } from "lucide-react";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

interface PosterDisplayProps {
  posterUrl: string;
  brandName: string;
  tagline: string;
  onReset: () => void;
  sharingText?: SocialSharingText;
}

export default function PosterDisplay({ posterUrl, brandName, tagline, onReset, sharingText }: PosterDisplayProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showSharing, setShowSharing] = useState(false);

  const handleDownload = async () => {
    if (posterRef.current) {
      try {
        const canvas = await html2canvas(posterRef.current, {
          useCORS: true,
          scale: 2,
        });
        const link = document.createElement("a");
        link.download = "iklan-ramadan.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download image.");
      }
    }
  };

  const handleCopySharing = () => {
    if (!sharingText) return;

    const text = `${sharingText.caption}\n\n${sharingText.hashtags.join(" ")}\n\n${sharingText.callToAction}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.previewWrapper}>
        <div className={styles.poster} ref={posterRef}>
          <img src={posterUrl} alt="Generated Poster" className={styles.background} crossOrigin="anonymous" />
          <div className={styles.overlay}>
            <div className={styles.brandInfo}>
              <h2 className={styles.brandName}>{brandName}</h2>
              <p className={styles.tagline}>{tagline}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.qrSection}>
          <p>Scan to Download</p>
          <div className={styles.qrCode}>
            <QRCodeSVG value="https://leverate.com" size={100} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full justify-center">
          <button
            onClick={handleDownload}
            className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Download size={20} />
            Download Poster
          </button>
          {sharingText && (
            <button
              onClick={() => setShowSharing(!showSharing)}
              className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              <Share2 size={20} />
              Share
            </button>
          )}
          <button
            onClick={onReset}
            className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
          >
            <RefreshCw size={20} />
            Create Another
          </button>
        </div>

        {showSharing && sharingText && (
          <div className={styles.sharingBox}>
            <h4>Share on Social Media</h4>
            <div className={styles.sharingContent}>
              <p>{sharingText.caption}</p>
              <p className={styles.hashtags}>{sharingText.hashtags.join(" ")}</p>
              <p className={styles.cta}>{sharingText.callToAction}</p>
            </div>
            <button onClick={handleCopySharing} className="btn btn-primary">
              {copied ? (
                <>
                  <Check size={20} style={{ marginRight: "0.5rem" }} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} style={{ marginRight: "0.5rem" }} />
                  Copy Sharing Text
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
