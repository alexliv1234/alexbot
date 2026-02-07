import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface SessionGuardianConfig {
  maxSessionSizeKb?: number;
  maxMessageTokens?: number;
  checkIntervalMs?: number;
}

const plugin = {
  id: "session-guardian",
  name: "Session Guardian",
  description: "Monitors and manages session size, prevents context overflow",
  
  configSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      maxSessionSizeKb: { type: "number", default: 100 },
      maxMessageTokens: { type: "number", default: 20000 },
      checkIntervalMs: { type: "number", default: 180000 }
    }
  },

  register(api: OpenClawPluginApi) {
    const config = (api.config.plugins?.entries?.["session-guardian"]?.config || {}) as SessionGuardianConfig;
    const maxSizeKb = config.maxSessionSizeKb || 100;
    const checkIntervalMs = config.checkIntervalMs || 180000; // 3 minutes

    console.log(`[session-guardian] Starting with maxSize=${maxSizeKb}KB, interval=${checkIntervalMs}ms`);

    // Background session monitor
    const monitor = async () => {
      try {
        const sessionsDir = path.join(process.env.HOME || "", ".openclaw/agents/main/sessions");
        
        // Find sessions larger than threshold
        const { stdout } = await execAsync(
          `find "${sessionsDir}" -name '*.jsonl' -size +${maxSizeKb}k -exec ls -lh {} \\; 2>/dev/null || true`
        );

        if (!stdout.trim()) {
          return; // No bloated sessions
        }

        const lines = stdout.trim().split("\n");
        console.log(`[session-guardian] Found ${lines.length} bloated sessions (>${maxSizeKb}KB)`);

        for (const line of lines) {
          const parts = line.split(/\s+/);
          const size = parts[4];
          const filePath = parts[8];
          const sessionId = path.basename(filePath, ".jsonl");

          console.log(`[session-guardian] Cleaning session ${sessionId} (${size})`);

          // TODO: Summarize with LLM before deleting
          // For now, just delete
          try {
            await fs.unlink(filePath);
            console.log(`[session-guardian] ✓ Deleted ${sessionId}`);
          } catch (err) {
            console.error(`[session-guardian] Failed to delete ${sessionId}:`, err);
          }
        }
      } catch (err) {
        console.error("[session-guardian] Monitor error:", err);
      }
    };

    // Start monitoring
    const intervalId = setInterval(monitor, checkIntervalMs);

    // Run immediately on startup
    void monitor();

    // Cleanup on shutdown (if api provides it)
    if (api.onShutdown) {
      api.onShutdown(() => {
        clearInterval(intervalId);
        console.log("[session-guardian] Stopped");
      });
    }
  },
};

export default plugin;
