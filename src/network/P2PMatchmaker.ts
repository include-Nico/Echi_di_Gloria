/**
 * P2P Matchmaking System with QR Code Support
 * WebRTC signaling, room creation, device pairing
 */

import crypto from "crypto";

interface RoomConfig {
  roomId: string;
  roomCode: string;
  hostPlayerId: string;
  hostPlayerName: string;
  guestPlayerId?: string;
  guestPlayerName?: string;
  createdAt: string;
  expiresAt: string;
  status: "waiting" | "ready" | "ingame" | "completed" | "expired";
  qrPayload: string;
}

interface PeerConnection {
  peerId: string;
  peerName: string;
  iceServers: RTCIceServer[];
  signalingServer: string;
  connectionState: "connecting" | "connected" | "disconnected" | "failed";
  lastHeartbeat: number;
}

interface GameInvite {
  inviteId: string;
  fromPlayerId: string;
  fromPlayerName: string;
  roomCode: string;
  expiresAt: string;
  accepted: boolean;
}

export class P2PMatchmaker {
  private rooms: Map<string, RoomConfig> = new Map();
  private peerConnections: Map<string, PeerConnection> = new Map();
  private signalingServerUrl: string;
  private roomExpirationMs: number = 5 * 60 * 1000; // 5 minutes

  constructor(signalingServerUrl: string) {
    this.signalingServerUrl = signalingServerUrl;
  }

  /**
   * Host creates a room and generates QR code
   */
  createRoom(hostPlayerId: string, hostPlayerName: string): {
    room: RoomConfig;
    qrCodeData: string;
  } {
    const roomId = crypto.randomUUID();
    const roomCode = this.generateRoomCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.roomExpirationMs);

    const qrPayload = JSON.stringify({
      type: "matchmaking_invite",
      roomCode,
      hostPlayerId,
      timestamp: now.toISOString(),
      signalingServer: this.signalingServerUrl,
    });

    const room: RoomConfig = {
      roomId,
      roomCode,
      hostPlayerId,
      hostPlayerName,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "waiting",
      qrPayload,
    };

    this.rooms.set(roomId, room);

    return {
      room,
      qrCodeData: Buffer.from(qrPayload).toString("base64"),
    };
  }

  /**
   * Guest scans QR code and joins room
   */
  joinRoomByQR(qrData: string, guestPlayerId: string, guestPlayerName: string): {
    success: boolean;
    room?: RoomConfig;
    error?: string;
  } {
    try {
      const payload = JSON.parse(Buffer.from(qrData, "base64").toString());

      if (payload.type !== "matchmaking_invite") {
        return { success: false, error: "Invalid QR payload" };
      }

      const room = Array.from(this.rooms.values()).find(
        (r) => r.roomCode === payload.roomCode
      );

      if (!room) {
        return { success: false, error: "Room not found or expired" };
      }

      if (room.status !== "waiting") {
        return { success: false, error: "Room is no longer available" };
      }

      room.guestPlayerId = guestPlayerId;
      room.guestPlayerName = guestPlayerName;
      room.status = "ready";

      return { success: true, room };
    } catch (e) {
      return { success: false, error: "QR decode failed" };
    }
  }

  /**
   * Establish P2P WebRTC connection
   */
  establishPeerConnection(
    peerId: string,
    peerName: string,
    iceServers: RTCIceServer[] = []
  ): PeerConnection {
    const connection: PeerConnection = {
      peerId,
      peerName,
      iceServers,
      signalingServer: this.signalingServerUrl,
      connectionState: "connecting",
      lastHeartbeat: Date.now(),
    };

    this.peerConnections.set(peerId, connection);

    return connection;
  }

  /**
   * Send signal (offer/answer/ICE candidate) via signaling server
   */
  async sendSignal(
    fromPeerId: string,
    toPeerId: string,
    signalData: RTCSessionDescriptionInit | RTCIceCandidateInit
  ): Promise<void> {
    const payload = {
      from: fromPeerId,
      to: toPeerId,
      signal: signalData,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${this.signalingServerUrl}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Signal failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to send signal:", error);
    }
  }

  /**
   * Heartbeat to keep connection alive
   */
  sendHeartbeat(peerId: string): boolean {
    const connection = this.peerConnections.get(peerId);
    if (!connection) return false;

    connection.lastHeartbeat = Date.now();
    return true;
  }

  /**
   * Close connection and cleanup
   */
  closeConnection(peerId: string): void {
    const connection = this.peerConnections.get(peerId);
    if (connection) {
      connection.connectionState = "disconnected";
      this.peerConnections.delete(peerId);
    }
  }

  /**
   * List active rooms (for debugging/admin)
   */
  getActiveRooms(): RoomConfig[] {
    const now = new Date();
    return Array.from(this.rooms.values()).filter((room) => {
      const expiresAt = new Date(room.expiresAt);
      return expiresAt > now && room.status !== "expired";
    });
  }

  /**
   * Get connection status
   */
  getConnectionStatus(peerId: string): PeerConnection | null {
    return this.peerConnections.get(peerId) || null;
  }

  /**
   * Helper: Generate room code (6 alphanumeric)
   */
  private generateRoomCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Cleanup expired rooms
   */
  cleanupExpiredRooms(): void {
    const now = new Date();
    for (const [roomId, room] of this.rooms.entries()) {
      if (new Date(room.expiresAt) < now) {
        room.status = "expired";
        this.rooms.delete(roomId);
      }
    }
  }
}
