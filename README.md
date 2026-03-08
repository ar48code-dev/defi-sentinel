# 🛡️ DeFi Sentinel
### *Automated DeFi Protection — Detect, Decide, Defend*

> **Chainlink Convergence 2026 Hackathon Submission**

DeFi Sentinel is a **production-ready automated protection system** for DeFi users. It monitors your Aave V3 position 24/7 using Chainlink CRE workflows, and when your health factor drops into danger — it automatically tops up your collateral before you get liquidated. No manual action. No watching charts. Your funds are defended while you sleep.

---

## 🎯 The Problem

**$3.8 billion** was lost to DeFi liquidations and exploits in 2024 alone. Most users:
- Don't monitor their positions 24/7
- React too slowly when health factors drop
- Have no automated safety net

Existing tools only **alert** you. DeFi Sentinel **acts**.

---

## ⚡ What Makes This Different

| Feature | Alert-only tools | DeFi Sentinel |
|---|---|---|
| Real-time monitoring | ✅ | ✅ |
| Sends alerts | ✅ | ✅ |
| **Auto-executes protection** | ❌ | ✅ |
| **Chainlink CRE orchestration** | ❌ | ✅ |
| **On-chain vault + collateral top-up** | ❌ | ✅ |

**The full protection loop:**
```
Chainlink CRE Workflow (every 5 min)
    → Reads Aave V3 health factor on Sepolia
    → Health factor < 1.5? TRIGGER
    → Calls AutoProtector.executeProtection()
    → Pulls USDC from SentinelVault
    → Supplies collateral to Aave on behalf of user
    → User's position saved. On-chain. Automatically.
```

---

## 🔗 Chainlink Integration

### Chainlink CRE (Core integration)
- `cre-workflows/user/monitorHealth.ts` — reads Aave health factor every 5 minutes, triggers on-chain protection when threshold breached
- `cre-workflows/protocol/monitorProtocol.ts` — reads ETH/USD Chainlink price feed, monitors protocol-level anomalies

### Chainlink Data Feeds
- ETH/USD feed: `0x694AA1769357215DE4FAC081bf1f309aDC325306` (Sepolia)
- Real-time price data used for anomaly scoring and TVL monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Chainlink CRE Layer                 │
│  monitorHealth.ts  ←→  monitorProtocol.ts        │
│  (every 5 min)         (every 10 min)            │
└──────────────┬──────────────────────────────────┘
               │ calls executeProtection()
               ▼
┌─────────────────────────────────────────────────┐
│           Smart Contracts (Sepolia)              │
│                                                  │
│  SentinelCore ← authorizes CRE nodes            │
│  AutoProtector ← executes collateral top-up     │
│  SentinelVault ← holds protection reserves      │
│  ForensicsLogger ← logs all events on-chain     │
└──────────────┬──────────────────────────────────┘
               │ supplies USDC
               ▼
┌─────────────────────────────────────────────────┐
│              Aave V3 (Sepolia)                   │
│  User's health factor restored automatically    │
└─────────────────────────────────────────────────┘
```

---

## 📦 Smart Contracts (Sepolia Testnet)

| Contract | Address | Purpose |
|---|---|---|
| SentinelCore | `0xa9D6084EE79142526121899B59D0b774A7F583d1` | Registry + CRE node authorization |
| ForensicsLogger | `0x83D71737B6499B6f9C0e68F47f9B7a08d2D3AC91` | On-chain event logging |
| AutoProtector | `0x3b29D86d5f9F755a17BfA04eD62ab01316C1F0cb` | Executes collateral top-ups |
| SentinelVault | `0x2f3B8aC8B0d513acB2bb90775238616d018335D0` | Protection reserve vault |

---

## 🚀 Quick Start — One Command

```bash
git clone https://github.com/ar48code-dev/defi-sentinel.git
cd defi-sentinel
chmod +x *.sh
./start.sh
```

Open `http://localhost:3000`

**Zero config needed.** Real Sepolia credentials and contract addresses are built in. Judges can run immediately.

---

## 🔑 Optional: Custom Configuration

Create a `.env` file in the project root:

```env
SEPOLIA_RPC_URL=your_alchemy_sepolia_url
PRIVATE_KEY=your_wallet_private_key
SENDGRID_API_KEY=your_sendgrid_key
ALERT_EMAIL=your_email@example.com
```

---

## 🎬 Demo Walkthrough

**1. Real Price Feeds**
Dashboard shows live ETH, BTC, LINK, AAVE prices from CoinGecko — updates every 2 minutes.

**2. Live Threat Feed**
Protocol-level anomalies detected and displayed in real time.

**3. Connect Wallet**
Connect MetaMask to see your Aave V3 position health factor live.

**4. Protection Setup**
Click "Start Registration" → configure your vault address, min/max protection amounts → call `setConfig()` on AutoProtector.

**5. Trigger Protection (Demo)**
Use the backend endpoint directly to demonstrate the full loop:
```bash
curl -X POST http://localhost:3001/api/protect/trigger \
  -H "Content-Type: application/json" \
  -d '{"userAddress": "0xYourAddress", "amount": "100"}'
```

**6. Verify On-Chain**
Check the transaction on Sepolia Etherscan — real collateral top-up, real Aave interaction.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Automation | Chainlink CRE TypeScript Workflows |
| Price Feeds | Chainlink Data Feeds + CoinGecko API |
| Backend | Node.js, Express, TypeScript, Ethers.js |
| Frontend | Next.js 14, React, Tailwind CSS |
| Alerts | SendGrid Email |
| Testnet | Ethereum Sepolia |

---

## 📁 Project Structure

```
defi-sentinel/
├── contracts/              # Solidity smart contracts
│   └── src/
│       ├── shared/         # SentinelCore, ForensicsLogger
│       └── user/           # AutoProtector, SentinelVault
├── cre-workflows/          # Chainlink CRE workflows
│   ├── protocol/           # Protocol monitoring
│   └── user/               # User health factor monitoring
├── backend/                # Express API server
│   └── src/
│       ├── config/         # RPC, contracts, secrets
│       ├── routes/         # API endpoints
│       └── services/       # Price, protocol, user logic
├── frontend/               # Next.js dashboard
├── start.sh                # One-command launcher
└── setup.sh                # Dependency installer
```

---

## 👤 Team

**Anirban** — Lead Developer & Architect
GitHub: [ar48code-dev](https://github.com/ar48code-dev)

---

*Built for Chainlink Convergence 2026*
