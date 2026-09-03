/**
 * signalingServer.ts
 * WebRTC Signaling Server using Socket.io + Express
 * Handles: Room creation, peer discovery, offer/answer relay, ICE candidates
 * 
 * Usage:
 *   npm install express socket.io cors uuid
 *   npx ts-node signalingServer.ts
 *   Server listens on ws://localhost:3001
 */

import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

interface Room {
  id: string;
  code: string; // 6-char QR code
  host: {
    id: string;
    email: string;
    socketId: string;
  } | null;
  guest: {
    id: string;
    email: string;
    socketId: string;
  } | null;
  createdAt: number;
  expiresAt: number; // 5 minutes from creation
  state: "waiting" | "connected" | "disconnected" | "closed";
  iceLogStartTime: number;
}

interface PendingOffer {
  roomId: string;
  from: string;
  offer: RTCSessionDescriptionInit;
}

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://echi-di-gloria.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ====== STATE MANAGEMENT ======
const rooms = new Map<string, Room>();
const pendingOffers = new Map<string, PendingOffer>();
const userSockets = new Map<string, string>(); // userId → socketId

const ROOM_EXPIRY = 5 * 60 * 1000; // 5 minutes
const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
const MAX_ROOMS = 1000;

// ====== UTILITIES ======

/**
 * Generate 6-character room code (alphanumeric, no confusing chars)
 * Excludes: 0/O, 1/I/l, 2/Z, 5/S (easily confused)
 */
function generateRoomCode(): string {
  const chars = "3456789ABCDEFGHJKMNPQRTUVWXY";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function findRoomByCode(code: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.code === code) return room;
  }
  return undefined;
}

function roomToJSON(room: Room) {
  return {
    id: room.id,
    code: room.code,
    hostPresent: !!room.host,
    guestPresent: !!room.guest,
    state: room.state,
    createdAt: room.createdAt,
    expiresIn: Math.max(0, room.expiresAt - Date.now())
  };
}

// ====== CLEANUP ======

/**
 * Cleanup expired rooms every minute
 */
setInterval(() => {
  const now = Date.now();
  const toDelete: string[] = [];

  for (const [roomId, room] of rooms.entries()) {
    if (now > room.expiresAt) {
      toDelete.push(roomId);
    }
  }

  toDelete.forEach((roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      console.log(`[Cleanup] Expired room: ${room.code}`);

      // Notify remaining players
      if (room.host?.socketId) {
        io.to(room.host.socketId).emit("room:expired", {
          message: "Room expired (5 minute timeout)"
        });
      }
      if (room.guest?.socketId) {
        io.to(room.guest.socketId).emit("room:expired", {
          message: "Room expired (5 minute timeout)"
        });
      }

      rooms.delete(roomId);
    }
  });

  console.log(`[Cleanup] Active rooms: ${rooms.size}`);
}, 60000);

// ====== HTTP ENDPOINTS ======

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    activeRooms: rooms.size,
    activeUsers: userSockets.size
  });
});

app.get("/stats", (req, res) => {
  res.json({
    totalRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.post("/rooms", (req, res) => {
  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: "Missing userId or email" });
  }

  if (rooms.size >= MAX_ROOMS) {
    return res.status(503).json({ error: "Server at capacity" });
  }

  const roomId = uuidv4();
  const code = generateRoomCode();

  const room: Room = {
    id: roomId,
    code,
    host: {
      id: userId,
      email,
      socketId: ""
    },
    guest: null,
    createdAt: Date.now(),
    expiresAt: Date.now() + ROOM_EXPIRY,
    state: "waiting",
    iceLogStartTime: Date.now()
  };

  rooms.set(roomId, room);

  console.log(`[Room] Created: ${code} by ${email}`);

  res.json({
    roomId,
    code,
    expiresIn: ROOM_EXPIRY,
    signalingUrl: `wss://${req.get("host")}`
  });
});

app.post("/rooms/:code/join", (req, res) => {
  const { code } = req.params;
  const { userId, email } = req.body;

  const room = findRoomByCode(code);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (room.state !== "waiting") {
    return res.status(409).json({ error: "Room not available" });
  }

  if (room.guest) {
    return res.status(409).json({ error: "Room already has guest" });
  }

  room.guest = {
    id: userId,
    email,
    socketId: ""
  };

  console.log(`[Room] ${code} joined by ${email}`);

  res.json({
    roomId: room.id,
    code: room.code,
    role: "guest",
    hostEmail: room.host?.email
  });
});

// ====== SOCKET.IO EVENTS ======

io.on("connection", (socket) => {
  const clientIp = socket.handshake.address;
  console.log(`[Socket] Connected: ${socket.id} from ${clientIp}`);

  // ====== ROOM MANAGEMENT ======

  socket.on("room:join", (data) => {
    const { roomId, userId, email, role } = data;
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // Update room with socket ID
    if (role === "host" && room.host?.id === userId) {
      room.host.socketId = socket.id;
    } else if (role === "guest" && room.guest?.id === userId) {
      room.guest.socketId = socket.id;
    } else {
      socket.emit("error", { message: "Unauthorized for this room" });
      return;
    }

    userSockets.set(userId, socket.id);
    socket.join(roomId);

    console.log(`[Room ${room.code}] ${role} joined (socket: ${socket.id})`);

    // Notify other player
    const otherRole = role === "host" ? "guest" : "host";
    socket.to(roomId).emit("player:joined", {
      role: otherRole,
      email
    });

    // Send room state to this player
    socket.emit("room:state", {
      room: roomToJSON(room),
      yourRole: role,
      otherPlayer: room[otherRole]
    });
  });

  // ====== WebRTC SIGNALING ======

  socket.on("webrtc:offer", (data) => {
    const { roomId, offer } = data;
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    console.log(`[WebRTC ${room.code}] Offer from ${socket.id}`);

    // Store offer temporarily
    pendingOffers.set(roomId, {
      roomId,
      from: socket.id,
      offer
    });

    // Relay to other player
    socket.to(roomId).emit("webrtc:offer", {
      from: socket.id,
      offer
    });
  });

  socket.on("webrtc:answer", (data) => {
    const { roomId, answer } = data;
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    console.log(`[WebRTC ${room.code}] Answer from ${socket.id}`);

    room.state = "connected";

    // Relay to other player
    socket.to(roomId).emit("webrtc:answer", {
      from: socket.id,
      answer
    });
  });

  socket.on("webrtc:ice", (data) => {
    const { roomId, candidate } = data;
    const room = rooms.get(roomId);

    if (!room) return;

    // Relay ICE candidate to other player
    socket.to(roomId).emit("webrtc:ice", {
      from: socket.id,
      candidate
    });
  });

  // ====== CONNECTION MONITORING ======

  socket.on("ping", (data) => {
    socket.emit("pong", {
      timestamp: Date.now(),
      latency: Date.now() - data.timestamp
    });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);

    // Find and update room
    for (const [roomId, room] of rooms.entries()) {
      if (room.host?.socketId === socket.id) {
        room.host.socketId = "";
        room.state = "disconnected";

        if (room.guest?.socketId) {
          io.to(room.guest.socketId).emit("player:disconnected", {
            message: "Host disconnected"
          });
        }
      } else if (room.guest?.socketId === socket.id) {
        room.guest.socketId = "";
        room.state = "disconnected";

        if (room.host?.socketId) {
          io.to(room.host.socketId).emit("player:disconnected", {
            message: "Guest disconnected"
          });
        }
      }
    }

    // Clean up user socket mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
      }
    }
  });

  // ====== ERROR HANDLING ======

  socket.on("error", (error) => {
    console.error(`[Socket Error] ${socket.id}:`, error);
  });
});

// ====== GRACEFUL SHUTDOWN ======

process.on("SIGTERM", () => {
  console.log("[Shutdown] SIGTERM received");
  httpServer.close(() => {
    console.log("[Shutdown] Server closed");
    process.exit(0);
  });
});

// ====== START SERVER ======

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`🔌 Signaling server listening on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
});

export { app, httpServer, io };
