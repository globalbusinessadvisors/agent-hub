import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig
} from 'axios';
import EventEmitter from 'eventemitter3';
import {
  Agent,
  AgentHubConfig,
  AgentHubError,
  AgentSearchParams,
  ErrorType,
  Session,
  SessionConfig
} from './types';

const DEFAULT_CONFIG: Required<AgentHubConfig> = {
  baseUrl: 'https://api.agenthub.dev/v1',
  apiKey: '',
  maxRetries: 3,
  timeout: 30000
};

/**
 * Main client for interacting with AgentHub
 */
export class AgentHub extends EventEmitter {
  private readonly config: Required<AgentHubConfig>;
  private readonly http: AxiosInstance;
  private readonly sessions: Map<string, Session>;

  /**
   * Create a new AgentHub client instance
   */
  constructor(config: AgentHubConfig = {}) {
    super();
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      // Ensure all fields are present even if not provided
      baseUrl: config.baseUrl ?? DEFAULT_CONFIG.baseUrl,
      apiKey: config.apiKey ?? DEFAULT_CONFIG.apiKey,
      maxRetries: config.maxRetries ?? DEFAULT_CONFIG.maxRetries,
      timeout: config.timeout ?? DEFAULT_CONFIG.timeout
    };
    this.sessions = new Map();

    // Initialize HTTP client with interceptors for auth and error handling
    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (this.config.apiKey) {
      this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${this.config.apiKey}`;
        }
        return config;
      });
    }

    // Add response interceptor for error handling
    this.http.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          const { status, data } = error.response;
          switch (status) {
            case 401:
              throw new AgentHubError(ErrorType.Authentication, 'Invalid API key');
            case 429:
              throw new AgentHubError(ErrorType.RateLimit, 'Rate limit exceeded');
            default:
              throw new AgentHubError(
                ErrorType.Network,
                typeof data === 'object' && data && 'message' in data
                  ? String(data.message)
                  : 'Request failed',
                { response: data }
              );
          }
        }
        throw new AgentHubError(ErrorType.Network, 'Network error', {
          error: error.message || String(error)
        });
      }
    );
  }

  /**
   * Find agents matching the given criteria
   * @param params - Search parameters to filter agents
   * @returns The first matching agent
   * @throws {AgentHubError} If no agents are found or there is an error searching
   */
  async findAgent(params: AgentSearchParams): Promise<Agent> {
    interface AgentsResponse {
      agents: Agent[];
    }

    try {
      const response = await this.http.get<AgentsResponse>('/agents', { params });
      const { agents } = response.data;

      if (agents.length === 0) {
        throw new AgentHubError(
          ErrorType.Validation,
          'No agents found matching criteria',
          { params }
        );
      }

      return agents[0];
    } catch (error) {
      if (error instanceof AgentHubError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AgentHubError(
          ErrorType.Network,
          'Failed to find agent',
          { error: error.message, params }
        );
      }
      throw new AgentHubError(
        ErrorType.Network,
        'Failed to find agent',
        { error: String(error), params }
      );
    }
  }

  /**
   * Create a new session with an agent
   */
  /**
   * Create a new session with an agent
   */
  async createSession(config: SessionConfig): Promise<Session> {
    try {
      const response = await this.http.post<Session>('/sessions', config);
      const session = response.data;
      this.sessions.set(session.id, session);
      return session;
    } catch (error) {
      if (error instanceof AgentHubError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AgentHubError(
          ErrorType.Session,
          'Failed to create session',
          { error: error.message }
        );
      }
      throw new AgentHubError(
        ErrorType.Session,
        'Failed to create session',
        { error: String(error) }
      );
    }
  }

  /**
   * Get an existing session by ID
   * @param sessionId - The ID of the session to retrieve
   * @returns The session if found, undefined otherwise
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all active sessions
   * @returns An array of all active sessions
   */
  listSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Terminate a session
   */
  /**
   * Terminate an existing session with an agent
   * @param sessionId - The ID of the session to terminate
   * @throws {AgentHubError} If the session termination fails
   */
  async terminateSession(sessionId: string): Promise<void> {
    try {
      await this.http.delete(`/sessions/${sessionId}`);
      this.sessions.delete(sessionId);
    } catch (error) {
      if (error instanceof AgentHubError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new AgentHubError(
          ErrorType.Session,
          'Failed to terminate session',
          { error: error.message, sessionId }
        );
      }
      throw new AgentHubError(
        ErrorType.Session,
        'Failed to terminate session',
        { error: String(error), sessionId }
      );
    }
  }
}