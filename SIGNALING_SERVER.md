# 🌐 Signaling Server Deployment Guide

## Overview

The signaling server enables real-time peer-to-peer (P2P) gameplay via WebRTC. It handles:
- Room creation and management
- WebRTC offer/answer relay
- ICE candidate forwarding
- Connection state monitoring
- Graceful disconnection handling

**Architecture:**
```
Player A ──┐
           ├─► Signaling Server (Socket.io) ──┐
Player B ──┘                                   ├─► WebRTC Data Channel
           ◄─────────────────────────────────┘
           (Low-latency peer-to-peer)
```

---

## Local Development

### Step 1: Install Dependencies
```bash
npm install express socket.io socket.io-client cors uuid
npm install -D ts-node typescript @types/node @types/express
```

### Step 2: Run Signaling Server
```bash
# Terminal 1: Signaling server
npx ts-node src/server/signalingServer.ts
# Output: 🔌 Signaling server listening on 0.0.0.0:3001
```

### Step 3: Run React App
```bash
# Terminal 2: React app
npm run dev
# Access http://localhost:5173
```

### Step 4: Test P2P Connection
```javascript
// Browser console (Player A)
const p2p = new P2PMatchmakerClient(
  "http://localhost:3001",
  "user_123",
  "alice@example.com"
);
const room = await p2p.createRoom();
console.log(`Share this code: ${room.code}`); // e.g., "A3X7K9"

// Browser console (Player B - different browser/incognito)
const p2p = new P2PMatchmakerClient(
  "http://localhost:3001",
  "user_456",
  "bob@example.com"
);
const room = await p2p.joinRoom("A3X7K9");
console.log(`Connected to ${room.otherPlayerEmail}`);
```

### Step 5: Verify Connection
```javascript
// Player A (host)
p2p.onConnectionStateChange((state) => {
  console.log(`Connection state: ${state}`);
});

p2p.onMessage((msg) => {
  console.log(`Received:`, msg);
});

// Send test message
p2p.sendGameState({
  type: "action",
  data: { cardPlayed: "VIK_001" },
  timestamp: Date.now()
});
```

### Health Check
```bash
curl http://localhost:3001/health
# Response: {"status":"ok","timestamp":1693123456000,"activeRooms":1,"activeUsers":2}

curl http://localhost:3001/stats
# Response: {"totalRooms":1,"totalConnections":2,"uptime":123.45,"memory":{...}}
```

---

## Production Deployment

### Option 1: Docker (Recommended)

#### Build Image
```bash
cd deployment
docker build -t echi-signaling:latest .
```

#### Run Locally (Test)
```bash
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  echi-signaling:latest
```

#### Push to Registry
```bash
# Docker Hub
docker tag echi-signaling:latest YOUR_DOCKER_HUB/echi-signaling:latest
docker push YOUR_DOCKER_HUB/echi-signaling:latest

# GitHub Container Registry
docker tag echi-signaling:latest ghcr.io/include-nico/echi-signaling:latest
docker push ghcr.io/include-nico/echi-signaling:latest
```

#### Docker Compose (Full Stack)
```bash
docker-compose up -d
# Starts: signaling-server, mongodb, redis
# Access: http://localhost:3001/health
```

---

### Option 2: Heroku Deployment

#### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Create Heroku App
```bash
heroku create echi-signaling
# Creates: echi-signaling.herokuapp.com
```

#### 3. Configure Environment
```bash
heroku config:set NODE_ENV=production -a echi-signaling
```

#### 4. Create Procfile
```bash
# deployment/Procfile
web: npx ts-node src/server/signalingServer.ts
```

#### 5. Deploy
```bash
git push heroku main
# Watch deployment: heroku logs -f
```

#### 6. Test Deployment
```bash
curl https://echi-signaling.herokuapp.com/health
```

---

### Option 3: Railway.app Deployment

#### 1. Connect GitHub Repository
- Go to [railway.app](https://railway.app)
- Click "New Project" → "Deploy from GitHub"
- Select your `include-Nico/Echi_di_Gloria` repo

#### 2. Create railway.json
```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install && npm run build",
    "startCommand": "node dist/server/signalingServer.js"
  }
}
```

#### 3. Environment Variables
Dashboard → Variables:
- `NODE_ENV`: `production`
- `PORT`: `3001`

#### 4. Deploy
- Railway auto-deploys on git push

---

### Option 4: AWS (EC2 + Load Balancer)

#### 1. Launch EC2 Instance
```bash
# Ubuntu 22.04 LTS, t2.micro
aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --instance-type t2.micro
```

#### 2. SSH into Instance
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### 3. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 4. Clone Repository
```bash
git clone https://github.com/include-Nico/Echi_di_Gloria.git
cd Echi_di_Gloria
npm install
```

#### 5. Run with PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start src/server/signalingServer.ts --name "echi-signaling"
pm2 startup
pm2 save
```

#### 6. Setup Nginx Reverse Proxy
```bash
sudo apt-get install nginx
sudo tee /etc/nginx/sites-available/echi-signaling << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/echi-signaling /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Setup SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 5: Fly.io Deployment

#### 1. Install Fly CLI
```bash
curl https://fly.io/install.sh | sh
```

#### 2. Launch App
```bash
fly launch
# Select: Docker
# Generates: fly.toml
```

#### 3. Deploy
```bash
fly deploy
```

#### 4. Monitor
```bash
fly logs -a echi-signaling
fly ssh console -a echi-signaling
```

---

## Production Configuration

### Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info
MAX_ROOMS=1000
ROOM_EXPIRY=300000  # 5 minutes
CORS_ORIGIN=https://yourgame.com
```

### CORS Settings
```typescript
// In signalingServer.ts
cors: {
  origin: [
    "https://yourgame.com",
    "https://www.yourgame.com"
  ],
  methods: ["GET", "POST"],
  credentials: true
}
```

### Rate Limiting (Optional)
```bash
npm install express-rate-limit
```

### SSL/TLS Configuration
- Heroku: Automatic (*.herokuapp.com)
- Railway: Automatic (*.railway.app)
- AWS/EC2: Use Let's Encrypt (see above)
- Custom domain: CloudFlare or AWS Certificate Manager

---

## Monitoring & Logging

### Health Check (Automated)
```javascript
setInterval(() => {
  fetch('https://yoursignaling.com/health')
    .then(r => r.json())
    .then(data => console.log(`✅ Health: ${data.activeRooms} rooms`))
    .catch(e => console.error(`❌ Health check failed: ${e}`));
}, 60000);
```

### Metrics Dashboard
```bash
# Prometheus-style metrics endpoint
GET /stats
# Response: 
# {
#   "totalRooms": 42,
#   "totalConnections": 84,
#   "uptime": 86400,
#   "memory": { "heapUsed": 45000000, "heapTotal": 52000000 }
# }
```

### Log Aggregation
- **Heroku**: `heroku logs -f`
- **Railway**: Dashboard → Logs
- **Fly.io**: `fly logs -a appname`
- **AWS**: CloudWatch Logs

---

## Troubleshooting

### "Room not found" Errors
- Room expired after 5 minutes
- Solution: Reduce time on QR code scans, or increase `ROOM_EXPIRY`

### WebRTC Connection Fails
- No ICE candidates exchanged
- Solution: Check CORS, verify firewall allows WebRTC (ports 49152-65535)

### High Memory Usage
- Too many rooms (default max 1000)
- Solution: Increase `MAX_ROOMS` or implement room archival

### Slow Signaling
- Network latency to server
- Solution: Deploy in multiple regions with traffic routing (AWS CloudFront, Fly Regions)

---

## Scaling for Production

### Horizontal Scaling
If > 10k concurrent connections needed:
1. Deploy multiple signaling servers
2. Use Redis for cross-server room state sync
3. Add load balancer (HAProxy, AWS ALB, Fly Load Balancer)

Example Redis pub/sub:
```typescript
import redis from "redis";

const pubClient = redis.createClient();
const subClient = redis.createClient();

// Broadcast room state to all servers
pubClient.publish(`room:${roomId}`, JSON.stringify({ state: "connected" }));
```

### Database Persistence
Save match history to MongoDB:
```typescript
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("echi-gloria");

async function recordMatch(roomId, outcome) {
  await db.collection("matches").insertOne({
    roomId,
    outcome,
    timestamp: Date.now()
  });
}
```

---

## Testing Signaling Server

### Unit Tests
```typescript
// signalingServer.test.ts
import { describe, it, expect } from "vitest";

describe("Signaling Server", () => {
  it("should generate unique room codes", () => {
    const code1 = generateRoomCode();
    const code2 = generateRoomCode();
    expect(code1).not.toBe(code2);
  });

  it("should reject invalid room joins", () => {
    // Test room not found
    // Test room expired
    // Test room full
  });
});
```

### Load Testing
```bash
npm install -g artillery

cat > load-test.yml << 'EOF'
config:
  target: "https://your-signaling-server.com"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 rooms/sec
      rampTo: 50
scenarios:
  - name: "Create Room"
    flow:
      - post:
          url: "/rooms"
          json:
            userId: "{{ $randomString(16) }}"
            email: "{{ $randomString(8) }}@test.com"
EOF

artillery run load-test.yml
```

---

## Compliance & Security

### GDPR
- ✅ No persistent user data stored
- ✅ Rooms auto-expire after 5 minutes
- ✅ No cookies or tracking

### Rate Limiting (Add This)
```typescript
app.use(rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,              // 100 requests per minute
  message: "Too many requests"
}));
```

### HTTPS Only
- All production deployments should use HTTPS
- WebRTC over HTTP won't work (browser security)

---

## Next Steps

1. **Deploy signaling server** to production
2. **Update React app** with production signaling URL
3. **Test P2P** with two players on production
4. **Monitor** stats endpoint for active connections
5. **Scale** based on concurrent player count
