import { youcam } from "@/lib/youcam";

export async function GET(_request: Request, ctx: RouteContext<"/api/analyze/[taskId]">) {
  const { taskId } = await ctx.params;
  const res = await youcam(`/v2.1/task/skin-analysis/${encodeURIComponent(taskId)}`);
  return Response.json(res.json, { status: res.status });
}
