const BASE_URL = "https://api.mangadex.org";

export interface AuthorListOptions {
  limit?: number;
  offset?: number;
  ids?: string[];
  name?: string;
  order?: Record<string, "asc" | "desc">;
  includes?: string[];
}

export class Author {
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

  static async list(options: AuthorListOptions = {}): Promise<any> {
    const { limit = 10, offset = 0, ids, name, order, includes } = options;

    const urlParams = new URLSearchParams();
    urlParams.append("limit", String(limit));
    urlParams.append("offset", String(offset));

    if (ids) ids.forEach((id) => urlParams.append("ids[]", id));
    if (name) urlParams.append("name", name);
    if (order) {
      for (const [key, value] of Object.entries(order)) {
        urlParams.append(`order[${key}]`, value);
      }
    }
    if (includes) includes.forEach((inc) => urlParams.append("includes[]", inc));

    return this.fetchWithTimeout(`${BASE_URL}/author?${urlParams.toString()}`);
  }

  static async get(authorId: string, includes?: string[]): Promise<any> {
    const urlParams = new URLSearchParams();
    if (includes) includes.forEach((inc) => urlParams.append("includes[]", inc));

    const queryString = urlParams.toString() ? `?${urlParams.toString()}` : "";
    return this.fetchWithTimeout(`${BASE_URL}/author/${authorId}${queryString}`);
  }
}