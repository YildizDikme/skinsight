import { youcam } from "@/lib/youcam";
import { DST_ACTIONS, type Mode } from "@/lib/skin";

type FileInitResponse = {
  status: number;
  data?: {
    files: {
      file_id: string;
      requests: { method: string; url: string; headers: Record<string, string> }[];
    }[];
  };
};

type CreateTaskResponse = { status: number; data?: { task_id: string } };

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("image");
  const mode: Mode = form.get("mode") === "sd" ? "sd" : "hd";
  if (!(file instanceof File)) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  const init = await youcam<FileInitResponse>("/v2.0/file", {
    method: "POST",
    body: {
      files: [
        { content_type: file.type, file_name: file.name, file_size: file.size },
      ],
    },
  });
  const slot = init.json?.data?.files?.[0];
  if (!init.ok || !slot) {
    return Response.json({ stage: "file", response: init.json }, { status: 502 });
  }

  const put = slot.requests[0];
  const uploaded = await fetch(put.url, {
    method: put.method,
    headers: { "Content-Type": file.type },
    body: Buffer.from(await file.arrayBuffer()),
  });
  if (!uploaded.ok) {
    return Response.json(
      { stage: "upload", error: `Upload failed (${uploaded.status})` },
      { status: 502 },
    );
  }

  const body = {
    src_file_id: slot.file_id,
    dst_actions: DST_ACTIONS[mode],
    miniserver_args: { enable_mask_overlay: false },
    format: "json",
  };
  const task = await youcam<CreateTaskResponse>("/v2.1/task/skin-analysis", {
    method: "POST",
    body,
  });
  const taskId = task.json?.data?.task_id;
  if (!task.ok || !taskId) {
    return Response.json({ stage: "task", response: task.json }, { status: 502 });
  }

  return Response.json({
    taskId,
    request: { method: "POST", endpoint: "/s2s/v2.1/task/skin-analysis", body },
  });
}
