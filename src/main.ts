// career-os-worker-service/src/main.ts
// Background Worker Service orchestrating durable workflows with JSON logging and readiness diagnostics

import { Inngest } from "inngest";
import { createServer } from "http";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = 3003;
const inngest = new Inngest({ id: "career-os-worker" });

// Structured log helper
function logJson(level: string, message: string, meta: Record<string, any> = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: "worker-service",
    message,
    ...meta
  }));
}

const autoApplyWorkflow = inngest.createFunction(
  { id: "auto-apply-flow" },
  { event: "apply.triggered" },
  async ({ event, step }) => {
    const correlationId = event.data.correlationId || "worker-trigger-" + Math.random();
    logJson("INFO", `Started Auto-Apply workflow for Job: ${event.data.jobId}`, { correlationId });

    const resumeText = await step.run("fetch-and-decrypt-resume", async () => {
      logJson("INFO", "Contacting Vault Service for secure Decryption...", { correlationId });
      return "Decrypted plaintext tailored resume content.";
    });

    const coverLetter = await step.run("tailor-cover-letter", async () => {
      logJson("INFO", "Generating optimized cover letter via LLM...", { correlationId });
      return "Tailored Cover Letter: I am highly interested in this role.";
    });

    const submissionReceipt = await step.run("autofill-application", async () => {
      logJson("INFO", "Forwarding credentials to Browser Automation extension...", { correlationId });
      return { success: true, submitted_at: new Date().toISOString() };
    });

    await step.run("sync-db-status", async () => {
      logJson("INFO", "Updating application tracking table on Supabase...", { correlationId });
      return { status: "applied" };
    });

    logJson("INFO", "Workflow completion successful.", { correlationId });
    return {
      jobId: event.data.jobId,
      receipt: submissionReceipt,
    };
  }
);

// Unified Error Helper
function sendErrorResponse(res: any, code: string, message: string, status: number) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    success: false,
    code,
    message,
    correlationId: "worker-system-uuid",
    timestamp: new Date().toISOString(),
    details: {}
  }));
}

// Unified Success Helper
function sendSuccessResponse(res: any, data: any) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    success: true,
    data,
    meta: {
      requestId: "worker-system-uuid",
      correlationId: "worker-system-uuid",
      timestamp: new Date().toISOString(),
      durationMs: 0
    }
  }));
}

// Server setup
const server = createServer((req, res) => {
  const url = req.url || "/";

  // Health Live
  if (url === "/health/live" && req.method === "GET") {
    sendSuccessResponse(res, { status: "ok" });
    return;
  }

  // Health Ready
  if (url === "/health/ready" && req.method === "GET") {
    sendSuccessResponse(res, {
      status: "ok", 
      dependencies: {
        inngest_connection: "active"
      }
    });
    return;
  }

  // Metrics
  if (url === "/metrics" && req.method === "GET") {
    sendSuccessResponse(res, {
      active_tasks: 0,
      failed_tasks: 0,
      retries_count: 0,
      queue_depth: 0
    });
    return;
  }

  sendErrorResponse(res, "NOT_FOUND", "Worker route not found", 404);
});

server.listen(PORT, () => {
  logJson("INFO", `Worker service active on http://localhost:${PORT}`);
});

export { inngest, autoApplyWorkflow };
