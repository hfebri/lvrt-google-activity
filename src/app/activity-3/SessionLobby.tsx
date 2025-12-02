"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { User } from "lucide-react";
import type { Player } from "@/hooks/useMultiplayerSession";

interface SessionLobbyProps {
  sessionCode: string;
  players: Map<string, Player>;
  isHost: boolean;
  currentPlayerName: string;
  onStartGame: () => void;
  onCancel: () => void;
  onUpdatePlayerName: (name: string) => void;
}

export default function SessionLobby({
  sessionCode,
  players,
  isHost,
  currentPlayerName,
  onStartGame,
  onCancel,
  onUpdatePlayerName,
}: SessionLobbyProps) {
  const [nameInput, setNameInput] = useState(currentPlayerName);
  const [isEditingName, setIsEditingName] = useState(false);

  const sessionUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/activity-3?session=${sessionCode}`;
  const playerArray = Array.from(players.values());

  const handleNameSubmit = () => {
    const trimmedName = nameInput.trim();
    if (trimmedName && trimmedName !== currentPlayerName) {
      onUpdatePlayerName(trimmedName);
    }
    setIsEditingName(false);
  };

  return (
    <div className="items-center flex justify-center p-4">
      <div className="max-w-4xl w-full card p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">
            Game Lobby
          </h1>
          <p className="text-slate-700 mb-4">
            {isHost ? "Share this code with your friends!" : "Waiting for host to start..."}
          </p>

          {/* Player Name Input */}
          <div className="max-w-md mx-auto mt-6">
            {!isEditingName ? (
              <div className="flex items-center justify-center gap-2 sm:gap-3 bg-surface/30 border border-slate-200 rounded-lg p-2 sm:p-3">
                <User size={18} className="text-primary flex-shrink-0" />
                <span className="font-semibold text-foreground text-sm sm:text-base truncate">{currentPlayerName}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-primary hover:text-primary-hover underline ml-auto flex-shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="input-field flex-1 text-sm sm:text-base"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleNameSubmit}
                    className="btn btn-primary flex-1 sm:flex-none px-4 sm:px-6 text-sm sm:text-base"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setNameInput(currentPlayerName);
                      setIsEditingName(false);
                    }}
                    className="btn btn-outline flex-1 sm:flex-none px-4 sm:px-6 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <p className="text-[10px] sm:text-xs text-slate-500 mt-2 text-center">This name will be shown in the game and leaderboard</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Session Code & QR Code */}
          <div className="text-center">
            <div className="bg-surface/50 border border-slate-200 rounded-xl p-6 mb-4">
              <p className="text-sm text-slate-600 mb-2">Session Code</p>
              <p className="text-5xl font-bold text-primary tracking-wider font-mono">
                {sessionCode}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block shadow-lg border border-slate-100">
              <QRCodeSVG value={sessionUrl} size={200} level="H" />
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Scan QR code or enter code manually
            </p>
          </div>

          {/* Players List */}
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground mb-4">
              Players ({playerArray.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {playerArray.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                  <p>Waiting for players to join...</p>
                </div>
              ) : (
                playerArray.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 bg-surface/30 rounded-lg p-3 border border-slate-200"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: player.color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {player.name}
                      </p>
                      <p className="text-xs text-slate-600">
                        {player.id === players.keys().next().value && isHost
                          ? "Host"
                          : "Player"}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>

          {isHost && (
            <button
              onClick={onStartGame}
              disabled={playerArray.length < 1}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              Start Game
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-surface/30 border border-slate-200 rounded-lg p-4">
          <h3 className="font-serif font-semibold text-primary mb-2">Takjil War Rules:</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Battle for the best Takjil! Use your hands to snatch treats.</li>
            <li>• Pinch your thumb and index finger to grab items before they're gone.</li>
            <li>• Be faster than your friends, only the quickest hands eat first!</li>
            <li>• Collect the most points to become the Takjil Champion!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
