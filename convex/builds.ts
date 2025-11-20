/**
 * Builds table and operations for Chef backend
 */

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/**
 * Save build result from worker
 */
export const saveBuildResult = internalMutation({
  args: {
    jobId: v.string(),
    projectId: v.string(),
    status: v.string(),
    logs: v.string(),
    artifacts: v.string(),
    metrics: v.string(),
    error: v.union(v.string(), v.null()),
    completedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if build already exists
    const existing = await ctx.db
      .query("builds")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .first();

    if (existing) {
      // Update existing build
      await ctx.db.patch(existing._id, {
        status: args.status,
        logs: args.logs,
        artifacts: args.artifacts,
        metrics: args.metrics,
        error: args.error,
        completedAt: args.completedAt,
      });
      return existing._id;
    } else {
      // Create new build record
      const buildId = await ctx.db.insert("builds", {
        jobId: args.jobId,
        projectId: args.projectId,
        status: args.status,
        logs: args.logs,
        artifacts: args.artifacts,
        metrics: args.metrics,
        error: args.error,
        completedAt: args.completedAt,
      });
      return buildId;
    }
  },
});

/**
 * Get build by job ID
 */
export const getBuildByJobId = query({
  args: { jobId: v.string() },
  handler: async (ctx, args) => {
    const build = await ctx.db
      .query("builds")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .first();
    
    if (!build) {
      return null;
    }

    return {
      ...build,
      logs: JSON.parse(build.logs),
      artifacts: JSON.parse(build.artifacts),
      metrics: JSON.parse(build.metrics),
    };
  },
});

/**
 * Get all builds for a project
 */
export const getBuildsByProjectId = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const builds = await ctx.db
      .query("builds")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    return builds.map((build) => ({
      ...build,
      logs: JSON.parse(build.logs),
      artifacts: JSON.parse(build.artifacts),
      metrics: JSON.parse(build.metrics),
    }));
  },
});
