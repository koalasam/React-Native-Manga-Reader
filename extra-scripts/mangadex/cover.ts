const BASE_URL = "https://api.mangadex.org";
const CDN_URL = "https://uploads.mangadex.org";

export interface CoverListOptions {
  limit?: number;
  offset?: number;
  manga?: string[];
  ids?: string[];
  uploaders?: string[];
  locales?: string[];
  order?: Record<string, "asc" | "desc">;
  includes?: string[];
}

export class Cover {
  private static async fetchWithTimeout(url: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async list(options: CoverListOptions = {}): Promise<any> {
    const {
      limit = 10,
      offset = 0,
      manga,
      ids,
      uploaders,
      locales,
      order,
      includes,
    } = options;

    const urlParams = new URLSearchParams();
    urlParams.append("limit", String(limit));
    urlParams.append("offset", String(offset));

    if (manga) manga.forEach((m) => urlParams.append("manga[]", m));
    if (ids) ids.forEach((id) => urlParams.append("ids[]", id));
    if (uploaders) uploaders.forEach((u) => urlParams.append("uploaders[]", u));
    if (locales) locales.forEach((l) => urlParams.append("locales[]", l));
    if (order) {
      for (const [key, value] of Object.entries(order)) {
        urlParams.append(`order[${key}]`, value);
      }
    }
    if (includes) includes.forEach((inc) => urlParams.append("includes[]", inc));

    return this.fetchWithTimeout(`${BASE_URL}/cover?${urlParams.toString()}`);
  }

  static async get(coverId: string, includes?: string[]): Promise<any> {
    const urlParams = new URLSearchParams();
    if (includes) includes.forEach((inc) => urlParams.append("includes[]", inc));

    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : "";
    return this.fetchWithTimeout(`${BASE_URL}/cover/${coverId}${queryString}`);
  }

  static imageUrl(mangaId: string, filename: string, size?: 256 | 512): string {
    if (size === 256) {
      return `${CDN_URL}/covers/${mangaId}/${filename}.256.jpg`;
    }
    if (size === 512) {
      return `${CDN_URL}/covers/${mangaId}/${filename}.512.jpg`;
    }
    return `${CDN_URL}/covers/${mangaId}/${filename}`;
  }
}