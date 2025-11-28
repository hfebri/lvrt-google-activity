"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { HandTracker } from "./HandTracker";
import { Play, Timer, Trophy } from "lucide-react";

interface GameStats {
  totalScore: number;
  itemsCollected: Record<string, number>;
}

interface GameCanvasProps {
  onEnd: (stats: GameStats) => void;
}

interface Takjil {
  id: number;
  type: string;
  positionIndex: number; // Index of the spawn point
  spawnTime: number;
  duration: number;
  state: "idle" | "stolen" | "collected"; 
}

interface Animation {
  id: number;
  type: "steal_hand" | "collect_sparkle";
  takjilType?: string;
  x: number;
  y: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  startTime: number;
  duration: number;
}

const TAKJIL_TYPES = ["Tahu", "Tempe", "Bakwan", "Singkong", "Risol"];
const COLORS = ["#FF5722", "#FFC107", "#8BC34A", "#795548", "#FF9800"];
const PRICE_PER_ITEM = 1000;

// Define 4 spawn points matching the plates on stall.png (full screen)
// Plates are on the middle shelf at approximately 55% height
const SPAWN_POINTS = [
  { x: 0.25, y: 0.55 }, // Left plate
  { x: 0.42, y: 0.55 }, // Center-left plate
  { x: 0.58, y: 0.55 }, // Center-right plate
  { x: 0.75, y: 0.55 }, // Right plate
];

export default function GameCanvas({ onEnd }: GameCanvasProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  const handTracker = useRef<HandTracker | null>(null);
  const takjils = useRef<Takjil[]>([]);
  const animations = useRef<Animation[]>([]);
  const itemsCollectedRef = useRef<Record<string, number>>({});
  const lastSpawn = useRef(0);
  const gameLoopRef = useRef<number>(0);
  const handResults = useRef<any>(null);
  const isPinchingRef = useRef(false);
  const stallImage = useRef<HTMLImageElement | null>(null);
  const foodImages = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const initTracker = async () => {
      const tracker = new HandTracker();
      await tracker.init();
      handTracker.current = tracker;
      setCalibrated(true);
    };
    initTracker();

    // Load stall image
    const img = new Image();
    img.src = "/stall.png";
    img.onload = () => {
      stallImage.current = img;
    };

    // Load food pixel art images
    TAKJIL_TYPES.forEach((foodType) => {
      const foodImg = new Image();
      foodImg.src = `/${foodType.toLowerCase()}.png`;
      foodImg.onload = () => {
        foodImages.current[foodType] = foodImg;
      };
    });

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
    animations.current = [];
    itemsCollectedRef.current = {};
    TAKJIL_TYPES.forEach(type => itemsCollectedRef.current[type] = 0);
    
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
    onEnd({
      totalScore: scoreRef.current,
      itemsCollected: itemsCollectedRef.current
    });
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

    // --- Draw Stall Image (Full Screen) ---
    if (stallImage.current) {
      // Cover entire canvas to give immersive "buying from stall" feeling
      // Calculate aspect ratios to determine how to fill the screen
      const imageAspect = stallImage.current.width / stallImage.current.height;
      const canvasAspect = width / height;

      let drawWidth, drawHeight, drawX, drawY;

      if (canvasAspect > imageAspect) {
        // Canvas is wider, fit to width
        drawWidth = width;
        drawHeight = width / imageAspect;
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      } else {
        // Canvas is taller, fit to height
        drawHeight = height;
        drawWidth = height * imageAspect;
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      }

      ctx.drawImage(stallImage.current, drawX, drawY, drawWidth, drawHeight);
    }

    // --- Spawn Logic ---
    if (timestamp - lastSpawn.current > 1000) { // Spawn every 1s
      const availableSpots = SPAWN_POINTS.map((_, i) => i).filter(
        i => !takjils.current.some(t => t.positionIndex === i)
      );

      if (availableSpots.length > 0) {
        const spotIndex = availableSpots[Math.floor(Math.random() * availableSpots.length)];
        const typeIndex = Math.floor(Math.random() * TAKJIL_TYPES.length);

        // NPC difficulty increases over time (starts slower, gets faster)
        // Start: 4000ms (4 seconds - easy)
        // End: 1500ms (1.5 seconds - very hard)
        const gameProgress = Math.min(timeLeft / GAME_DURATION, 1); // 1 at start, 0 at end
        const npcDuration = 4000 - (gameProgress * 2500); // 4000ms -> 1500ms

        takjils.current.push({
          id: Math.random(),
          type: TAKJIL_TYPES[typeIndex],
          positionIndex: spotIndex,
          spawnTime: timestamp,
          duration: npcDuration,
          state: "idle",
        });
        lastSpawn.current = timestamp;
      }
    }

    // --- Update & Draw Takjil ---
    takjils.current.forEach((t, index) => {
      if (t.state !== "idle") return; // Handled by animation or removed

      const spot = SPAWN_POINTS[t.positionIndex];
      const x = spot.x * width;
      const y = spot.y * height;
      const size = 60;

      // Check expiry (Stolen Logic)
      if (timestamp - t.spawnTime > t.duration) {
        t.state = "stolen";
        // Trigger Steal Animation
        const exitLeft = Math.random() > 0.5;
        const endX = exitLeft ? -100 : width + 100;
        const endY = y + 50;

        animations.current.push({
          id: Math.random(),
          type: "steal_hand",
          takjilType: t.type,
          x: x,
          y: y,
          startX: x,
          startY: y,
          endX: endX,
          endY: endY,
          startTime: timestamp,
          duration: 500, // Faster steal
        });
        
        // Remove from active takjils immediately (visuals handled by animation)
        takjils.current.splice(index, 1);
        return;
      }

      // Draw Takjil with pixel art
      const foodImg = foodImages.current[t.type];

      // Add a glow if it's about to disappear (Warning)
      const timeLeft = t.duration - (timestamp - t.spawnTime);
      if (timeLeft < 1000) {
        // Pulse effect
        const pulse = Math.sin(timestamp / 50) * 0.2 + 0.8;
        ctx.globalAlpha = pulse;
      }

      if (foodImg) {
        // Draw pixel art image
        ctx.drawImage(foodImg, x - size/2, y - size/2, size, size);
      } else {
        // Fallback to colored square if image not loaded yet
        ctx.fillStyle = COLORS[TAKJIL_TYPES.indexOf(t.type)];
        ctx.beginPath();
        ctx.roundRect(x - size/2, y - size/2, size, size, 12);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      
      // Text
      ctx.fillStyle = "white";
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.type, x, y + 45);
    });

    // --- Hand Tracking & Interaction ---
    if (handResults.current && handResults.current.landmarks) {
      for (const landmarks of handResults.current.landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        // Mirror X coordinates
        const thumbX = (1 - thumbTip.x) * width;
        const thumbY = thumbTip.y * height;
        const indexX = (1 - indexTip.x) * width;
        const indexY = indexTip.y * height;

        const distance = Math.hypot(thumbX - indexX, thumbY - indexY);
        const isPinching = distance < 40;

        const cursorX = (thumbX + indexX) / 2;
        const cursorY = (thumbY + indexY) / 2;

        // Draw Hand Cursor
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = isPinching ? "#0ea5e9" : "rgba(192, 160, 98, 0.8)";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

        if (isPinching) {
          ctx.beginPath();
          ctx.moveTo(thumbX, thumbY);
          ctx.lineTo(indexX, indexY);
          ctx.strokeStyle = "#0ea5e9";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Interaction Logic (Player Collect)
        if (isPinching && !isPinchingRef.current) {
          takjils.current.forEach((t, i) => {
            if (t.state !== "idle") return;

            const spot = SPAWN_POINTS[t.positionIndex];
            const tx = spot.x * width;
            const ty = spot.y * height;
            const size = 60;

            if (
              cursorX > tx - size/2 && 
              cursorX < tx + size/2 && 
              cursorY > ty - size/2 && 
              cursorY < ty + size/2
            ) {
              // Pick up!
              t.state = "collected";
              scoreRef.current += PRICE_PER_ITEM;
              setScore(scoreRef.current);
              
              // Track Item
              itemsCollectedRef.current[t.type] = (itemsCollectedRef.current[t.type] || 0) + 1;
              
              // Trigger Collect Animation (Sparkle)
              animations.current.push({
                id: Math.random(),
                type: "collect_sparkle",
                x: tx,
                y: ty,
                startTime: timestamp,
                duration: 500,
              });

              // Remove from active takjils
              takjils.current.splice(i, 1);
            }
          });
        }
        
        isPinchingRef.current = isPinching;
      }
    }

    // --- Draw Animations ---
    animations.current.forEach((anim, index) => {
      const progress = (timestamp - anim.startTime) / anim.duration;
      
      if (progress >= 1) {
        animations.current.splice(index, 1);
        return;
      }

      if (anim.type === "steal_hand") {
        // Hand Steal Animation
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentX = (anim.startX || 0) + ((anim.endX || 0) - (anim.startX || 0)) * ease;
        const currentY = (anim.startY || 0) + ((anim.endY || 0) - (anim.startY || 0)) * ease;

        // Draw Item being stolen with pixel art
        const size = 60;
        const foodImg = foodImages.current[anim.takjilType || ""];

        if (foodImg) {
          ctx.drawImage(foodImg, currentX - size/2, currentY - size/2, size, size);
        } else {
          // Fallback to colored square
          ctx.fillStyle = COLORS[TAKJIL_TYPES.indexOf(anim.takjilType || "")];
          ctx.beginPath();
          ctx.roundRect(currentX - size/2, currentY - size/2, size, size, 12);
          ctx.fill();
        }

        // Draw Hand holding it
        ctx.fillStyle = "#fca5a5"; // Skin tone
        ctx.beginPath();
        ctx.arc(currentX + 10, currentY + 10, 30, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = "#f87171";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(currentX - 20, currentY);
        ctx.lineTo(currentX + 10, currentY - 10);
        ctx.moveTo(currentX - 20, currentY + 10);
        ctx.lineTo(currentX + 10, currentY + 10);
        ctx.stroke();

        // "Stolen!" Text
        if (progress < 0.5) {
          ctx.fillStyle = "#ef4444"; // Red
          ctx.font = "bold 20px Inter, sans-serif";
          ctx.fillText("Taken!", currentX, currentY - 40);
        }

      } else if (anim.type === "collect_sparkle") {
        // Success Sparkle
        const scale = 1 + progress;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.translate(anim.x, anim.y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        
        // Star burst
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(30, 0);
          ctx.stroke();
        }
        
        // Score popup
        ctx.restore();
        ctx.globalAlpha = 1.0 - progress;
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText("+Rp 1k", anim.x, anim.y - 30 - (progress * 50));
        ctx.globalAlpha = 1.0;
      }
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="relative w-full mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group animate-in fade-in zoom-in duration-500" style={{ height: '80vh', maxWidth: '1200px' }}>
      <Webcam
        ref={webcamRef}
        className="absolute inset-0 w-full h-full object-cover mirrored"
        mirrored={true}
        audio={false}
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={960}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {gameStarted && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <div className="bg-surface/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <Trophy className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Bill</p>
              <p className="text-2xl font-bold text-white font-mono">Rp {score.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-surface/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg flex items-center gap-3">
            <div className={`p-2 rounded-full ${timeLeft <= 5 ? 'bg-red-500/20 animate-pulse' : 'bg-blue-500/20'}`}>
              <Timer className={`${timeLeft <= 5 ? 'text-red-500' : 'text-blue-400'}`} size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Time</p>
              <p className={`text-2xl font-bold font-mono ${timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</p>
            </div>
          </div>
        </div>
      )}

      {!gameStarted && calibrated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
          <div className="text-center">
            <h3 className="text-4xl font-serif text-white mb-6">Takjil War!</h3>
            <button 
              onClick={startGame} 
              className="btn btn-primary mx-auto text-xl px-12 py-4 shadow-[0_0_30px_rgba(192,160,98,0.4)] hover:shadow-[0_0_50px_rgba(192,160,98,0.6)] hover:scale-105 transition-all"
            >
              <Play fill="currentColor" /> Start Game
            </button>
            <div className="mt-6 text-gray-300 text-lg space-y-2">
              <p>Grab the takjil before others do!</p>
              <p><span className="text-primary font-bold">Pinch</span> to collect. Don't let them steal it!</p>
            </div>
          </div>
        </div>
      )}

      {!calibrated && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-xl text-white font-medium">Initializing Hand Tracker...</p>
        </div>
      )}
    </div>
  );
}
