/**
 * Types for Discovery API
 */

import { AgentEntry } from '../registry/registryManager';

export interface SearchParams {
  query?: string;
  categories?: string[];
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'version' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface SchemaFilter {
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// Widget interface types
export interface DiscoveryWidget {
  search: (params: SearchParams) => Promise<PaginationResult<AgentEntry>>;
  filter: (agents: AgentEntry[], filter: SchemaFilter) => Promise<AgentEntry[]>;
  getRateLimitInfo: () => Promise<RateLimitInfo>;
}