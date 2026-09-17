const BASE_URL = "https://api.mangadex.org";

export class Ping {
  static async ping(): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${BASE_URL}/ping`, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}