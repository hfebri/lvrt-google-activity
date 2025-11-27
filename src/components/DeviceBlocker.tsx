"use client";

import { useEffect, useState } from "react";
import styles from "./DeviceBlocker.module.css";

export default function DeviceBlocker() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      // Also check screen width just in case
      const isSmallScreen = window.innerWidth < 768;

      // We want to allow iPad (which might be detected as mobile/tablet) but block phones.
      // iPad usually has width >= 768.
      // So if it's mobile AND small screen, block it.
      // Or if it's strictly a phone user agent.
      
      // Simplest check for "Mobile Phone":
      if (isMobileDevice && isSmallScreen) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (!isMobile) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h1>Desktop or Tablet Required</h1>
        <p>
          This experience is designed for iPad and Desktop. Please switch devices to continue.
        </p>
      </div>
    </div>
  );
}
