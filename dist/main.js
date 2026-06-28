"use strict";
// career-os-worker-service/src/main.ts
// Background Worker Service orchestrating durable workflows via Inngest client
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoApplyWorkflow = exports.inngest = void 0;
const inngest_1 = require("inngest");
const http_1 = require("http");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const PORT = 3003;
// Initialize Inngest Client
const inngest = new inngest_1.Inngest({ id: "career-os-worker" });
exports.inngest = inngest;
// Define Auto-Apply Durable Workflow (Job Automation / Integration Hub)
const autoApplyWorkflow = inngest.createFunction({ id: "auto-apply-flow" }, { event: "apply.triggered" }, async ({ event, step }) => {
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
});
exports.autoApplyWorkflow = autoApplyWorkflow;
// Health check and Inngest API server setup
const server = (0, http_1.createServer)((req, res) => {
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
