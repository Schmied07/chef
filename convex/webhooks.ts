/**
 * Webhooks handlers for Chef backend
 */

import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";

/**
 * Webhook: Build complete
 * Called by Chef backend when a build job completes
 */
export const buildComplete = httpAction(async (ctx, request) => {
  try {
    // Verify webhook secret
    const secret = request.headers.get("X-Webhook-Secret");
    if (secret !== process.env.CONVEX_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { jobId, projectId, status, logs, artifacts, metrics, error } = body;

    if (!jobId || !projectId) {
      throw new ConvexError("jobId and projectId are required");
    }

    // Store build result in Convex
    await ctx.runMutation(internal.builds.saveBuildResult, {
      jobId,
      projectId,
      status,
      logs: JSON.stringify(logs || []),
      artifacts: JSON.stringify(artifacts || []),
      metrics: JSON.stringify(metrics || {}),
      error: error || null,
      completedAt: Date.now(),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Build result saved" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Build complete webhook error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof ConvexError ? e.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
