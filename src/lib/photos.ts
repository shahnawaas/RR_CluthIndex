/**
 * Player photos live in frontend/images/ and are named by verified player ID
 * (e.g. 7897.jpg, 7260.png). Matching is strict: a photo is used only when its
 * file name is exactly the player's verified ID. There is no fallback to any
 * other file, so a missing photo shows the placeholder instead of a wrong face.
 * New, correctly named files are picked up automatically on the next dev reload or build.
 */
const files = import.meta.glob("../../images/*.{jpg,jpeg,png,JPG,JPEG,PNG}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const PRIORITY = ["jpg", "jpeg", "png"];
const byId = new Map<string, string>();

Object.keys(files)
  .sort((a, b) => PRIORITY.indexOf(ext(a)) - PRIORITY.indexOf(ext(b)))
  .forEach((path) => {
    const stem = path.split("/").pop()!.replace(/\.[^.]+$/, "");
    if (/^\d+$/.test(stem) && !byId.has(stem)) byId.set(stem, files[path]);
  });

function ext(p: string) {
  return p.split(".").pop()!.toLowerCase();
}

export function photoFor(playerId: number): string | undefined {
  return byId.get(String(playerId));
}

/** Per-photo focal points for object-position (only where the default crop misses the face). */
const FOCUS: Record<number, string> = {
  7897: "50% 22%", // landscape source image
};

export function photoFocus(playerId: number): string {
  return FOCUS[playerId] ?? "50% 14%";
}
