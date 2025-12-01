"use client";

import { useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";

interface JoinSessionProps {
  onJoin: (code: string) => void;
  onBack: () => void;
  isJoining?: boolean;
  error?: string;
}

export default function JoinSession({
  onJoin,
  onBack,
  isJoining = false,
  error,
}: JoinSessionProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 6) {
      onJoin(code.trim().toUpperCase());
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className="items-center flex justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-6 group"
          disabled={isJoining}
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back
        </button>

        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">
              Join Game
            </h1>
            <p className="text-gray-400">
              Enter the 6-character session code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Code Input */}
            <div>
              <label
                htmlFor="session-code"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Session Code
              </label>
              <input
                id="session-code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="e.g., FLAME2"
                className="w-full px-4 py-3 bg-surface/50 border border-white/10 rounded-lg text-2xl font-mono text-center text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all tracking-widest"
                disabled={isJoining}
                autoFocus
                maxLength={6}
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {code.length}/6 characters
                </p>
                {code.length === 6 && (
                  <p className="text-xs text-green-500">✓ Ready to join</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {/* Join Button */}
            <button
              type="submit"
              disabled={code.length !== 6 || isJoining}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              {isJoining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Join Room
                </>
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-8 bg-surface/30 border border-white/5 rounded-lg p-4">
            <h3 className="font-serif font-semibold text-primary text-sm mb-2">
              How to join:
            </h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>1. Get the session code from the host</li>
              <li>2. Enter the 6-character code above</li>
              <li>3. Wait in the lobby for the host to start</li>
              <li>4. Compete with other players to collect items!</li>
            </ul>
          </div>
        </div>

        {/* Alternative Methods */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Alternative ways to join:</p>
          <div className="flex gap-2 justify-center">
            <button className="text-xs text-primary hover:text-primary-hover transition-colors border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/10">
              📷 Scan QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
