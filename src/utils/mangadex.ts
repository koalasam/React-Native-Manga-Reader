import { Cover } from "../api/cover";
import { ChapterResource, MangaDexRelationship, MangaResource } from "../api/types";

/** Content ratings shown by default; excludes explicit "pornographic" works. */
export const DEFAULT_CONTENT_RATINGS = ["safe", "suggestive", "erotica"];

/** Picks an English value out of a MangaDex localized-string map, falling
 * back to Japanese romanized, then whatever key happens to be first. */
export function localizedText(
  map: Record<string, string> | undefined | null
): string | undefined {
  if (!map) return undefined;
  return map.en ?? map["ja-ro"] ?? map.ja ?? Object.values(map)[0];
}

export function mangaTitle(manga: MangaResource): string {
  return localizedText(manga.attributes.title) ?? "Untitled";
}

export function mangaDescription(manga: MangaResource): string | undefined {
  return localizedText(manga.attributes.description);
}

export function relationshipsOfType(
  relationships: MangaDexRelationship[] | undefined,
  type: string
): MangaDexRelationship[] {
  return (relationships ?? []).filter((r) => r.type === type);
}

export function relationshipNames(
  relationships: MangaDexRelationship[] | undefined,
  type: string
): string[] {
  return relationshipsOfType(relationships, type)
    .map((r) => r.attributes?.name as string | undefined)
    .filter((name): name is string => Boolean(name));
}

export function coverImageUrl(
  manga: MangaResource,
  size?: 256 | 512
): string | undefined {
  const coverRel = relationshipsOfType(manga.relationships, "cover_art")[0];
  const fileName = coverRel?.attributes?.fileName as string | undefined;
  if (!fileName) return undefined;
  return Cover.imageUrl(manga.id, fileName, size);
}

/** "Vol. 2 Ch. 12 — Title", degrading gracefully as fields go missing. */
export function chapterLabel(chapter: ChapterResource): string {
  const { volume, chapter: chapterNumber, title } = chapter.attributes;
  const parts: string[] = [];
  if (volume) parts.push(`Vol. ${volume}`);
  parts.push(chapterNumber ? `Ch. ${chapterNumber}` : "Oneshot");
  const prefix = parts.join(" ");
  return title ? `${prefix} \u2014 ${title}` : prefix;
}

export function chapterGroupNames(chapter: ChapterResource): string[] {
  return relationshipNames(chapter.relationships, "scanlation_group");
}

/** Sorts chapters ascending by chapter number, treating missing/oneshot
 * numbers as coming first. */
export function sortChaptersAscending(chapters: ChapterResource[]): ChapterResource[] {
  return [...chapters].sort((a, b) => {
    const aNum = parseFloat(a.attributes.chapter ?? "-1");
    const bNum = parseFloat(b.attributes.chapter ?? "-1");
    if (Number.isNaN(aNum) && Number.isNaN(bNum)) return 0;
    if (Number.isNaN(aNum)) return -1;
    if (Number.isNaN(bNum)) return 1;
    return aNum - bNum;
  });
}
