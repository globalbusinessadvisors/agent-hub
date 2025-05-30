import { RegistryManager, AgentEntry } from '../../registry/registryManager';
import { DiscoveryAPI } from '../discoveryAPI';
import { SearchParams, RateLimitConfig } from '../types';

jest.mock('../../registry/registryManager');

describe('DiscoveryAPI', () => {
  let discoveryAPI: DiscoveryAPI;
  let mockRegistryManager: jest.Mocked<RegistryManager>;
  
  const mockAgents: AgentEntry[] = [
    {
      id: 'agent1',
      name: 'Test Agent 1',
      version: '1.0.0',
      description: 'A test agent for searching',
      capabilities: ['test', 'search'],
      endpoints: {
        api: 'http://localhost:3000/agent1'
      }
    },
    {
      id: 'agent2',
      name: 'Another Agent',
      version: '2.0.0',
      description: 'Another test agent',
      capabilities: ['test'],
      endpoints: {
        api: 'http://localhost:3000/agent2'
      }
    }
  ];

  beforeEach(() => {
    mockRegistryManager = {
      listAgents: jest.fn().mockResolvedValue(mockAgents),
      initialize: jest.fn().mockResolvedValue(undefined),
      addAgent: jest.fn(),
      removeAgent: jest.fn(),
      updateAgent: jest.fn(),
      getAgent: jest.fn()
    } as unknown as jest.Mocked<RegistryManager>;

    const rateLimitConfig: RateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100
    };

    discoveryAPI = new DiscoveryAPI(mockRegistryManager, rateLimitConfig);
  });

  describe('search', () => {
    it('should return all agents when no search params are provided', async () => {
      const result = await discoveryAPI.search({});
      
      expect(mockRegistryManager.listAgents).toHaveBeenCalled();
      expect(result.items).toEqual(mockAgents);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should filter agents by name search', async () => {
      const params: SearchParams = {
        query: 'Test Agent',
        page: 1,
        limit: 10
      };

      const result = await discoveryAPI.search(params);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Test Agent 1');
      expect(result.total).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      const params: SearchParams = {
        page: 1,
        limit: 1
      };

      const result = await discoveryAPI.search(params);
      
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBe(true);
    });

    it('should filter agents by capabilities', async () => {
      const params: SearchParams = {
        categories: ['search']
      };

      const result = await discoveryAPI.search(params);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].capabilities).toContain('search');
      expect(result.total).toBe(1);
    });

    it('should filter agents by tags', async () => {
      mockRegistryManager.listAgents.mockResolvedValueOnce([
        {
          ...mockAgents[0],
          tags: ['nlp', 'language']
        },
        {
          ...mockAgents[1],
          tags: ['vision']
        }
      ]);

      const params: SearchParams = {
        tags: ['nlp']
      };

      const result = await discoveryAPI.search(params);
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Test Agent 1');
      expect(result.total).toBe(1);
    });

    it('should throw error when rate limit is exceeded', async () => {
      // Simulate rate limit exceeded
      for (let i = 0; i < 100; i++) {
        await discoveryAPI.search({});
      }

      await expect(discoveryAPI.search({}))
        .rejects
        .toThrow('Rate limit exceeded');
    });
  });
});