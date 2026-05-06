# 🧩 NYC Connections - Discord Activity

Bring the daily NYT Connections challenge directly into your Discord voice channels and Group DMs. This is a full-stack Discord Embedded Activity that clones the popular word-association game with added social features like shared progress grids.

![Discord Activity](https://img.shields.io/badge/Discord-Activity-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

## ✨ Features

*   **Daily Sync:** Automatically scrapes the latest NYT Connections puzzle every night.
*   **Discord Native:** Built using the `@discord/embedded-app-sdk` for seamless integration.
*   **Progress Grids:** Generates "Wordle-style" colored grids of your guesses to share in chat.
*   **Persistent Sessions:** Automatically saves your daily progress, lives, and solved categories.
*   **Group DM Support:** Designed to work in both Servers and Group DMs using Interaction Tokens.
*   **Seeded Grids:** Everyone in the same session sees the words in the same shuffled order.

## 🏗️ Architecture

The project operates on a three-tier local development architecture to satisfy Discord's security requirements:

1.  **Proxy (Port 8080):** The entry point that routes `/api/*` to the backend and `/` to the frontend.
2.  **Backend (Port 3001):** Express server handling game logic, sessions, and image generation.
3.  **Frontend (Port 5173):** Vite + React application providing the game UI.
4.  **Tunnel:** Cloudflare Tunnel maps your local port 8080 to a public HTTPS URL.

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+)
*   [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)
*   A Discord Application via the [Developer Portal](https://discord.com/developers/applications)

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/nyc-connections-discord-activity.git
   cd nyc-connections-discord-activity
   ```

2. **Install dependencies (Root, Client, and Server):**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

3. **Configure Environment:**
   Create a `.env` file in the `server/` directory:
   ```env
   VITE_DISCORD_CLIENT_ID=your_app_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_PUBLIC_KEY=your_public_key
   BOT_CHANNEL_WEBHOOK=your_dev_webhook
   ```

### Running Locally

To start the entire stack (Proxy + Server + Client):
```bash
npm run max
```

In a separate terminal, start your tunnel:
```bash
npm run tunnel
```

## ⚙️ Discord Configuration

1.  **URL Mapping:** In the Discord Developer Portal, set your "Externalized URL" to your Cloudflare URL.
2.  **Interactions:** Set the Interactions Endpoint URL to `https://your-tunnel-url.com/api/interactionVerify`.
3.  **OAuth2:** Add `https://your-tunnel-url.com/api/game/token` as a Redirect URI (if needed for specific flows).

## 🛠️ Tech Stack

*   **Frontend:** React, Chakra UI, Framer Motion, Vite.
*   **Backend:** Node.js, Express, Canvas (Image Gen), node-cron (Scraper).
*   **Integration:** Discord Embedded App SDK, Interaction Webhooks.

## 📝 Roadmap

- [ ] Complete `PATCH` logic for non-spammy grid updates.
- [ ] Implement global leaderboards.
- [ ] Add "VS Mode" for real-time head-to-head competition.
- [ ] Migrate session storage from JSON to SQLite/Redis.

---
*Disclaimer: This project is a fan-made clone for educational and social purposes. Connections is a trademark of The New York Times Company.*
