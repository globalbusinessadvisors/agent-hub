import { RegistryManager, AgentEntry } from '../registry/registryManager';
import { SearchParams, PaginationResult, RateLimitConfig, RateLimitInfo } from './types';

/**
 * Discovery API for searching and filtering agents from the registry
 */
export class DiscoveryAPI {
  private requestCount: number = 0;
  private lastReset: number = Date.now();

  constructor(
    private registryManager: RegistryManager,
    private rateLimitConfig: RateLimitConfig
  ) {}

  /**
   * Search agents with pagination and filtering
   */
  async search(params: SearchParams): Promise<PaginationResult<AgentEntry>> {
    // Check rate limit
    if (this.isRateLimitExceeded()) {
      throw new Error('Rate limit exceeded');
    }
    this.requestCount++;

    const agents = await this.registryManager.listAgents();
    
    // Apply filters
    let filteredAgents = agents;
    
    // Filter by name if query provided
    if (params.query) {
      filteredAgents = filteredAgents.filter(agent =>
        agent.name.toLowerCase().includes(params.query!.toLowerCase())
      );
    }

    // Filter by capabilities
    if (params.categories && params.categories.length > 0) {
      filteredAgents = filteredAgents.filter(agent =>
        params.categories!.some(category => agent.capabilities.includes(category))
      );
    }

    // Filter by tags
    if (params.tags && params.tags.length > 0) {
      filteredAgents = filteredAgents.filter(agent =>
        agent.tags && params.tags!.some(tag => agent.tags!.includes(tag))
      );
    }

    // Handle pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedAgents = filteredAgents.slice(start, end);

    return {
      items: paginatedAgents,
      total: filteredAgents.length,
      page,
      limit,
      hasMore: end < filteredAgents.length
    };
  }

  private isRateLimitExceeded(): boolean {
    const now = Date.now();
    if (now - this.lastReset >= this.rateLimitConfig.windowMs) {
      this.requestCount = 0;
      this.lastReset = now;
      return false;
    }
    return this.requestCount >= this.rateLimitConfig.maxRequests;
  }
}