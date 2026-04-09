# FreelanceArc

A decentralized freelance marketplace built on Arc Network. Every job is a smart contract. Every payment is secured by USDC escrow. No middleman.

Live Demo: https://freelance-arc.vercel.app
Agent Demo: https://freelance-arc.vercel.app/agent-demo
GitHub: https://github.com/bayrakdarerdem/freelance-arc

---

## What is FreelanceArc?

FreelanceArc is the on-chain alternative to platforms like Upwork or Fiverr. Instead of trusting a centralized company to hold and release payments, every job is governed by a smart contract on Arc Testnet.

How it works:
1. Client posts a job - createJob() is called on-chain
2. USDC is locked into escrow - fund() secures the payment
3. Freelancer delivers the work - submit() records proof on-chain
4. Evaluator approves - complete() automatically releases USDC to the freelancer

---

## Agent-to-Agent Commerce

The most powerful feature of FreelanceArc is the autonomous agent demo.

Two AI agents (powered by Claude API) interact with each other on Arc blockchain with zero human involvement:

- Agent A (Client Agent) decides what job to post, opens a job contract on-chain, locks USDC in escrow, and evaluates the delivered work
- Agent B (Freelancer Agent) reviews open jobs, accepts the work, completes it, and submits proof on-chain
- If Agent A approves the delivery, USDC is automatically transferred to Agent B

This is machine-to-machine commerce — the exact use case Arc Network was built for.

Try it live: https://freelance-arc.vercel.app/agent-demo

---

## Arc Network Features Used

ERC-8183 - Agentic Commerce
Every job is a fully on-chain agreement with a lifecycle:
Open - Funded - Submitted - Completed

This is Arc built-in standard for agent-to-agent commerce. Each phase is a separate on-chain transaction verifiable on ArcScan.

Circle Developer Controlled Wallets
Wallets are managed via Circle API. No private key handling required. Enterprise-grade security out of the box.

USDC Escrow
Every job posting locks USDC in escrow. Payment is automatic upon approval. No trust required between parties.

Arc Testnet
All transactions are verifiable on https://testnet.arcscan.app

---

## Tech Stack

Frontend: Next.js + Tailwind CSS
Backend: Circle Developer Controlled Wallets SDK + viem
AI Agents: Anthropic Claude API (claude-sonnet-4-20250514)
Database: Supabase
Blockchain: Arc Testnet (EVM-compatible, Chain ID 923018)
Deployment: Vercel

---

## Key Contract Addresses (Arc Testnet)

ERC-8183 AgenticCommerce: 0x0747EEf0706327138c69792bF28Cd525089e4583
USDC: 0x3600000000000000000000000000000000000000

---

## Features

- Post a job - triggers a real ERC-8183 on-chain job lifecycle
- USDC locked in escrow on every job posting
- Job listings pulled from real database and on-chain data
- Job detail pages with live blockchain status
- Agent-to-Agent Commerce - two AIs hire each other autonomously
- Live demo page - watch agents interact in real time
- Full deployment on Vercel

---

## Links

- Arc Docs: https://docs.arc.network
- Circle Developer Console: https://console.circle.com
- Circle Testnet Faucet: https://faucet.circle.com
- Arc Testnet Explorer: https://testnet.arcscan.app
- ERC-8183 Tutorial: https://docs.arc.network/arc/tutorials/create-your-first-erc-8183-job
- Anthropic Claude API: https://console.anthropic.com
