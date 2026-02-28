# 🛡️ DeFi-Sentinel
### *Real-time DeFi Forensic Monitoring & Automated Protection*

**DeFi-Sentinel** is a production-grade monitoring and protection suite designed for the modern DeFi ecosystem. It combines real-time forensic analysis with automated emergency response to protect user collateral and protocol health.

Built for the **Chainlink Constellation Hackathon**, DeFi-Sentinel leverages Chainlink's industry-standard infrastructure to bridge the gap between off-chain threat detection and on-chain security.

---

## 🌟 Key Features

- **📊 Real-time Forensic Dashboard**: Monitor protocol health, TVL anomalies, and market volatility through a high-fidelity interface.
- **⚡ Automated Protection**: Integrates with **Aave V3** to automatically protect user positions from liquidation using automated collateral top-ups.
- **🧠 Threat Intelligence Feed**: Real-time monitoring of protocol-level threats (e.g., flash loans, whale movements) powered by custom Forensic Loggers.
- **🔔 Multi-channel Notifications**: Instant alerts via **Telegram** and **Email (SendGrid)** when positions are at risk or protection is executed.
- **🔗 Chainlink Integration**:
    - **Chainlink Data Feeds**: For accurate, decentralized price data.
    - **Chainlink CRE (Custom Runtime Environment)**: For complex, off-chain threat detection and workflow orchestration.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion (for premium UI/UX).
- **Backend**: Node.js, Express, TypeScript, Ethers.js.
- **Smart Contracts**: Solidity, Hardhat.
- **Protocols**: Aave V3 (Lending/Borrowing).
- **Infrastucture**: Alchemy (RPC), Chainlink, SendGrid, Telegram Bot API.

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
*`start.sh` is intelligent: it will automatically install dependencies, check your `.env`, start both servers, and **open the dashboard in your browser**.*

---

### 1b. Configuration (2 Ways)

**Option A: Quick Web Config (Recommended for Demo)**
Once the dashboard opens, click the **Settings (⚙️)** icon in the top right. You can paste your keys directly into the UI. These will be applied to the current session immediately WITHOUT editing files.

**Option B: Manual .env**  
Open the `.env` file and add your keys:
```env
SEPOLIA_RPC_URL=your_alchemy_url
PRIVATE_KEY=your_wallet_private_key
TELEGRAM_BOT_TOKEN=your_bot_token
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

## 🛡️ Smart Contracts (Sepolia)

- **SentinelCore**: The central hub for protocol registration and threat level management.
- **ForensicsLogger**: An immutable on-chain log for forensic data and incident history.
- **AutoProtector**: Executes automated protection logic for Aave V3 positions.

---

## 🏆 Hackathon Judges / Testers

To test the application:
1. Load the dashboard at `http://localhost:3000`.
2. Connect your MetaMask wallet (Sepolia Network).
3. View the **Live Threat Feed** for real-time monitoring.
4. Check the **System Status** to verify Chainlink integration.

*Note: For full automated protection testing, ensure your wallet has a position on Aave V3 Sepolia and sufficient collateral in the SentinelVault.*

---

## 👥 Team
- **Anirban** - Lead Developer & Architect
- **GitHub**: [ar48code-dev](https://github.com/ar48code-dev)

---
*Developed for Chainlink Constellation Hackathon 2026*
