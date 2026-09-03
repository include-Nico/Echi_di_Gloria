/**
 * P2PMatchmakerClient.ts
 * Updated WebRTC P2P client using Signaling Server
 * Flow: 1) Create/join room → 2) WebRTC handshake → 3) Data channel
 */

import { io, Socket } from "socket.io-client";

interface RoomInfo {
  roomId: string;
  code: string;
  role: "host" | "guest";
  otherPlayerEmail?: string;
}

interface GameMessage {
  type: "action" | "state-sync" | "player-ready";
  data: any;
  timestamp: number;
}

class P2PMatchmakerClient {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private signalingUrl: string;
  private roomInfo: RoomInfo | null = null;
  private userId: string;
  private email: string;
  
  private onMessageCallback: ((msg: GameMessage) => void) | null = null;
  private onConnectionChangeCallback: ((state: RTCPeerConnectionState) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  // ICE servers (STUN/TURN for NAT traversal)
  private iceServers = [
    { urls: ["stun:stun.l.google.com:19302"] },
    { urls: ["stun:stun1.l.google.com:19302"] },
    // For production, add TURN server with credentials
    // { urls: ["turn:turnserver.com:3478"], username: "user", credential: "pass" }
  ];

  constructor(signalingUrl: string, userId: string, email: string) {
    this.signalingUrl = signalingUrl;
    this.userId = userId;
    this.email = email;
  }

  /**
   * Create new matchmaking room (as host)
   */
  async createRoom(): Promise<RoomInfo> {
    try {
      const response = await fetch(`${this.signalingUrl}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: this.userId,
          email: this.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      this.roomInfo = {
        roomId: data.roomId,
        code: data.code,
        role: "host"
      };

      await this.connectSocket();
      return this.roomInfo;
    } catch (error) {
      const msg = `Create room failed: ${error}`;
      this.onErrorCallback?.(msg);
      throw error;
    }
  }

  /**
   * Join existing matchmaking room (as guest)
   */
  async joinRoom(code: string): Promise<RoomInfo> {
    try {
      const response = await fetch(
        `${this.signalingUrl}/rooms/${code}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: this.userId,
            email: this.email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join room");
      }

      this.roomInfo = {
        roomId: data.roomId,
        code: data.code,
        role: "guest",
        otherPlayerEmail: data.hostEmail
      };

      await this.connectSocket();
      return this.roomInfo;
    } catch (error) {
      const msg = `Join room failed: ${error}`;
      this.onErrorCallback?.(msg);
      throw error;
    }
  }

  /**
   * Connect to signaling server via Socket.io
   */
  private async connectSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.roomInfo) {
        reject(new Error("Room info not set"));
        return;
      }

      this.socket = io(this.signalingUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on("connect", () => {
        console.log(`[P2P] Socket connected: ${this.socket?.id}`);

        // Join room on signaling server
        this.socket?.emit("room:join", {
          roomId: this.roomInfo?.roomId,
          userId: this.userId,
          email: this.email,
          role: this.roomInfo?.role
        });

        resolve();
      });

      this.socket.on("room:state", (data) => {
        console.log("[P2P] Room state:", data);
        this.roomInfo!.otherPlayerEmail = data.otherPlayer?.email;
      });

      this.socket.on("player:joined", (data) => {
        console.log(`[P2P] ${data.role} joined: ${data.email}`);
        this.initiatePeerConnection();
      });

      this.socket.on("webrtc:offer", (data) => {
        this.handleOffer(data.offer);
      });

      this.socket.on("webrtc:answer", (data) => {
        this.handleAnswer(data.answer);
      });

      this.socket.on("webrtc:ice", (data) => {
        this.handleIceCandidate(data.candidate);
      });

      this.socket.on("player:disconnected", (data) => {
        console.warn("[P2P]", data.message);
        this.onConnectionChangeCallback?.("disconnected");
      });

      this.socket.on("room:expired", (data) => {
        console.warn("[P2P]", data.message);
        this.disconnect();
      });

      this.socket.on("error", (error) => {
        const msg = `Signaling error: ${error}`;
        this.onErrorCallback?.(msg);
        reject(error);
      });

      this.socket.on("disconnect", () => {
        console.log("[P2P] Socket disconnected");
        this.onConnectionChangeCallback?.("disconnected");
      });
    });
  }

  /**
   * Initialize WebRTC peer connection
   */
  private initiatePeerConnection(): void {
    if (this.peerConnection) return;

    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Create data channel (host initiates)
    if (this.roomInfo?.role === "host") {
      this.dataChannel = this.peerConnection.createDataChannel("gamestate", {
        ordered: true
      });
      this.setupDataChannel();
    }

    // Listen for data channel (guest)
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit("webrtc:ice", {
          roomId: this.roomInfo?.roomId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state: ${this.peerConnection?.connectionState}`);
      this.onConnectionChangeCallback?.(this.peerConnection?.connectionState!);
    };

    // Create offer (host)
    if (this.roomInfo?.role === "host") {
      this.peerConnection.createOffer().then((offer) => {
        this.peerConnection?.setLocalDescription(offer);
        this.socket?.emit("webrtc:offer", {
          roomId: this.roomInfo?.roomId,
          offer
        });
      });
    }
  }

  /**
   * Setup data channel for game state sync
   */
  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log("[DataChannel] Opened");
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.onMessageCallback?.(message);
      } catch (error) {
        console.error("[DataChannel] Parse error:", error);
      }
    };

    this.dataChannel.onerror = (error) => {
      const msg = `Data channel error: ${error}`;
      this.onErrorCallback?.(msg);
    };

    this.dataChannel.onclose = () => {
      console.log("[DataChannel] Closed");
    };
  }

  /**
   * Handle WebRTC offer
   */
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      this.initiatePeerConnection();
    }

    await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection?.createAnswer();
    await this.peerConnection?.setLocalDescription(answer);

    this.socket?.emit("webrtc:answer", {
      roomId: this.roomInfo?.roomId,
      answer
    });
  }

  /**
   * Handle WebRTC answer
   */
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection?.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  /**
   * Handle ICE candidate
   */
  private async handleIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn("[P2P] Failed to add ICE candidate:", error);
    }
  }

  /**
   * Send game message to opponent
   */
  sendGameState(message: GameMessage): void {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(JSON.stringify(message));
    } else {
      console.warn("[P2P] Data channel not ready");
    }
  }

  /**
   * Register callback for incoming messages
   */
  onMessage(callback: (msg: GameMessage) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * Register callback for connection state changes
   */
  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionChangeCallback = callback;
  }

  /**
   * Register callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.socket?.disconnect();

    this.dataChannel = null;
    this.peerConnection = null;
    this.socket = null;
    this.roomInfo = null;
  }

  /**
   * Get current room info
   */
  getRoomInfo(): RoomInfo | null {
    return this.roomInfo;
  }

  /**
   * Get connection state
   */
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }
}

export { P2PMatchmakerClient, RoomInfo, GameMessage };
