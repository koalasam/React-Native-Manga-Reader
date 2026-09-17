const BASE_URL = "https://api.mangadex.org";

export interface ChapterListOptions {
  limit?: number;
  offset?: number;
  ids?: string[];
  title?: string;
  groups?: string[];
  uploader?: string;
  manga?: string;
  volume?: string[];
  chapter?: string[];
  translatedLanguage?: string[];
  originalLanguage?: string[];
  excludedOriginalLanguage?: string[];
  contentRating?: string[];
  excludedGroups?: string[];
  excludedUploaders?: string[];
  includeFutureUpdates?: boolean;
  includeEmptyPages?: boolean;
  includeFuturePublishAt?: boolean;
  includeExternalUrl?: boolean;
  createdAtSince?: string;
  updatedAtSince?: string;
  publishAtSince?: string;
  order?: Record<string, "asc" | "desc">;
  includes?: string[];
}

export interface AtHomeResponse {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export class Chapter {
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

  static async list(options: ChapterListOptions = {}): Promise<any> {
    const {
      limit = 100,
      offset = 0,
      ids,
      title,
      groups,
      uploader,
      manga,
      volume,
      chapter,
      translatedLanguage,
      originalLanguage,
      excludedOriginalLanguage,
      contentRating,
      excludedGroups,
      excludedUploaders,
      includeFutureUpdates,
      includeEmptyPages,
      includeFuturePublishAt,
      includeExternalUrl,
      createdAtSince,
      updatedAtSince,
      publishAtSince,
      order,
      includes,
    } = options;

    const urlParams = new URLSearchParams();
    urlParams.append("limit", String(limit));
    urlParams.append("offset", String(offset));

    if (ids) ids.forEach((id) => urlParams.append("ids[]", id));
    if (title) urlParams.append("title", title);
    if (groups) groups.forEach((group) => urlParams.append("groups[]", group));
    if (uploader) urlParams.append("uploader", uploader);
    if (manga) urlParams.append("manga", manga);
    if (volume) volume.forEach((v) => urlParams.append("volume[]", v));
    if (chapter) chapter.forEach((c) => urlParams.append("chapter[]", c));
    if (translatedLanguage) translatedLanguage.forEach((lang) => urlParams.append("translatedLanguage[]", lang));
    if (originalLanguage) originalLanguage.forEach((lang) => urlParams.append("originalLanguage[]", lang));
    if (excludedOriginalLanguage) excludedOriginalLanguage.forEach((lang) => urlParams.append("excludedOriginalLanguage[]", lang));
    if (contentRating) contentRating.forEach((rating) => urlParams.append("contentRating[]", rating));
    if (excludedGroups) excludedGroups.forEach((group) => urlParams.append("excludedGroups[]", group));
    if (excludedUploaders) excludedUploaders.forEach((uploader) => urlParams.append("excludedUploaders[]", uploader));
    if (includeFutureUpdates !== undefined) urlParams.append("includeFutureUpdates", String(includeFutureUpdates).toLowerCase());
    if (includeEmptyPages !== undefined) urlParams.append("includeEmptyPages", String(includeEmptyPages).toLowerCase());
    if (includeFuturePublishAt !== undefined) urlParams.append("includeFuturePublishAt", String(includeFuturePublishAt).toLowerCase());
    if (includeExternalUrl !== undefined) urlParams.append("includeExternalUrl", String(includeExternalUrl).toLowerCase());
    if (createdAtSince) urlParams.append("createdAtSince", createdAtSince);
    if (updatedAtSince) urlParams.append("updatedAtSince", updatedAtSince);
    if (publishAtSince) urlParams.append("publishAtSince", publishAtSince);
    if (order) {
      for (const [key, value] of Object.entries(order)) {
        urlParams.append(`order[${key}]`, value);
      }
    }
    if (includes) includes.forEach((inc) => urlParams.append("includes[]", inc));

    return this.fetchWithTimeout(`${BASE_URL}/chapter?${urlParams.toString()}`);
  }

  static async get(chapterId: string, includes?: string[]): Promise<any> {
    const urlParams = new URLSearchParams();
    if (includes) includes.forEach((inc) => urlParams.append("includes[]", inc));

    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : "";
    return this.fetchWithTimeout(`${BASE_URL}/chapter/${chapterId}${queryString}`);
  }

  static async atHomeServer(chapterId: string, forcePort443: boolean = false): Promise<AtHomeResponse> {
    const urlParams = new URLSearchParams();
    if (forcePort443) {
      urlParams.append("forcePort443", String(forcePort443).toLowerCase());
    }

    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : "";
    return this.fetchWithTimeout(`${BASE_URL}/at-home/server/${chapterId}${queryString}`);
  }

  static pageUrls(atHomeResponse: AtHomeResponse, dataSaver: boolean = false): string[] {
    const baseUrl = atHomeResponse.baseUrl;
    const chapter = atHomeResponse.chapter;
    const quality = dataSaver ? "data-saver" : "data";
    const filenames = dataSaver ? chapter.dataSaver : chapter.data;

    return filenames.map((filename) => `${baseUrl}/${quality}/${chapter.hash}/${filename}`);
  }
}