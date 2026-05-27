# Enterprise API Gateway & Reactive Telemetry Dashboard

A production-grade Backend-For-Frontend (BFF) API Gateway built using **Java and Spring Boot**, featuring a custom **Redis-backed Sliding-Window Rate Limiter** and a live **React monitoring dashboard**. 

This system protects downstream microservices from concurrent traffic spikes by tracking, throttling, and graphing inbound volume via real-time time-series telemetry.

---

## 🏗️ System Architecture

The application is consolidated into a high-performance, single-port deployment structure to eliminate Cross-Origin Resource Sharing (CORS) latency overhead and stabilize secure cloud-proxy tunnels.

[Client Browser: React UI]
│
│ (Relative REST Call: /api/v1/resource)
▼
[Spring Boot Gateway (BFF Layer)] ─── (Atomic ZSET Check) ───► [Redis Cache (Sliding Window Engine)]

### Key Technical Specs:
* **Rate Limiting Strategy:** Rolling Time-Series Window (Sliding Window Log).
* **Data Structure:** Redis Sorted Sets (`ZSET`) leveraging millisecond epoch scoring for atomic evaluation.
* **Frontend State Management:** Collision-proof React hook state duplication with batched high-velocity metrics aggregation.

---

## ⚡ Core Features

* **High-Throughput API Gateway:** Intercepts traffic patterns natively using Spring Boot Web configurations.
* **Precision Rate Limiting:** Enforces strict limits (e.g., 10 requests per rolling 10-second window). Excess traffic triggers an immediate **HTTP 429 Too Many Requests** fallback intercept.
* **Live Telemetry Console:** A sleek, dark-mode analytical interface built with **Tailwind CSS** and **Recharts** that visualizes traffic flows in real time.
* **Consolidated Deployment:** Compiled React production static assets served directly inside the Spring Boot JAR resource chain for absolute deployment stability.

---

## 🛠️ Technology Stack

* **Backend:** Java 17+, Spring Boot 3.x, Spring Web, Maven
* **Database/Caching:** Redis (Sorted Sets)
* **Frontend:** React.js, Vite, Recharts, Tailwind CSS, Axios
* **Environment/CI:** GitHub Codespaces / Devcontainers

---

## 🚀 Getting Started

### Prerequisites
Ensure you have Java 17+, Maven, Node.js, and a running Redis server instance on your local machine or container.

### Running the Integrated Production Build
To spin up the entire unified application on a single port (`8080`), run the following script sequence from your terminal:

```bash
# 1. Compile and bundle the React production static files
cd frontend
npm run build
mkdir -p ../backend/src/main/resources/static/
cp -r dist/* ../backend/src/main/resources/static/

# 2. Package and run the unified Spring Boot JAR
cd ../backend
mvn clean package -DskipTests
mvn spring-boot:run

Once started, open your browser and navigate to the live dashboard panel via your local or forwarded port mapping.

🧪 Verification Playbook
Test 1: Safe Fast-Path (HTTP 200 Verification)
Action: Click "Execute Single Safe Payload" on the dashboard.

Result: Low-velocity traffic passes smoothly. The HTTP 200 card increments, and a solid green line plots cleanly on the live time-series graph.

Test 2: Distributed Traffic Spike (HTTP 429 Resilience)
Action: Click "Simulate Core Traffic Spike (Slam Bucket)".

Result: The UI fires a paced concurrent request array. Once the rolling quota limit threshold is broken, the Redis algorithm flags the breach, the console streams bright red HTTP 429 logs, and a red trajectory line surges upward alongside the green baseline—proving the system's defensive guardrails are fully active.

