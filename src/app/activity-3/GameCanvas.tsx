"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { HandTracker } from "./HandTracker";
import styles from "./GameCanvas.module.css";
import { supabase } from "@/lib/supabase";

interface GameCanvasProps {
  onEnd: (score: number) => void;
}

interface Takjil {
  id: number;
  x: number;
  y: number;
  type: string;
  speed: number;
}

const TAKJIL_TYPES = ["Tahu", "Cireng", "Bakwan", "Singkong", "Risol"];
const COLORS = ["#FF5722", "#FFC107", "#8BC34A", "#795548", "#FF9800"];

export default function GameCanvas({ onEnd }: GameCanvasProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  
  const handTracker = useRef<HandTracker | null>(null);
  const takjils = useRef<Takjil[]>([]);
  const lastSpawn = useRef(0);
  const gameLoopRef = useRef<number>(0);
  const handResults = useRef<any>(null);

  useEffect(() => {
    const initTracker = async () => {
      const tracker = new HandTracker();
      await tracker.init();
      handTracker.current = tracker;
      setCalibrated(true);
    };
    initTracker();

    const handleHandResults = (e: any) => {
      handResults.current = e.detail;
    };
    window.addEventListener("hand-results", handleHandResults);

    return () => {
      window.removeEventListener("hand-results", handleHandResults);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const startGame = () => {
    if (!webcamRef.current?.video || !handTracker.current) return;
    
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    takjils.current = [];
    
    handTracker.current.start(webcamRef.current.video);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    handTracker.current?.stop();
    onEnd(score); // Pass current score, but wait, score is state. 
    // We need to use a ref for score if we want it inside the loop, or just pass the state value if onEnd is called from effect.
    // But endGame is called from interval. State might be stale in closure?
    // Actually, setTimeLeft callback is safe. But onEnd(score) might use stale score.
    // Better to use a ref for score tracking in loop.
  };

  // Use ref for score to avoid stale closures in game loop
  const scoreRef = useRef(0);

  const gameLoop = (timestamp: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Spawn Takjil
    if (timestamp - lastSpawn.current > 1000) { // Spawn every 1s
      const typeIndex = Math.floor(Math.random() * TAKJIL_TYPES.length);
      takjils.current.push({
        id: Math.random(),
        x: Math.random() * (width - 50),
        y: -50,
        type: TAKJIL_TYPES[typeIndex],
        speed: 2 + Math.random() * 2,
      });
      lastSpawn.current = timestamp;
    }

    // Update & Draw Takjil
    takjils.current.forEach((t, index) => {
      t.y += t.speed;
      
      // Draw
      ctx.fillStyle = COLORS[TAKJIL_TYPES.indexOf(t.type)];
      ctx.fillRect(t.x, t.y, 50, 50);
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(t.type, t.x + 5, t.y + 30);

      // Remove if off screen
      if (t.y > height) {
        takjils.current.splice(index, 1);
      }
    });

    // Check Collisions (Hand)
    if (handResults.current && handResults.current.landmarks) {
      for (const landmarks of handResults.current.landmarks) {
        // Index finger tip is index 8
        const indexTip = landmarks[8];
        // Mirror the x coordinate because the webcam view is mirrored
        const x = (1 - indexTip.x) * width; 
        const y = indexTip.y * height;

        // Draw Hand Cursor
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();

        // Check overlap
        takjils.current.forEach((t, i) => {
          if (x > t.x && x < t.x + 50 && y > t.y && y < t.y + 50) {
            // Caught!
            takjils.current.splice(i, 1);
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
        });
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  // Wrap onEnd to use ref
  useEffect(() => {
    if (timeLeft === 0) {
      onEnd(scoreRef.current);
    }
  }, [timeLeft, onEnd]);

  return (
    <div className={styles.container}>
      <div className={styles.gameArea}>
        <Webcam
          ref={webcamRef}
          className={styles.webcam}
          mirrored
          audio={false}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={styles.canvas}
        />
        
        {gameStarted && (
          <div className={styles.hud}>
            <div className={styles.score}>Score: {score}</div>
            <div className={styles.timer}>Time: {timeLeft}</div>
          </div>
        )}

        {!gameStarted && calibrated && (
          <div className={styles.overlay}>
            <button onClick={startGame} className="btn btn-primary" style={{ fontSize: "1.5rem" }}>
              Start Game
            </button>
          </div>
        )}

        {!calibrated && (
          <div className={styles.overlay}>
            <p>Loading Hand Tracker...</p>
          </div>
        )}
      </div>
    </div>
  );
}
