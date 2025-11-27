"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import styles from "./WebcamCapture.module.css";
import { Camera, RefreshCcw, Check } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImgSrc(image);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const confirm = () => {
    if (imgSrc) {
      onCapture(imgSrc);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.webcamWrapper}>
        {imgSrc ? (
          <img src={imgSrc} alt="Captured" className={styles.preview} />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className={styles.webcam}
            mirrored={true}
            videoConstraints={{
              facingMode: "user",
              aspectRatio: 9 / 16,
            }}
          />
        )}
      </div>

      <div className={styles.controls}>
        {!imgSrc ? (
          <button onClick={capture} className={styles.captureBtn}>
            <Camera size={32} />
          </button>
        ) : (
          <div className={styles.actionButtons}>
            <button onClick={retake} className="btn" style={{ background: "#f44336", color: "white" }}>
              <RefreshCcw size={20} style={{ marginRight: "0.5rem" }} />
              Retake
            </button>
            <button onClick={confirm} className="btn btn-primary">
              <Check size={20} style={{ marginRight: "0.5rem" }} />
              Use Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
