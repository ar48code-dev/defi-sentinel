# 🛡️ DeFi-Sentinel
### *Real-time DeFi Forensic Monitoring & Automated Protection*

**DeFi-Sentinel** is a production-grade monitoring and protection suite designed for the modern DeFi ecosystem. It combines real-time forensic analysis with automated emergency response to protect user collateral and protocol health.

Built for the **Chainlink Constellation Hackathon**, DeFi-Sentinel leverages Chainlink's industry-standard infrastructure to bridge the gap between off-chain threat detection and on-chain security.

---

## 🌟 Key Features

- **📊 Real-time Forensic Dashboard**: Monitor protocol health, TVL anomalies, and market volatility through a high-fidelity interface.
- **⚡ Automated Protection**: Integrates with **Aave V3** to automatically protect user positions from liquidation using automated collateral top-ups.
- **🧠 Threat Intelligence Feed**: Real-time monitoring of protocol-level threats (e.g., flash loans, whale movements) powered by custom Forensic Loggers.
- **📧 Email Notifications**: Instant alerts via **Email (SendGrid)** when positions are at risk or protection is executed.
- **🔗 Chainlink Integration**:
    - **Chainlink Data Feeds**: For accurate, decentralized price data.
    - **Chainlink CRE (Custom Runtime Environment)**: For complex, off-chain threat detection and workflow orchestration.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion (for premium UI/UX).
- **Backend**: Node.js, Express, TypeScript, Ethers.js.
- **Smart Contracts**: Solidity, Hardhat.
- **Protocols**: Aave V3 (Lending/Borrowing).
- **Infrastucture**: Alchemy (RPC), Chainlink, SendGrid.

---

## 📦 Project Structure

```bash
├── backend/            # Express.js server & forensic logic
├── contracts/          # Solidity smart contracts (SentinelCore, ForensicsLogger)
├── frontend/           # Next.js dashboard application
├── cre-workflows/      # Chainlink CRE configuration & workflows
└── .env                # Environment configuration
```

---

## 🚀 Quick Start (For Judges & Testers)

You can now set up and launch the entire project (Frontend + Backend) with **ONE command**.

### 1a. Clone & Launch (Recommended)
```bash
git clone https://github.com/ar48code-dev/defi-sentinel.git
cd defi-sentinel
chmod +x *.sh
./start.sh
```
*`start.sh` automatically installs dependencies, starts both the backend and frontend, and opens the dashboard in your browser.*

> **✅ Zero configuration needed.** Real Sepolia RPC credentials and deployed contract addresses are built directly into the app. You will see **live Chainlink price feeds and real Aave data** immediately upon startup — no `.env` editing required.

---

### 1b. Optional: Custom Configuration

**Option A: Quick Web Config**
Once the dashboard opens, click the **Settings (⚙️)** icon in the top right. You can paste your own API keys directly into the UI. These are applied immediately without editing any files.

**Option B: Edit the `.env` file**
You can also create/edit a `.env` file in the project root to override any built-in credentials:
```env
SEPOLIA_RPC_URL=your_alchemy_url
PRIVATE_KEY=your_wallet_private_key
ALERT_EMAIL=your_email@example.com
SENDGRID_API_KEY=your_sendgrid_key
```

### 1c. Manual Installation
If you prefer to install components individually:

**Backend:**
```bash
cd backend && npm install && npm run dev
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

---

## ⚡ Zero-Config Demo (For Hackathon Judges)

We understand that judges often have limited time. To ensure you can experience the **full power** of DeFi-Sentinel immediately:

- **✅ Real Credentials Built-In**: The app ships with a working Alchemy Sepolia RPC URL, all deployed contract addresses, and SendGrid API key embedded as defaults. **Clone and run — that's it.**
- **✅ Real Blockchain Data**: Unlike other projects that show static mock data, DeFi-Sentinel displays **real live prices** from Chainlink and **real protocol status** from Aave V3 immediately upon startup.
- **✅ Scenario 1: Sarah's Story**: Connect your MetaMask to see a simulated $10k position. Use the **Health Factor Slider** to set protection thresholds and test the **"Deposit Risk-Free"** button to trigger a real MetaMask USDC deposit to our `SentinelVault`.
- **✅ Scenario 2: Protocol Security**: Click **"Simulate Whale Anomaly"** to see how our AI scores a $50M threat level (4/5) and recommends immediate emergency actions.

---

## 🛡️ Smart Contracts (Sepolia)

- **SentinelCore**: `0xa9D6084EE79142526121899B59D0b774A7F583d1`
- **ForensicsLogger**: `0x83D71737B6499B6f9C0e68F47f9B7a08d2D3AC91`
- **AutoProtector**: `0x3b29D86d5f9F755a17BfA04eD62ab01316C1F0cb`

---

## 🏆 Presentation & Live Demo

When testing the application:
1. **Launch**: Run `./start.sh` or `npm run dev`.
2. **Dashboard**: Navigate to `http://localhost:3000`. You will see **Live Price Feeds** instantly.
3. **User Protection (Sarah's Story)**: 
   - Connect your MetaMask.
   - You will see a dedicated **User Position** panel illustrating how we protect a $10,000 USDC collateral position.
   - Adjust the **Protection Threshold** slider to see the status update in real-time.
   - Click **"Deposit Risk-Free"** to trigger a real MetaMask transaction for USDC protection reserves.
4. **Protocol Security (Whale Detection)**:
   - Click **"Simulate Whale Anomaly"**.
   - Watch the AI detect a $50M threat in real-time, score it (4/5), and recommend emergency actions like **"Pause Borrows"**.
5. **Real Email Alerts**: 
   - Open the **System Config (⚙️)** and enter your email under **Alert Email**.
   - The app will send you real-world security alerts when critical events occur.

---

## 👥 Team
- **Anirban** - Lead Developer & Architect
- **GitHub**: [ar48code-dev](https://github.com/ar48code-dev)

---
*Developed for Chainlink Constellation Hackathon 2026*
