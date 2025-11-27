"use client";

import { useRef, useState } from "react";
import styles from "./LetterDisplay.module.css";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { Download, RefreshCw, Share2, Copy, Check } from "lucide-react";
import type { SocialSharingText } from "@/lib/socialSharingTypes";

interface LetterDisplayProps {
  letter: string;
  imageUrl: string;
  onReset: () => void;
  sharingText?: SocialSharingText;
}

export default function LetterDisplay({ letter, imageUrl, onReset, sharingText }: LetterDisplayProps) {
  const letterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showSharing, setShowSharing] = useState(false);

  const handleDownload = async () => {
    if (letterRef.current) {
      try {
        const canvas = await html2canvas(letterRef.current, {
          useCORS: true, // Important for external images
          scale: 2, // Higher resolution
        });
        const link = document.createElement("a");
        link.download = "ucapan-lebaran.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download image. Please try again.");
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
        <div className={styles.letter} ref={letterRef}>
          <img src={imageUrl} alt="Background" className={styles.background} crossOrigin="anonymous" />
          <div className={styles.content}>
            <div className={styles.textWrapper}>
              <p className={styles.text}>{letter}</p>
            </div>
          </div>
          {/* Decorative Overlay could go here */}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.qrSection}>
          <p>Scan to Download</p>
          <div className={styles.qrCode}>
            {/* In a real app, this would link to the stored image URL or a shared page */}
            <QRCodeSVG value="https://leverate.com" size={100} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full justify-center">
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
