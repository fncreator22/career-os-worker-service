# 👷 Career OS: The Builder (os-worker-service)

## Overview
This service is the dedicated Background Worker and Durable Execution engine. It processes long-running asynchronous tasks (such as auto-applying to jobs, polling external email systems, and scraping job data).

## Key Capabilities
1. **Durable Workflows:** Uses **Inngest** to manage multi-step automation pipelines.
2. **Integration Hub Sync:** Syncs external integrations (Google Drive, Gmail, LinkedIn scraping).
3. **Failover Execution:** Retries failed steps (like form autofill) automatically using expontential backoff intervals.
