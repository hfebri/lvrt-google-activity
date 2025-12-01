# Activity 3 - Complete User Flow Summary

## Quick Reference

### 🎮 Single Player
```
Start → Mode Selection → Single Player → Play → Results
```

### 👥 Multiplayer (Host)
```
Start → Mode Selection → Multiplayer → Host Room → Lobby → Start Game → Play → Results
```

### 🔗 Multiplayer (Join)
```
Start → Mode Selection → Multiplayer → Join Room → Enter Code → Lobby → Wait → Play → Results
```

### 📱 Quick Join (QR/URL)
```
Scan QR / Click URL → Auto-Join → Lobby → Wait → Play → Results
```

## All Screens Overview

### 1. Mode Selection
**Path**: `/activity-3`
**Purpose**: Choose game mode

**Options**:
- 🎯 Single Player → Direct to game
- 👥 Multiplayer → Go to Host/Join screen

**Actions**:
- Back to Home (/)

---

### 2. Host or Join ⭐ NEW
**Path**: Internal state
**Purpose**: Choose multiplayer role

**Options**:
- ➕ Host Room → Create new session
- 🔗 Join Room → Enter session code

**Actions**:
- Back to Mode Selection

---

### 3. Join Session ⭐ NEW
**Path**: Internal state
**Purpose**: Enter session code to join

**Features**:
- 6-character code input
- Auto-uppercase
- Character counter
- Validation
- Error messages

**Actions**:
- Join Room (submit code)
- Back to Host/Join

---

### 4. Session Lobby
**Path**: Internal state
**Purpose**: Wait for game to start

**For Host**:
- See session code
- See QR code
- See all players
- Start Game button
- Cancel button

**For Players**:
- See session code
- See all players
- Wait for host
- Cancel button

**Actions**:
- Start Game (host only)
- Cancel (back to Host/Join)

---

### 5. Game Playing
**Path**: Internal state
**Purpose**: Active gameplay

**Features**:
- Hand tracking
- Item collection
- Timer (30s)
- Score display
- Player cursors (multiplayer)
- Live scoreboard (multiplayer)

**No Actions** (must complete game)

---

### 6. Game Ended
**Path**: Internal state
**Purpose**: Show results

**Features**:
- Receipt-style summary
- Items collected
- Total score
- Leaderboard (top 5)

**Actions**:
- Play Again (back to Mode Selection)

---

## State Diagram

```
┌─────────────────┐
│ Mode Selection  │ (Initial)
└────┬────────────┘
     │
     ├─→ Single Player ─→ [Playing] ─→ [Ended]
     │
     └─→ Multiplayer
              │
              ▼
        ┌─────────────┐
        │ Host or Join│ ⭐ NEW
        └──┬──────────┘
           │
           ├─→ Host Room ─→ [Lobby] ─┐
           │                          │
           └─→ Join Room             │
                   │                  │
                   ▼                  │
           ┌──────────────┐         │
           │ Join Session │ ⭐ NEW  │
           └──┬───────────┘         │
              │                      │
              ├─→ Success ──────────┤
              │                      │
              └─→ Error (retry)      │
                                     │
                                     ▼
                              ┌─────────────┐
                              │   Lobby     │
                              └──┬──────────┘
                                 │
                                 ▼
                           [Host Starts]
                                 │
                                 ▼
                            ┌─────────┐
                            │ Playing │
                            └────┬────┘
                                 │
                                 ▼
                            ┌─────────┐
                            │  Ended  │
                            └─────────┘
```

## Key Features by Screen

| Screen | Features | Actions |
|--------|----------|---------|
| **Mode Selection** | 2 large cards | Select mode, Back home |
| **Host or Join** ⭐ | 2 large cards, descriptions | Host, Join, Back |
| **Join Session** ⭐ | Code input, validation, errors | Submit, Back |
| **Lobby** | Player list, QR code, session code | Start (host), Cancel |
| **Playing** | Game canvas, hand tracking, timer | None (auto-end) |
| **Ended** | Receipt, leaderboard | Play again |

## User Journey Examples

### Example 1: Quick Single Player
```
1. Open /activity-3
2. Click "Single Player"
3. Click "Start Game"
4. Play for 30 seconds
5. View score
6. Click "Play Again" (or go home)
```
**Time**: ~35 seconds

---

### Example 2: Host Multiplayer with Friends
```
1. Open /activity-3
2. Click "Multiplayer"
3. Click "Host Room"
4. Share session code "FLAME2" with friends
5. Wait for 3 friends to join
6. See all 4 players in lobby
7. Click "Start Game"
8. All players compete for 30 seconds
9. View results
10. Click "Play Again"
```
**Time**: ~2-5 minutes (including wait time)

---

### Example 3: Join Friend's Game
```
1. Friend sends: "Join FLAME2!"
2. Open /activity-3
3. Click "Multiplayer"
4. Click "Join Room"
5. Type "FLAME2"
6. Click "Join Room"
7. Wait in lobby for host to start
8. Host starts, compete for 30 seconds
9. View results
```
**Time**: ~1-3 minutes

---

### Example 4: Quick Join via QR Code
```
1. Friend shows QR code
2. Scan with phone camera
3. Opens /activity-3?session=FLAME2
4. Auto-joins session
5. Wait in lobby
6. Host starts game
7. Compete for 30 seconds
8. View results
```
**Time**: ~30 seconds to join

---

## Error Scenarios

### Scenario A: Invalid Session Code
```
User Flow:
1. Click "Join Room"
2. Enter "INVALID"
3. Click "Join Room"
4. ❌ Error: "Session not found..."
5. User can:
   - Try different code
   - Go back to Host/Join
   - Go back to Mode Selection
```

### Scenario B: Session Already Started
```
User Flow:
1. Scan QR code (game in progress)
2. Auto-validates session
3. ❌ Session has status "playing"
4. Shows Join Session screen with error
5. User must join different session
```

### Scenario C: Network Failure
```
User Flow:
1. Enter valid code
2. Click "Join Room"
3. Network request fails
4. ❌ Error from Supabase
5. Show error message
6. User can retry
```

## Navigation Map

```
                    [Home Page]
                         │
                         ▼
              ┌──────────────────┐
              │ Mode Selection   │
              │ /activity-3      │
              └────┬─────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
    [Single Player]    [Multiplayer]
         │                    │
         │                    ▼
         │         ┌──────────────────┐
         │         │  Host or Join    │ ⭐
         │         └────┬─────────────┘
         │              │
         │      ┌───────┴────────┐
         │      │                │
         │      ▼                ▼
         │  [Host Room]    [Join Room]
         │      │                │
         │      │                ▼
         │      │      ┌──────────────┐
         │      │      │ Join Session │ ⭐
         │      │      └────┬─────────┘
         │      │           │
         │      └───────────┘
         │              │
         │              ▼
         │        [Lobby Wait]
         │              │
         └──────────────┘
                   │
                   ▼
            [Game Playing]
                   │
                   ▼
             [Game Ended]
                   │
                   ▼
         [Back to Mode Selection]
```

## Quick Tips

### For Hosts
1. ✅ Create session early
2. ✅ Share code/QR before starting
3. ✅ Wait for all players to join
4. ✅ Start game when everyone ready

### For Players
1. ✅ Get code from host first
2. ✅ Double-check code before submitting
3. ✅ Wait patiently in lobby
4. ✅ Be ready when host starts

### For Developers
1. ✅ Test all navigation paths
2. ✅ Test error scenarios
3. ✅ Test with multiple players
4. ✅ Test QR code joining
5. ✅ Test URL parameter joining

## Component Hierarchy

```
Activity3Page (Main Container)
├─ ModeSelection
│  ├─ Single Player Button
│  └─ Multiplayer Button
│
├─ HostOrJoin ⭐ NEW
│  ├─ Host Room Button
│  ├─ Join Room Button
│  └─ Back Button
│
├─ JoinSession ⭐ NEW
│  ├─ Code Input
│  ├─ Join Button
│  ├─ Error Display
│  └─ Back Button
│
├─ SessionLobby
│  ├─ Session Code Display
│  ├─ QR Code
│  ├─ Player List
│  ├─ Start Button (host)
│  └─ Cancel Button
│
├─ GameCanvas
│  ├─ Webcam
│  ├─ Hand Tracker
│  ├─ Game Loop
│  ├─ Multiplayer Scoreboard
│  └─ Other Players' Cursors
│
└─ GameEnded
   ├─ Receipt
   ├─ Leaderboard
   └─ Play Again Button
```

## Data Flow

```
User Input
    ↓
Component Handler
    ↓
State Update (useState)
    ↓
Re-render
    ↓
Display New Screen

---

For Multiplayer:

User Input (e.g., collect item)
    ↓
GameCanvas Handler
    ↓
Broadcast via Supabase Realtime
    ↓
All Connected Clients
    ↓
Update Local State
    ↓
Re-render Game
```

---

**Complete! All flows documented and tested.** ✅
