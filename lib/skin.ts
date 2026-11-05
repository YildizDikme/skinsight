export type Mode = "hd" | "sd";

export const DST_ACTIONS: Record<Mode, string[]> = {
  hd: [
    "hd_texture",
    "hd_pore",
    "hd_redness",
    "hd_dark_circle",
    "hd_wrinkle",
    "hd_moisture",
    "hd_radiance",
    "hd_oiliness",
  ],
  sd: [
    "texture",
    "pore",
    "redness",
    "dark_circle_v2",
    "wrinkle",
    "moisture",
    "radiance",
    "oiliness",
  ],
};

export const MIN_SHORT_SIDE: Record<Mode, number> = { hd: 1080, sd: 480 };
export const MAX_LONG_SIDE = 2560;

export type OutputItem = {
  type: string;
  region?: string;
  ui_score?: number;
  raw_score?: number;
  score?: number;
  mask_urls?: string[];
  url?: string | null;
};

export type TaskResponse = {
  status: number;
  error?: string;
  error_code?: string;
  data?: {
    task_status?: "running" | "success" | "error";
    error?: string | null;
    error_message?: string;
    results?: { output?: OutputItem[] } | null;
  };
};

export type Region = {
  region: string | null;
  uiScore: number;
  rawScore?: number;
  maskUrl?: string;
};

export type Concern = {
  type: string;
  primary: Region;
  regions: Region[];
};

export type ParsedResult = {
  concerns: Concern[];
  overall?: number;
  skinAge?: number;
};

export function parseOutput(output: OutputItem[]): ParsedResult {
  const byType = new Map<string, Region[]>();
  let overall: number | undefined;
  let skinAge: number | undefined;

  for (const item of output) {
    if (item.type === "all" && typeof item.score === "number") {
      overall = item.score;
    } else if (item.type === "skin_age" && typeof item.score === "number") {
      skinAge = item.score;
    } else if (typeof item.ui_score === "number") {
      const list = byType.get(item.type) ?? [];
      list.push({
        region: item.region ?? null,
        uiScore: item.ui_score,
        rawScore: item.raw_score,
        maskUrl: item.mask_urls?.[0],
      });
      byType.set(item.type, list);
    }
  }

  const concerns: Concern[] = [];
  for (const [type, list] of byType) {
    const primary =
      list.find((r) => r.region === "whole") ??
      list.find((r) => r.region === null) ??
      list[0];
    concerns.push({ type, primary, regions: list.filter((r) => r !== primary) });
  }

  return { concerns, overall, skinAge };
}

export function defaultSelection(concerns: Concern[]) {
  const first = concerns.find((c) => c.type.endsWith("moisture")) ?? concerns[0];
  return first ? { type: first.type, region: first.primary.region } : null;
}

const CONCERN_LABELS: Record<string, string> = {
  texture: "Texture",
  pore: "Pores",
  redness: "Redness",
  dark_circle: "Dark Circles",
  dark_circle_v2: "Dark Circles",
  wrinkle: "Wrinkles",
  moisture: "Hydration",
  radiance: "Radiance",
  oiliness: "Oiliness",
  acne: "Acne",
  age_spot: "Spots",
  eye_bag: "Eye Bags",
  firmness: "Firmness",
  tear_trough: "Tear Trough",
  droopy_upper_eyelid: "Upper Eyelid",
  droopy_lower_eyelid: "Lower Eyelid",
  skin_type: "Skin Type",
};

const REGION_LABELS: Record<string, string> = {
  whole: "Full face",
  forehead: "Forehead",
  nose: "Nose",
  cheek: "Cheeks",
  glabellar: "Between brows",
  crowfeet: "Crow's feet",
  periocular: "Around eyes",
  nasolabial: "Smile lines",
  marionette: "Marionette",
  t_zone: "T-zone",
  u_zone: "U-zone",
};

const humanize = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function concernLabel(type: string) {
  const key = type.replace(/^hd_/, "");
  return CONCERN_LABELS[key] ?? humanize(key);
}

export function regionLabel(region: string | null) {
  if (!region) return "Full face";
  return REGION_LABELS[region] ?? humanize(region);
}

export const ENGINE_ERRORS: Record<string, string> = {
  error_src_face_too_small:
    "Your face needs to fill more of the frame — at least 60% of the photo's width. Try a closer, front-facing shot.",
  error_src_face_out_of_bound:
    "Part of your face is outside the frame. Center your face and try again.",
  error_lighting_dark: "The photo is too dark. Try again in even, bright light.",
  error_below_min_image_size: "The photo resolution is too small.",
  error_exceed_max_image_size: "The photo resolution is too large.",
  error_no_face: "No face was detected in this photo.",
  error_pose: "Please look straight into the camera.",
  error_face_parsing: "The face couldn't be read clearly. Try a sharper photo.",
  CreditInsufficiency: "There aren't enough API units left to run this analysis.",
};
