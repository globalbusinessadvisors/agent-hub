export type Mode = 'ask' | 'code' | 'architect' | 'debug';

export interface TaskResponse {
  message: string;
  [key: string]: unknown;
}

export interface ModeResponse {
  mode: string;
  success: boolean;
  [key: string]: unknown;
}

export class ApiService {
  readonly baseUrl: string;
  private readonly maxRetries = 3;

  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = this.maxRetries
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`API Error: ${errorMessage}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  async submitTask(task: string, mode: Mode): Promise<TaskResponse> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/task`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task, mode }),
      }
    );
    return response.json();
  }

  async switchMode(mode: Mode): Promise<ModeResponse> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/mode`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      }
    );
    return response.json();
  }
}