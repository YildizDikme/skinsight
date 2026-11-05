import { MAX_LONG_SIDE, MIN_SHORT_SIDE, type Mode } from "./skin";

export type PreparedImage = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  mode: Mode;
};

const MAX_UPLOAD_BYTES = 4_000_000;

export async function prepareImage(source: File): Promise<PreparedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This photo format isn't supported here. Please use a JPG or PNG.");
  }

  const scale = Math.min(1, MAX_LONG_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const shortSide = Math.min(width, height);
  if (shortSide < MIN_SHORT_SIDE.sd) {
    bitmap.close();
    throw new Error(
      `This photo is too small (${width}×${height}). Use one that's at least ${MIN_SHORT_SIDE.sd}px on its short side.`,
    );
  }
  const mode: Mode = shortSide >= MIN_SHORT_SIDE.hd ? "hd" : "sd";

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob: Blob | null = null;
  for (const quality of [0.92, 0.85, 0.75, 0.65]) {
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= MAX_UPLOAD_BYTES) break;
  }
  if (!blob) throw new Error("Couldn't read this photo.");

  const name = (source.name.replace(/\.[^.]+$/, "") || "selfie") + ".jpg";
  const file = new File([blob], name, { type: "image/jpeg" });
  return { file, previewUrl: URL.createObjectURL(file), width, height, mode };
}

export function preload(urls: (string | undefined)[], timeoutMs = 4000) {
  const loads = urls.filter(Boolean).map(
    (src) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => resolve();
        img.src = src!;
      }),
  );
  return Promise.race([
    Promise.all(loads),
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ]);
}
