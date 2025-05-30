/**
 * Registry Manager for handling agent catalog operations
 * Provides type-safe CRUD operations for managing agent entries
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import Ajv, { ErrorObject } from 'ajv';

// Types for agent registry entries
export interface AgentEntry {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  tags?: string[];
  endpoints: {
    api: string;
    websocket?: string;
  };
  pricing?: {
    model: string;
    rates: {
      [key: string]: number;
    };
  };
}

interface Registry {
  agents: AgentEntry[];
}

export class RegistryManager {
  private readonly schemaPath: string;
  private readonly catalogPath: string;
  private readonly ajv: Ajv;

  constructor(
    schemaPath = '../../registry/schema.json',
    catalogPath = '../../registry/agents.json'
  ) {
    // Resolve paths relative to source directory
    this.schemaPath = path.resolve(__dirname, schemaPath);
    this.catalogPath = path.resolve(__dirname, catalogPath);
    this.ajv = new Ajv();
  }

  /**
   * Initialize the registry manager and validate schema
   */
  async initialize(): Promise<void> {
    try {
      // Read and parse schema
      const schemaData = await fs.readFile(this.schemaPath, 'utf-8');
      const schema = JSON.parse(schemaData);
      const validate = this.ajv.compile(schema);

      let catalog: Registry;
      
      try {
        // Try to read existing catalog
        const catalogData = await fs.readFile(this.catalogPath, 'utf-8');
        catalog = JSON.parse(catalogData);
      } catch (err) {
        // Create new catalog if file doesn't exist
        catalog = { agents: [] };
        await fs.writeFile(this.catalogPath, JSON.stringify(catalog, null, 2));
      }

      // Validate catalog against schema
      const valid = validate(catalog);
      if (!valid) {
        const errors = validate.errors as ErrorObject[];
        throw new Error(`Invalid catalog format: ${errors?.map(e => e.message).join(', ')}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to initialize registry: ${error.message}`);
      }
      throw new Error(`Failed to initialize registry: ${String(error)}`);
    }
  }

  /**
   * Add a new agent entry to the registry
   */
  async addAgent(agent: AgentEntry): Promise<void> {
    try {
      const catalog = await this.loadCatalog();
      
      // Check for duplicate ID
      if (catalog.agents.some(a => a.id === agent.id)) {
        throw new Error(`Agent with ID ${agent.id} already exists`);
      }

      catalog.agents.push(agent);
      await this.saveCatalog(catalog);
    } catch (error) {
      throw new Error(`Failed to add agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Remove an agent entry from the registry
   */
  async removeAgent(agentId: string): Promise<void> {
    try {
      const catalog = await this.loadCatalog();
      const index = catalog.agents.findIndex(a => a.id === agentId);
      
      if (index === -1) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      catalog.agents.splice(index, 1);
      await this.saveCatalog(catalog);
    } catch (error) {
      throw new Error(`Failed to remove agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update an existing agent entry
   */
  async updateAgent(agentId: string, updates: Partial<AgentEntry>): Promise<void> {
    try {
      const catalog = await this.loadCatalog();
      const index = catalog.agents.findIndex(a => a.id === agentId);
      
      if (index === -1) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      catalog.agents[index] = { ...catalog.agents[index], ...updates };
      
      // Validate updated catalog
      const schema = JSON.parse(await fs.readFile(this.schemaPath, 'utf-8'));
      const validate = this.ajv.compile(schema);
      const valid = validate(catalog);
      
      if (!valid) {
        const errors = validate.errors as ErrorObject[];
        throw new Error(`Invalid catalog format: ${errors?.map(e => e.message).join(', ')}`);
      }

      await this.saveCatalog(catalog);
    } catch (error) {
      throw new Error(`Failed to update agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get an agent entry by ID
   */
  async getAgent(agentId: string): Promise<AgentEntry | null> {
    try {
      const catalog = await this.loadCatalog();
      return catalog.agents.find(a => a.id === agentId) || null;
    } catch (error) {
      throw new Error(`Failed to get agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all agents in the registry
   */
  async listAgents(): Promise<AgentEntry[]> {
    try {
      const catalog = await this.loadCatalog();
      return catalog.agents;
    } catch (error) {
      throw new Error(`Failed to list agents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load the catalog file
   */
  private async loadCatalog(): Promise<Registry> {
    try {
      const data = await fs.readFile(this.catalogPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load catalog: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save the catalog file
   */
  private async saveCatalog(catalog: Registry): Promise<void> {
    try {
      await fs.writeFile(this.catalogPath, JSON.stringify(catalog, null, 2));
    } catch (error) {
      throw new Error(`Failed to save catalog: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}