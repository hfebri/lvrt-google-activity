"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { HandTracker } from "./HandTracker";
import { Play, Timer, Trophy } from "lucide-react";
import type { Player } from "@/hooks/useMultiplayerSession";

interface GameStats {
  totalScore: number;
  itemsCollected: Record<string, number>;
}

interface GameCanvasProps {
  onEnd: (stats: GameStats) => void;
  isMultiplayer?: boolean;
  multiplayerSession?: {
    state: {
      players: Map<string, Player>;
      items: any[];
      isHost: boolean;
    };
    playerId: string;
    startCountdown: () => void;
    updateHandPosition: (x: number, y: number) => void;
    collectItem: (itemId: string, score: number) => void;
    spawnItem: (item: any) => void;
    updateScore: (score: number) => void;
  };
  countdownTriggerRef?: React.MutableRefObject<(() => void) | null>;
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
const GAME_DURATION = 30; // Game duration in seconds

// Helper function to get size based on screen width
const getTakjilSize = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768 ? 80 : 150; // Smaller on mobile
  }
  return 150;
};

// Helper function to get stall scale based on screen width
const getStallScale = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768 ? 0.45 : 0.7; // Much smaller on mobile
  }
  return 0.7;
};

// Define 4 spawn points matching the plates on stall.png (full screen)
// Plates are positioned lower to sit on the actual plates
const SPAWN_POINTS = [
  { x: 0.28, y: 0.60 }, // Left plate
  { x: 0.42, y: 0.60 }, // Center-left plate
  { x: 0.56, y: 0.60 }, // Center-right plate
  { x: 0.72, y: 0.60 }, // Right plate
];

export default function GameCanvas({ onEnd, isMultiplayer = false, multiplayerSession, countdownTriggerRef }: GameCanvasProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showStartButton, setShowStartButton] = useState(true);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use ref for score to avoid stale closures in game loop
  const scoreRef = useRef(0);

  // Define countdown sequence function
  const startCountdownSequence = useCallback(() => {
    setShowStartButton(false);
    setCountdown(3);

    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Countdown: 3, 2, 1, then start
    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        startGameActual();
      }
    }, 1000);
  }, []);

  const startGameActual = () => {
    if (!webcamRef.current?.video || !handTracker.current) return;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

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
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Delay endGame to avoid state update during render
          setTimeout(() => endGame(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartClick = () => {
    setShowStartButton(false);

    // Broadcast countdown start in multiplayer
    if (isMultiplayer && multiplayerSession) {
      multiplayerSession.startCountdown();
    }

    // Start countdown
    startCountdownSequence();
  };

  // Expose countdown function via ref for multiplayer
  useEffect(() => {
    if (countdownTriggerRef) {
      countdownTriggerRef.current = startCountdownSequence;
    }
  }, [countdownTriggerRef, startCountdownSequence]);

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

      // Clean up game loop
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }

      // Clean up timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Stop hand tracker when component unmounts
      if (handTracker.current) {
        handTracker.current.stop();
      }
    };
  }, []);

  const endGame = () => {
    // Clean up game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = 0;
    }

    // Clean up timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop hand tracking
    if (handTracker.current) {
      handTracker.current.stop();
    }

    onEnd({
      totalScore: scoreRef.current,
      itemsCollected: itemsCollectedRef.current
    });
  };

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
      const STALL_SCALE = getStallScale(); // Use dynamic scale based on screen size

      let drawWidth, drawHeight, drawX, drawY;

      if (canvasAspect > imageAspect) {
        // Canvas is wider, fit to width
        drawWidth = width * STALL_SCALE;
        drawHeight = (width / imageAspect) * STALL_SCALE;
        drawX = (width - drawWidth) / 2; // Center horizontally
        drawY = (height - drawHeight) / 2 + 30; // Move down 30 pixels
      } else {
        // Canvas is taller, fit to height
        drawHeight = height * STALL_SCALE;
        drawWidth = height * imageAspect * STALL_SCALE;
        drawX = (width - drawWidth) / 2;
        drawY = (height - drawHeight) / 2 + 30; // Move down 30 pixels
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

        // NPC difficulty increases over time (starts slower, gets faster in last 15 seconds)
        // First 15 seconds (30-15): 4000ms (4 seconds - easy, slow)
        // Last 15 seconds (15-0): 4000ms -> 1500ms (getting faster)
        let npcDuration = 4000; // Default slow speed
        if (timeLeft <= 15) {
          // In last 15 seconds, speed increases: 4000ms -> 1500ms
          const lastPhaseProgress = timeLeft / 15; // 1 at second 15, 0 at second 0
          npcDuration = 1500 + (lastPhaseProgress * 2500); // 4000ms -> 1500ms
        }

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
      const size = getTakjilSize();

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

        // Broadcast hand position in multiplayer
        if (isMultiplayer && multiplayerSession) {
          multiplayerSession.updateHandPosition(cursorX / width, cursorY / height);
        }

        // Draw Hand Cursor (current player)
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
            const size = getTakjilSize();

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

              // Broadcast collection in multiplayer
              if (isMultiplayer && multiplayerSession) {
                multiplayerSession.collectItem(String(t.id), scoreRef.current);
                multiplayerSession.updateScore(scoreRef.current);
              }

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
        const size = getTakjilSize();
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

    // --- Draw Other Players' Cursors (Multiplayer) ---
    if (isMultiplayer && multiplayerSession) {
      multiplayerSession.state.players.forEach((player) => {
        if (player.id === multiplayerSession.playerId) return; // Skip current player
        if (!player.handPosition) return;

        const px = player.handPosition.x * width;
        const py = player.handPosition.y * height;

        // Draw other player's cursor
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, 2 * Math.PI);
        ctx.fillStyle = player.color;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Draw player name
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.strokeText(player.name, px, py - 20);
        ctx.fillText(player.name, px, py - 20);
      });
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="relative w-full mx-auto bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/10 group animate-in fade-in zoom-in duration-500 flex items-center justify-center" style={{ height: 'min(80vh, 600px)', maxWidth: '1200px' }}>
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
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-start z-20 gap-2">
          <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-slate-200 shadow-lg flex items-center gap-2 sm:gap-3">
            <div className="bg-primary/20 p-1 sm:p-2 rounded-full">
              <Trophy className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">Bill</p>
              <p className="text-base sm:text-2xl font-bold text-slate-900 font-mono">Rp {score.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-slate-200 shadow-lg flex items-center gap-2 sm:gap-3">
            <div className={`p-1 sm:p-2 rounded-full ${timeLeft <= 5 ? 'bg-red-500/20 animate-pulse' : 'bg-blue-500/20'}`}>
              <Timer className={`${timeLeft <= 5 ? 'text-red-500' : 'text-blue-500'}`} size={20} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">Time</p>
              <p className={`text-base sm:text-2xl font-bold font-mono ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-900'}`}>{timeLeft}s</p>
            </div>
          </div>
        </div>
      )}

      {/* Multiplayer Scoreboard */}
      {gameStarted && isMultiplayer && multiplayerSession && multiplayerSession.state.players.size > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg min-w-[200px]">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 text-center">
              Players
            </p>
            <div className="space-y-1">
              {Array.from(multiplayerSession.state.players.values())
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between gap-3 px-2 py-1 rounded ${
                      player.id === multiplayerSession.playerId
                        ? 'bg-primary/20'
                        : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="text-sm text-white font-medium">
                        {player.name}
                        {player.id === multiplayerSession.playerId && ' (You)'}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-primary font-bold">
                      Rp {player.score.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {!gameStarted && calibrated && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30 px-4">
          <div className="text-center">
            {countdown !== null ? (
              // Countdown Display
              <div className="animate-in zoom-in duration-300">
                <div className="text-6xl sm:text-9xl font-bold text-primary mb-4 drop-shadow-[0_0_30px_rgba(192,160,98,0.8)] animate-pulse">
                  {countdown}
                </div>
                <p className="text-xl sm:text-2xl text-white font-semibold">Get Ready!</p>
              </div>
            ) : (
              // Start Screen
              <>
                <h3 className="text-2xl sm:text-4xl font-serif text-white mb-6">Takjil War!</h3>
                {(!isMultiplayer || (multiplayerSession?.state.isHost)) && showStartButton && (
                  <button
                    onClick={handleStartClick}
                    className="btn btn-primary mx-auto text-base sm:text-xl px-8 sm:px-12 py-3 sm:py-4 shadow-[0_0_30px_rgba(192,160,98,0.4)] hover:shadow-[0_0_50px_rgba(192,160,98,0.6)] hover:scale-105 active:scale-95 transition-all touch-manipulation min-h-[44px]"
                  >
                    <Play fill="currentColor" /> Start Game
                  </button>
                )}
                {isMultiplayer && !multiplayerSession?.state.isHost && (
                  <div className="bg-surface/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10">
                    <p className="text-base sm:text-xl text-slate-900">Waiting for host to start the game...</p>
                    <div className="mt-4 flex justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce mx-1" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce mx-1" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce mx-1" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div className="mt-6 text-gray-300 text-sm sm:text-lg space-y-2">
                  <p>Grab the takjil before others do!</p>
                  <p><span className="text-primary font-bold">Pinch</span> to collect. Don't let them steal it!</p>
                </div>
              </>
            )}
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
