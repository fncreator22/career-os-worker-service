# 👷 Career OS: The Builder (os-worker-service)

## Overview
This service is the dedicated Background Worker and Durable Execution engine. It processes long-running asynchronous tasks (such as auto-applying to jobs, polling external email systems, and scraping job data).

## Key Capabilities
1. **Durable Workflows:** Uses **Inngest** to manage multi-step automation pipelines.
2. **Integration Hub Sync:** Syncs external integrations (Google Drive, Gmail, LinkedIn scraping).
3. **Failover Execution:** Retries failed steps (like form autofill) automatically using expontential backoff intervals.

---

## 🛠️ Worker Integration & Telemetry Audit Findings

Following a system audit, the following remediation targets have been identified for this Background Worker service:

### 1. Inngest Integration Expose
* **Unexposed Endpoint:** The Express/HTTP server currently does not mount the Inngest serve handler on any endpoint. As a result, the worker service is unreachable for background workflow execution.
* **Fix:** Export and mount the Inngest serve handler (e.g. at `/api/inngest`) inside `src/main.ts` so Inngest can discover and invoke functions.

### 2. Live Telemetry
* **Metrics Mocking:** The `/metrics` route currently returns hardcoded mock counts. These must be replaced with live queue telemetry mapping active tasks, failed tasks, and queue depth.
