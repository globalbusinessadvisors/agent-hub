/**
 * Configuration options for the AgentHub client
 */
export interface AgentHubConfig {
  /** Base URL for the AgentHub API */
  baseUrl?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Maximum number of retries for failed requests */
  maxRetries?: number;
  /** Timeout in milliseconds for requests */
  timeout?: number;
}

/**
 * Agent capabilities and metadata
 */
export interface Agent {
  /** Unique identifier for the agent */
  id: string;
  /** Display name of the agent */
  name: string;
  /** Description of the agent's capabilities */
  description: string;
  /** Version of the agent */
  version: string;
  /** Supported input/output formats */
  capabilities: AgentCapabilities;
  /** Configuration options specific to this agent */
  config: Record<string, unknown>;
}

/**
 * Agent capabilities specification
 */
export interface AgentCapabilities {
  /** Supported input formats */
  inputFormats: string[];
  /** Supported output formats */
  outputFormats: string[];
  /** Whether the agent supports streaming responses */
  streaming: boolean;
  /** Maximum context length in tokens */
  maxContextLength?: number;
}

/**
 * Search criteria for finding agents
 */
export interface AgentSearchParams {
  /** Filter by agent name */
  name?: string;
  /** Filter by capability */
  capability?: string;
  /** Filter by input format */
  inputFormat?: string;
  /** Filter by output format */
  outputFormat?: string;
  /** Maximum number of results */
  limit?: number;
}

/**
 * Session configuration for agent interactions
 */
export interface SessionConfig {
  /** Agent to create session with */
  agent: Agent;
  /** Session-specific configuration */
  config?: Record<string, unknown>;
  /** Whether to enable response streaming */
  streaming?: boolean;
}

/**
 * Active session with an agent
 */
export interface Session {
  /** Unique session identifier */
  id: string;
  /** Associated agent */
  agent: Agent;
  /** Session configuration */
  config: Record<string, unknown>;
  /** Session status */
  status: SessionStatus;
  /** Timestamp when session was created */
  createdAt: Date;
  /** Timestamp of last activity */
  lastActiveAt: Date;
}

/**
 * Possible session statuses
 */
export enum SessionStatus {
  Active = 'active',
  Idle = 'idle',
  Terminated = 'terminated'
}

/**
 * Input parameters for agent calls
 */
export interface CallParams {
  /** Input content for the agent */
  input: string | Record<string, unknown>;
  /** Input format identifier */
  inputFormat?: string;
  /** Desired output format */
  outputFormat?: string;
  /** Call-specific configuration */
  config?: Record<string, unknown>;
}

/**
 * Response from an agent call
 */
export interface CallResponse {
  /** Output content from the agent */
  output: string | Record<string, unknown>;
  /** Output format identifier */
  outputFormat: string;
  /** Additional response metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Error types that may be thrown by the SDK
 */
export enum ErrorType {
  Configuration = 'ConfigurationError',
  Authentication = 'AuthenticationError',
  Network = 'NetworkError',
  RateLimit = 'RateLimitError',
  Validation = 'ValidationError',
  Session = 'SessionError'
}

/**
 * Custom error class for SDK errors
 */
export class AgentHubError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentHubError';
  }
}