import { promises as fs } from 'fs';
import * as path from 'path';
import Ajv, { ErrorObject } from 'ajv';
import { RegistryManager } from '../registryManager';

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

jest.mock('path', () => ({
  resolve: jest.fn()
}));

// Mock Ajv constructor and instance methods
const mockValidate = jest.fn();
const mockCompile = jest.fn(() => mockValidate);
jest.mock('ajv', () => {
  return jest.fn().mockImplementation(() => {
    return { compile: mockCompile };
  });
});

describe('RegistryManager', () => {
  let registryManager: RegistryManager;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup path.resolve mock
    (path.resolve as jest.Mock).mockImplementation((_, p) => p);
    
    registryManager = new RegistryManager();
  });

  describe('initialize()', () => {
    const mockSchema = { type: 'object' };
    const mockCatalog = { agents: [] };

    it('should successfully initialize with valid schema and catalog', async () => {
      // Arrange
      (fs.readFile as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockSchema))
        .mockResolvedValueOnce(JSON.stringify(mockCatalog));
      mockValidate.mockReturnValue(true);

      // Act
      await registryManager.initialize();

      // Assert
      expect(fs.readFile).toHaveBeenCalledWith('../../registry/schema.json', 'utf-8');
      expect(fs.readFile).toHaveBeenCalledWith('../../registry/agents.json', 'utf-8');
      expect(mockCompile).toHaveBeenCalledWith(mockSchema);
      expect(mockValidate).toHaveBeenCalledWith(mockCatalog);
    });

    it('should throw error when schema file read fails', async () => {
      // Arrange
      const error = new Error('Schema file not found');
      (fs.readFile as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(registryManager.initialize())
        .rejects
        .toThrow('Failed to initialize registry: Schema file not found');
      
      expect(fs.readFile).toHaveBeenCalledWith('../../registry/schema.json', 'utf-8');
      expect(mockCompile).not.toHaveBeenCalled();
    });

    it('should throw error when catalog validation fails', async () => {
      // Arrange
      (fs.readFile as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockSchema))
        .mockResolvedValueOnce(JSON.stringify(mockCatalog));
      
      mockValidate.mockReturnValue(false);
      Object.assign(mockValidate, { errors: [{ message: 'Invalid format' }] });

      // Act & Assert
      await expect(registryManager.initialize())
        .rejects
        .toThrow('Failed to initialize registry: Invalid catalog format: Invalid format');
      
      expect(mockValidate).toHaveBeenCalledWith(mockCatalog);
    });

    it('should create new catalog when file does not exist', async () => {
      // Arrange
      (fs.readFile as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockSchema))
        .mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));
      mockValidate.mockReturnValue(true);

      // Act
      await registryManager.initialize();

      // Assert
      expect(fs.writeFile).toHaveBeenCalledWith(
        '../../registry/agents.json',
        JSON.stringify({ agents: [] }, null, 2)
      );
      expect(mockValidate).toHaveBeenCalledWith({ agents: [] });
    });

    it('should handle non-Error objects in initialization', async () => {
      // Arrange
      (fs.readFile as jest.Mock).mockRejectedValueOnce('Unknown error');

      // Act & Assert
      await expect(registryManager.initialize())
        .rejects
        .toThrow('Failed to initialize registry: Unknown error');
    });
  });

  describe('addAgent()', () => {
    const mockAgent = {
      id: 'test-agent',
      name: 'Test Agent',
      version: '1.0.0',
      description: 'A test agent',
      capabilities: ['test'],
      endpoints: {
        api: 'http://localhost:3000'
      }
    };

    const mockCatalog = { agents: [] };

    beforeEach(() => {
      // Setup default read mock to return empty catalog
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockCatalog));
    });

    it('should successfully add a new agent', async () => {
      // Arrange
      const expectedCatalog = { agents: [mockAgent] };

      // Act
      await registryManager.addAgent(mockAgent);

      // Assert
      expect(fs.writeFile).toHaveBeenCalledWith(
        '../../registry/agents.json',
        JSON.stringify(expectedCatalog, null, 2)
      );
    });

    it('should throw error when agent with same ID exists', async () => {
      // Arrange
      const existingCatalog = { agents: [mockAgent] };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingCatalog));

      // Act & Assert
      await expect(registryManager.addAgent(mockAgent))
        .rejects
        .toThrow('Failed to add agent: Agent with ID test-agent already exists');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should throw error when catalog read fails', async () => {
      // Arrange
      const error = new Error('Failed to read catalog');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(registryManager.addAgent(mockAgent))
        .rejects
        .toThrow('Failed to add agent: Failed to load catalog: Failed to read catalog');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects in error handling', async () => {
      // Arrange
      (fs.readFile as jest.Mock).mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(registryManager.addAgent(mockAgent))
        .rejects
        .toThrow('Failed to add agent: Failed to load catalog: Unknown error');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  
    describe('getAgent()', () => {
      const mockAgent = {
        id: 'test-agent',
        name: 'Test Agent',
        version: '1.0.0',
        description: 'A test agent',
        capabilities: ['test'],
        endpoints: {
          api: 'http://localhost:3000'
        }
      };
  
      it('should throw error when catalog read fails', async () => {
        // Arrange
        const error = new Error('Failed to read catalog');
        (fs.readFile as jest.Mock).mockRejectedValue(error);
  
        // Act & Assert
        await expect(registryManager.getAgent('test-agent'))
          .rejects
          .toThrow('Failed to get agent: Failed to load catalog: Failed to read catalog');
      });

      it('should handle non-Error objects in error handling', async () => {
        // Arrange
        (fs.readFile as jest.Mock).mockRejectedValue('Unknown error');

        // Act & Assert
        await expect(registryManager.getAgent('test-agent'))
          .rejects
          .toThrow('Failed to get agent: Failed to load catalog: Unknown error');
      });
  
      it('should return null when agent not found', async () => {
        // Arrange
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ agents: [] }));
  
        // Act
        const result = await registryManager.getAgent('non-existent');
  
        // Assert
        expect(result).toBeNull();
      });
    });
  
    describe('listAgents()', () => {
      it('should throw error when catalog read fails', async () => {
        // Arrange
        const error = new Error('Failed to read catalog');
        (fs.readFile as jest.Mock).mockRejectedValue(error);
  
        // Act & Assert
        await expect(registryManager.listAgents())
          .rejects
          .toThrow('Failed to list agents: Failed to load catalog: Failed to read catalog');
      });
  
      it('should handle non-Error objects in catalog read', async () => {
        // Arrange
        (fs.readFile as jest.Mock).mockRejectedValue('Unknown error');
   
        // Act & Assert
        await expect(registryManager.listAgents())
          .rejects
          .toThrow('Failed to list agents: Failed to load catalog: Unknown error');
      });

      it('should successfully list all agents', async () => {
        // Arrange
        const mockAgents = [
          {
            id: 'test-agent-1',
            name: 'Test Agent 1',
            version: '1.0.0',
            description: 'First test agent',
            capabilities: ['test'],
            endpoints: { api: 'http://localhost:3000' }
          },
          {
            id: 'test-agent-2',
            name: 'Test Agent 2',
            version: '1.0.0',
            description: 'Second test agent',
            capabilities: ['test'],
            endpoints: { api: 'http://localhost:3001' }
          }
        ];
        const mockCatalog = { agents: mockAgents };
        (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockCatalog));

        // Act
        const result = await registryManager.listAgents();

        // Assert
        expect(result).toEqual(mockAgents);
      });
    });
  
    describe('saveCatalog()', () => {
      it('should throw error when write fails', async () => {
        // Arrange
        const error = new Error('Permission denied');
        (fs.writeFile as jest.Mock).mockRejectedValue(error);
        const catalog = { agents: [] };
  
        // Act & Assert
        await expect(registryManager['saveCatalog'](catalog))
          .rejects
          .toThrow('Failed to save catalog: Permission denied');
      });
  
      it('should handle non-Error objects in write failure', async () => {
        // Arrange
        (fs.writeFile as jest.Mock).mockRejectedValue('Unknown error');
        const catalog = { agents: [] };
  
        // Act & Assert
        await expect(registryManager['saveCatalog'](catalog))
          .rejects
          .toThrow('Failed to save catalog: Unknown error');
      });
    });
  });

  describe('removeAgent()', () => {
    const mockAgent = {
      id: 'test-agent',
      name: 'Test Agent',
      version: '1.0.0',
      description: 'A test agent',
      capabilities: ['test'],
      endpoints: {
        api: 'http://localhost:3000'
      }
    };

    const mockCatalog = { agents: [mockAgent] };

    beforeEach(() => {
      // Setup default read mock to return catalog with one agent
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockCatalog));
      // Setup default write mock to succeed
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should successfully remove an existing agent', async () => {
      // Arrange
      const expectedCatalog = { agents: [] };

      // Act
      await registryManager.removeAgent('test-agent');

      // Assert
      expect(fs.writeFile).toHaveBeenCalledWith(
        '../../registry/agents.json',
        JSON.stringify(expectedCatalog, null, 2)
      );
    });

    it('should throw error when agent does not exist', async () => {
      // Act & Assert
      await expect(registryManager.removeAgent('non-existent'))
        .rejects
        .toThrow('Failed to remove agent: Agent with ID non-existent not found');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should throw error when catalog read fails', async () => {
      // Arrange
      const error = new Error('Failed to read catalog');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(registryManager.removeAgent('test-agent'))
        .rejects
        .toThrow('Failed to remove agent: Failed to load catalog: Failed to read catalog');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects in error handling', async () => {
      // Arrange
      (fs.readFile as jest.Mock).mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(registryManager.removeAgent('test-agent'))
        .rejects
        .toThrow('Failed to remove agent: Failed to load catalog: Unknown error');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });


  describe('updateAgent()', () => {
    const mockAgent = {
      id: 'test-agent',
      name: 'Test Agent',
      version: '1.0.0',
      description: 'A test agent',
      capabilities: ['test'],
      endpoints: {
        api: 'http://localhost:3000'
      }
    };

    const updates = {
      name: 'Updated Test Agent',
      description: 'Updated test agent description'
    };

    beforeEach(() => {
      // Setup default write mock to succeed
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    });

    it('should successfully update an existing agent', async () => {
      // Arrange
      const existingCatalog = { agents: [mockAgent] };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingCatalog));
      mockValidate.mockReturnValue(true);

      // Act
      await registryManager.updateAgent(mockAgent.id, updates);

      // Assert
      const writeCallArgs = (fs.writeFile as jest.Mock).mock.calls[0];
      expect(writeCallArgs[0]).toBe('../../registry/agents.json');
      const writtenContent = JSON.parse(writeCallArgs[1]);
      expect(writtenContent.agents[0].name).toBe('Updated Test Agent');
    });

    it('should throw error when agent does not exist', async () => {
      // Arrange
      const emptyCatalog = { agents: [] };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(emptyCatalog));

      // Act & Assert
      await expect(registryManager.updateAgent(mockAgent.id, updates))
        .rejects
        .toThrow('Failed to update agent: Agent with ID test-agent not found');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should throw error when catalog validation fails', async () => {
      // Arrange
      const existingCatalog = { agents: [mockAgent] };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingCatalog));
      mockValidate.mockReturnValue(false);
      Object.assign(mockValidate, { errors: [{ message: 'Invalid agent data' }] });

      // Act & Assert
      await expect(registryManager.updateAgent(mockAgent.id, updates))
        .rejects
        .toThrow('Failed to update agent: Invalid catalog format: Invalid agent data');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should throw error when catalog read fails', async () => {
      // Arrange
      const error = new Error('Failed to read catalog');
      (fs.readFile as jest.Mock).mockRejectedValue(error);

      // Act & Assert
      await expect(registryManager.updateAgent(mockAgent.id, updates))
        .rejects
        .toThrow('Failed to update agent: Failed to load catalog: Failed to read catalog');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle non-Error objects in error handling', async () => {
      // Arrange
      (fs.readFile as jest.Mock).mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(registryManager.updateAgent(mockAgent.id, updates))
        .rejects
        .toThrow('Failed to update agent: Failed to load catalog: Unknown error');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});