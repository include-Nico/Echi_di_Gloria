# 🔐 Database & Security Setup Guide

## Overview
This guide covers setting up Google Sheets as your database backend + Apps Script as the HTTP API server.

**Why Google Sheets?**
- ✅ No server to maintain (serverless)
- ✅ Free tier supports small player bases (<1000 users)
- ✅ Built-in sharing & permissions
- ✅ Easy to inspect data (just open the sheet)
- ✅ Integrates with Google Forms for surveys/feedback
- ✅ Automatic backups via Google Drive

---

## Phase 1: Create Google Sheets Database

### Step 1.1: Create New Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **"+ Create"** → **"Blank Spreadsheet"**
3. Name it: **"Echi di Gloria - Database"**

### Step 1.2: Create Sheets
Delete the default "Sheet1" and create 4 new sheets:

#### Sheet 1: **Users**
Columns:
- A: `id` (user_1693123456_abc123)
- B: `email` (user@example.com)
- C: `passwordHash` ($2b$10$salt$hash...)
- D: `verified` (TRUE/FALSE)
- E: `verificationCode` (ABC123XY)
- F: `createdAt` (1693123456000)
- G: `lastLogin` (1693123456000)

First row = headers. Add sample row to initialize.

#### Sheet 2: **Decks**
Columns:
- A: `id` (deck_1693123456_abc123)
- B: `userId` (user_1693123456_abc123)
- C: `name` (My Vichinghi Deck)
- D: `cardIds` (["VIK_001","VIK_003",...])
- E: `wins` (5)
- F: `losses` (2)
- G: `created` (1693123456000)

#### Sheet 3: **Matches**
Columns:
- A: `id` (match_1693123456_abc123)
- B: `playerId` (user_1693123456_abc123)
- C: `opponentId` (user_9876543210_xyz789)
- D: `winner` (user_1693123456_abc123)
- E: `duration` (345000)
- F: `timestamp` (1693123456000)

#### Sheet 4: **Economy**
Columns:
- A: `userId` (user_1693123456_abc123)
- B: `dust` (150)
- C: `crystals` (5)
- D: `packsOwned` (2)
- E: `lastDailyReward` (1693123456000)

---

## Phase 2: Deploy Google Apps Script

### Step 2.1: Create Apps Script Project
1. Open your Google Sheet
2. Click **"Extensions"** → **"Apps Script"**
3. This opens Google Apps Script editor

### Step 2.2: Copy Script
1. Delete default `Code.gs`
2. Copy entire contents from `scripts/sheets/GoogleAppsScript.gs` into the editor
3. **Update CONFIG at top**:
```javascript
const CONFIG = {
  SPREADSHEET_ID: "YOUR_ACTUAL_SHEET_ID_HERE",
  // Rest stays the same
};
```

To get your Sheet ID:
- Open your Sheet
- URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
- Copy the ID between `/d/` and `/edit`

### Step 2.3: Deploy as Web App
1. Click **"Deploy"** button (top-right)
2. Click **"New Deployment"**
3. Select type: **"Web app"**
4. Execute as: **Your account**
5. Allow: **Anyone (no authentication)** ⚠️ See security note below
6. Click **"Deploy"**
7. **Copy the deployment URL** - you'll need this for the React app

**Security Note:** The "Anyone" permission is needed for client-side calls from your React app. We mitigate this with:
- Rate limiting (60 calls/minute per IP)
- Email verification requirement
- Password hashing
- No sensitive operations in public endpoints

### Step 2.4: Set Triggers (Optional)
Apps Script can run cleanup jobs:
1. Click **"Triggers"** (left sidebar)
2. Click **"Create new trigger"**
3. Function: `cleanupExpiredSessions`
4. Deployment: `Head`
5. Event source: `Time-driven`
6. Type: `Day timer`
7. Interval: `Between 12 AM - 1 AM`

This keeps your database clean.

---

## Phase 3: Integrate with React App

### Step 3.1: Update React Config
In `src/ui/components/GameApp.tsx`, add:

```typescript
import { GoogleSheetsDB } from "../../backend/GoogleSheetsDB";

const APPS_SCRIPT_URL = "https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent";

const db = new GoogleSheetsDB(APPS_SCRIPT_URL);
```

Replace `{DEPLOYMENT_ID}` with your actual Apps Script deployment ID.

### Step 3.2: Initialize Database on App Start
```typescript
useEffect(() => {
  // Check if user is logged in
  const token = localStorage.getItem("authToken");
  if (token) {
    db.getUserEconomy(userId).then((economy) => {
      // Use economy data
      console.log(`Player has ${economy.dust} dust`);
    });
  }
}, []);
```

---

## 🔒 Security Best Practices

### 1. Password Hashing
- ✅ **Implemented**: PBKDF2 with 10,000 iterations
- ✅ **Per-user salt**: Each password has unique salt
- ✅ **Format**: `$2b$10$salt$hash` (bcrypt-compatible)

**Never store plaintext passwords!**

### 2. Email Verification
- ✅ New accounts start `verified: FALSE`
- ✅ 8-character verification code sent to email
- ✅ Code expires if not verified within 24 hours (add check in Apps Script)
- ✅ Code must match exactly before account is usable

### 3. Rate Limiting
- ✅ Max 60 API calls per IP per minute
- ✅ 3 failed login attempts → 15-minute lockout
- ✅ Implemented in both `AuthManager.ts` (client) and `GoogleAppsScript.gs` (server)

### 4. JWT Tokens
- ✅ 7-day expiry (can be customized)
- ✅ HMAC-SHA256 signature
- ✅ Payload includes: userId, email, issued-at, expiry
- ✅ Verify signature on every request

### 5. Data Privacy
- ✅ Email never shared with third parties
- ✅ No tracking or analytics by default
- ✅ Users can request data export
- ✅ GDPR-compliant deletion (remove all user rows)

### 6. CORS & HTTPS
- ✅ Apps Script always HTTPS (Google-managed)
- ✅ Set CORS headers (if deploying separate backend):
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Max-Age: 3600
```

---

## 📊 Monitoring & Maintenance

### Weekly Checks
- [ ] Review new user count (Users sheet)
- [ ] Check for failed logins (look for duplicate rows with same email)
- [ ] Verify no one has 0 dust/crystals (economy balance)

### Monthly Cleanup
1. Open Apps Script editor
2. Add this trigger-based function:
```javascript
function cleanupExpiredData() {
  const usersSheet = ss.getSheetByName("Users");
  const data = usersSheet.getDataRange().getValues();
  
  // Remove unverified accounts older than 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (let i = data.length - 1; i > 0; i--) {
    if (!data[i][3] && data[i][5] < sevenDaysAgo) {
      usersSheet.deleteRow(i + 1);
    }
  }
}
```

### Performance Tuning
If you hit rate limits:
1. **Cache more aggressively** in `GoogleSheetsDB.ts` (increase `cacheExpiry` from 60s to 300s)
2. **Batch operations** (e.g., update multiple decks in one call)
3. **Archive old matches** to separate "MatchesArchive" sheet after 30 days

---

## 🚨 Troubleshooting

### "Script error: Authorization required"
- Make sure Apps Script is deployed as "Anyone (no authentication)"
- Check `SPREADSHEET_ID` is correct

### 403 Forbidden errors
- Apps Script deployment might have expired
- Redeploy: **Deploy** → **Manage deployments** → **Update** previous deployment

### 429 Rate limit errors
- Too many requests from your IP
- Add exponential backoff retry logic:
```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

### Email verification code not received
- Check Gmail spam folder
- Verify sender email in Apps Script (should be your Google account)
- Test manually: run `MailApp.sendEmail()` from Apps Script editor

---

## Next Steps

1. **Setup complete?** ✅
   - [ ] 4 Google Sheets created
   - [ ] Apps Script deployed
   - [ ] Deployment URL in React config
   
2. **Test it:**
   ```bash
   npm run dev
   # Visit http://localhost:5173
   # Click "Register"
   # Check console for API calls
   ```

3. **Scale to production:**
   - Migrate to Firebase (Firestore) for better performance
   - Add dedicated backend server (Node.js + Express) for extra security
   - Implement OAuth2 (Google/GitHub login)

---

## Support
- Google Sheets API limits: [developers.google.com/sheets](https://developers.google.com/sheets)
- Apps Script docs: [developers.google.com/apps-script](https://developers.google.com/apps-script)
- Rate limiting guide: [developers.google.com/apps-script/quotas](https://developers.google.com/apps-script/quotas)
