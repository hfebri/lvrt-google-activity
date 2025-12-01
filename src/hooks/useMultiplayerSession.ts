import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface Player {
  id: string;
  name: string;
  score: number;
  handPosition: { x: number; y: number } | null;
  color: string;
}

export interface GameItem {
  id: string;
  type: string;
  position: { x: number; y: number };
  spawnedAt: number;
}

export interface MultiplayerState {
  sessionCode: string;
  players: Map<string, Player>;
  items: GameItem[];
  gameStatus: "waiting" | "playing" | "finished";
  isHost: boolean;
}

interface UseMultiplayerSessionOptions {
  sessionCode?: string;
  playerName?: string;
  onPlayerJoined?: (player: Player) => void;
  onPlayerLeft?: (playerId: string) => void;
  onItemCollected?: (itemId: string, playerId: string) => void;
  onGameStart?: () => void;
  onGameEnd?: () => void;
  onCountdownStart?: () => void;
}

const PLAYER_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#FFE66D", // Yellow
  "#95E1D3", // Mint
  "#F38181", // Pink
  "#AA96DA", // Purple
];

export function useMultiplayerSession(options: UseMultiplayerSessionOptions) {
  const [state, setState] = useState<MultiplayerState>({
    sessionCode: options.sessionCode || "",
    players: new Map(),
    items: [],
    gameStatus: "waiting",
    isHost: false,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const playerIdRef = useRef<string>(
    `player_${Math.random().toString(36).substring(2, 11)}`
  );

  // Generate random session code
  const generateSessionCode = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // Create a new session
  const createSession = useCallback(async () => {
    const code = generateSessionCode();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        session_code: code,
        status: "waiting",
        host_id: playerIdRef.current,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return null;
    }

    setState((prev) => ({
      ...prev,
      sessionCode: code,
      isHost: true,
    }));

    return code;
  }, [generateSessionCode]);

  // Join existing session
  const joinSession = useCallback(async (code: string) => {
    const { data, error } = await supabase
      .from("sessions")
      .select()
      .eq("session_code", code)
      .single();

    if (error || !data) {
      console.error("Session not found:", error);
      return false;
    }

    if (data.status === "finished") {
      console.error("Session already finished");
      return false;
    }

    setState((prev) => ({
      ...prev,
      sessionCode: code,
      isHost: false,
      gameStatus: data.status,
    }));

    return true;
  }, []);

  // Start countdown (host only)
  const startCountdown = useCallback(() => {
    if (!state.isHost || !state.sessionCode) return;

    channelRef.current?.send({
      type: "broadcast",
      event: "countdown_start",
      payload: {},
    });

    options.onCountdownStart?.();
  }, [state.isHost, state.sessionCode, options]);

  // Start game (host only) - called after countdown
  const startGame = useCallback(async () => {
    if (!state.isHost || !state.sessionCode) return;

    await supabase
      .from("sessions")
      .update({ status: "playing", started_at: new Date().toISOString() })
      .eq("session_code", state.sessionCode);

    channelRef.current?.send({
      type: "broadcast",
      event: "game_start",
      payload: {},
    });

    setState((prev) => ({ ...prev, gameStatus: "playing" }));
    options.onGameStart?.();
  }, [state.isHost, state.sessionCode, options]);

  // Broadcast hand position
  const updateHandPosition = useCallback(
    (x: number, y: number) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "hand_position",
        payload: { playerId: playerIdRef.current, x, y },
      });
    },
    []
  );

  // Broadcast item collection
  const collectItem = useCallback(
    (itemId: string, score: number) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "item_collected",
        payload: {
          itemId,
          playerId: playerIdRef.current,
          score,
          timestamp: Date.now(),
        },
      });
    },
    []
  );

  // Spawn new item (host only)
  const spawnItem = useCallback(
    (item: GameItem) => {
      if (!state.isHost) return;

      channelRef.current?.send({
        type: "broadcast",
        event: "item_spawn",
        payload: item,
      });

      setState((prev) => ({
        ...prev,
        items: [...prev.items, item],
      }));
    },
    [state.isHost]
  );

  // Update player score
  const updateScore = useCallback((score: number) => {
    setState((prev) => {
      const newPlayers = new Map(prev.players);
      const player = newPlayers.get(playerIdRef.current);
      if (player) {
        player.score = score;
        newPlayers.set(playerIdRef.current, player);
      }
      return { ...prev, players: newPlayers };
    });

    channelRef.current?.send({
      type: "broadcast",
      event: "score_update",
      payload: { playerId: playerIdRef.current, score },
    });
  }, []);

  // Setup realtime channel
  useEffect(() => {
    if (!state.sessionCode) return;

    const channel = supabase.channel(`session:${state.sessionCode}`, {
      config: {
        presence: {
          key: playerIdRef.current,
        },
      },
    });

    // Track presence
    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState();
        const newPlayers = new Map<string, Player>();

        Object.keys(presenceState).forEach((key, index) => {
          const presence = presenceState[key][0] as any;
          newPlayers.set(key, {
            id: key,
            name: (presence?.name as string) || `Player ${index + 1}`,
            score: (presence?.score as number) || 0,
            handPosition: (presence?.handPosition as { x: number; y: number }) || null,
            color: PLAYER_COLORS[index % PLAYER_COLORS.length],
          });
        });

        setState((prev) => ({ ...prev, players: newPlayers }));
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        const presence = newPresences[0] as any;
        const player: Player = {
          id: key,
          name: (presence?.name as string) || "Player",
          score: 0,
          handPosition: null,
          color: PLAYER_COLORS[state.players.size % PLAYER_COLORS.length],
        };
        options.onPlayerJoined?.(player);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        options.onPlayerLeft?.(key);
      })
      // Broadcast events
      .on("broadcast", { event: "countdown_start" }, () => {
        options.onCountdownStart?.();
      })
      .on("broadcast", { event: "game_start" }, () => {
        setState((prev) => ({ ...prev, gameStatus: "playing" }));
        options.onGameStart?.();
      })
      .on("broadcast", { event: "hand_position" }, ({ payload }) => {
        setState((prev) => {
          const newPlayers = new Map(prev.players);
          const player = newPlayers.get(payload.playerId);
          if (player) {
            player.handPosition = { x: payload.x, y: payload.y };
            newPlayers.set(payload.playerId, player);
          }
          return { ...prev, players: newPlayers };
        });
      })
      .on("broadcast", { event: "item_collected" }, ({ payload }) => {
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== payload.itemId),
        }));

        // Update player score
        setState((prev) => {
          const newPlayers = new Map(prev.players);
          const player = newPlayers.get(payload.playerId);
          if (player) {
            player.score = payload.score;
            newPlayers.set(payload.playerId, player);
          }
          return { ...prev, players: newPlayers };
        });

        options.onItemCollected?.(payload.itemId, payload.playerId);
      })
      .on("broadcast", { event: "item_spawn" }, ({ payload }) => {
        setState((prev) => ({
          ...prev,
          items: [...prev.items, payload],
        }));
      })
      .on("broadcast", { event: "score_update" }, ({ payload }) => {
        setState((prev) => {
          const newPlayers = new Map(prev.players);
          const player = newPlayers.get(payload.playerId);
          if (player) {
            player.score = payload.score;
            newPlayers.set(payload.playerId, player);
          }
          return { ...prev, players: newPlayers };
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: options.playerName || "Player",
            score: 0,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [state.sessionCode, options]);

  return {
    state,
    playerId: playerIdRef.current,
    createSession,
    joinSession,
    startCountdown,
    startGame,
    updateHandPosition,
    collectItem,
    spawnItem,
    updateScore,
  };
}
