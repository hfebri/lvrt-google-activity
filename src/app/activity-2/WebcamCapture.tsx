"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Camera, RefreshCcw, Check, Maximize } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);

  // Auto-capture after 5 seconds when webcam is ready
  useEffect(() => {
    if (isWebcamReady && !imgSrc && countdown === null) {
      setCountdown(5);
    }
  }, [isWebcamReady, imgSrc, countdown]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        capture();
        setCountdown(null);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImgSrc(image);
      setCountdown(null);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setCountdown(5); // Restart countdown
  };

  const confirm = () => {
    if (imgSrc) {
      onCapture(imgSrc);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto animate-in fade-in zoom-in duration-500">
      <div className="relative w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group">
        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-50">
          <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/30 rounded-full" />
        </div>

        {imgSrc ? (
          <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover mirrored"
              mirrored={true}
              videoConstraints={{
                facingMode: "user",
                aspectRatio: 9 / 16,
              }}
              onUserMedia={() => setIsWebcamReady(true)}
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                <div className="text-center">
                  <div className="text-8xl font-bold text-white animate-ping mb-4">{countdown}</div>
                  <p className="text-xl text-primary font-semibold tracking-widest uppercase">Get Ready!</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 w-full flex justify-center">
        {!imgSrc ? (
          <button 
            onClick={capture} 
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-white border-4 border-gray-200 shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={countdown !== null && countdown > 0}
          >
            <div className="w-16 h-16 rounded-full border-2 border-black group-hover:bg-gray-100 transition-colors" />
            <Camera className="absolute text-gray-800" size={32} />
          </button>
        ) : (
          <div className="flex gap-4 w-full">
            <button onClick={retake} className="btn flex-1 bg-red-500/80 hover:bg-red-600 text-white border-none">
              <RefreshCcw size={20} /> Retake
            </button>
            <button onClick={confirm} className="btn btn-primary flex-1">
              <Check size={20} /> Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
