// career-os-worker-service/src/main.ts
// Background Worker Service orchestrating durable workflows via Inngest client

import { Inngest } from "inngest";
import { createServer } from "http";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = 3003;

// Initialize Inngest Client
const inngest = new Inngest({ id: "career-os-worker" });

// Define Auto-Apply Durable Workflow (Job Automation / Integration Hub)
const autoApplyWorkflow = inngest.createFunction(
  { id: "auto-apply-flow" },
  { event: "apply.triggered" },
  async ({ event, step }) => {
    console.log(`[Worker] Started Auto-Apply workflow for Job: ${event.data.jobId}`);

    // Step 1: Fetch and Decrypt Resume
    const resumeText = await step.run("fetch-and-decrypt-resume", async () => {
      console.log("[Worker] Contacting Vault Service for secure Decryption...");
      return "Decrypted plaintext tailored resume content.";
    });

    // Step 2: Tailor Cover Letter
    const coverLetter = await step.run("tailor-cover-letter", async () => {
      console.log("[Worker] Generating optimized cover letter via LLM...");
      return "Tailored Cover Letter: I am highly interested in this role.";
    });

    // Step 3: Dispatch Form autofill to Extension / Scraping Hub
    const submissionReceipt = await step.run("autofill-application", async () => {
      console.log("[Worker] Forwarding credentials to Browser Automation extension...");
      // Simulate calling browser extension endpoint
      return { success: true, submitted_at: new Date().toISOString() };
    });

    // Step 4: Publish sync status to DB
    await step.run("sync-db-status", async () => {
      console.log("[Worker] Updating application tracking table on Supabase...");
      return { status: "applied" };
    });

    return {
      jobId: event.data.jobId,
      receipt: submissionReceipt,
    };
  }
);

// Health check and Inngest API server setup
const server = createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", worker: "active", workflows_loaded: 1 }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`👷 Worker service active on http://localhost:${PORT}`);
});
export { inngest, autoApplyWorkflow };
