export class BabyBuddyClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    queryParams?: Record<string, string>
  ): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Token ${this.apiKey}`,
      Accept: "application/json",
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return { success: true };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Baby Buddy API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  async list(
    path: string,
    params?: Record<string, string>
  ): Promise<unknown> {
    return this.request("GET", path, undefined, params);
  }

  async get(path: string): Promise<unknown> {
    return this.request("GET", path);
  }

  async create(
    path: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    return this.request("POST", path, data);
  }

  async update(
    path: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    return this.request("PATCH", path, data);
  }

  async remove(path: string): Promise<unknown> {
    return this.request("DELETE", path);
  }
}
