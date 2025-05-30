import { DiscoveryAPI } from '../discoveryAPI';
import { RegistryManager } from '../../registry/registryManager';
import { AgentEntry } from '../../registry/registryManager';
import {
  SearchParams,
  PaginationResult,
  RateLimitConfig,
  SchemaFilter,
  RateLimitInfo
} from '../types';
import { styles } from './styles';
import {
  containerTemplate,
  agentItemTemplate,
  errorTemplate,
  noResultsTemplate
} from './templates';

/**
 * Discovery Widget Web Component
 * Provides a user interface for searching and filtering agents
 */
export class DiscoveryWidget extends HTMLElement {
  private api: DiscoveryAPI;
  private searchInput: HTMLInputElement | null = null;
  private categorySelect: HTMLSelectElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private loadingIndicator: HTMLElement | null = null;
  private errorDisplay: HTMLElement | null = null;
  private currentPage = 1;
  private readonly pageSize = 10;

  constructor() {
    super();
    // Initialize DiscoveryAPI with default rate limit config
    const registryManager = new RegistryManager();
    const rateLimitConfig: RateLimitConfig = {
      windowMs: 60000, // 1 minute
      maxRequests: 30
    };
    this.api = new DiscoveryAPI(registryManager, rateLimitConfig);
    
    // Create shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Add styles
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(styles);
    shadow.adoptedStyleSheets = [styleSheet];
    
    // Add template
    shadow.innerHTML = containerTemplate;
    
    // Initialize UI elements
    this.initializeElements();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    if (!this.shadowRoot) return;
    
    this.searchInput = this.shadowRoot.querySelector('#search-input');
    this.categorySelect = this.shadowRoot.querySelector('#category-select');
    this.resultsContainer = this.shadowRoot.querySelector('.results-list');
    this.loadingIndicator = this.shadowRoot.querySelector('#loading-indicator');
    this.errorDisplay = this.shadowRoot.querySelector('#error-display');
  }

  private attachEventListeners(): void {
    // Debounced search input handler
    let searchTimeout: NodeJS.Timeout;
    this.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.handleSearch();
      }, 300);
    });

    // Category filter handler
    this.categorySelect?.addEventListener('change', () => {
      this.handleSearch();
    });
  }

  private async handleSearch(): Promise<void> {
    if (!this.searchInput || !this.categorySelect) return;

    const searchParams: SearchParams = {
      query: this.searchInput.value,
      categories: this.categorySelect.value ? [this.categorySelect.value] : undefined,
      page: this.currentPage,
      limit: this.pageSize
    };

    try {
      this.showLoading(true);
      this.showError('');
      
      const results = await this.api.search(searchParams);
      this.renderResults(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      if (this.errorDisplay) {
        this.errorDisplay.innerHTML = errorTemplate(errorMessage);
      }
    } finally {
      this.showLoading(false);
    }
  }

  private renderResults(results: PaginationResult<AgentEntry>): void {
    if (!this.resultsContainer) return;

    // Clear existing results
    this.resultsContainer.innerHTML = '';

    if (results.items.length === 0) {
      this.resultsContainer.innerHTML = noResultsTemplate;
      return;
    }

    // Create results list
    const list = document.createElement('ul');
    list.className = 'results-list';

    results.items.forEach(agent => {
      const item = document.createElement('li');
      item.innerHTML = agentItemTemplate(agent);
      list.appendChild(item);
    });

    // Add the results list first
    this.resultsContainer.appendChild(list);

    // Add pagination if needed
    if (results.total > this.pageSize) {
      const pagination = document.createElement('div');
      pagination.className = 'pagination';
      
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.disabled = this.currentPage === 1;
      prevButton.addEventListener('click', () => this.previousPage());
      
      const pageInfo = document.createElement('span');
      pageInfo.textContent = `Page ${this.currentPage}`;
      
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.disabled = !results.hasMore;
      nextButton.addEventListener('click', () => this.nextPage());
      
      pagination.appendChild(prevButton);
      pagination.appendChild(pageInfo);
      pagination.appendChild(nextButton);
      
      this.resultsContainer.appendChild(pagination);
    }
  }

  private showLoading(show: boolean): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = show ? 'block' : 'none';
    }
  }

  private showError(message: string): void {
    if (this.errorDisplay) {
      this.errorDisplay.textContent = message;
      this.errorDisplay.style.display = message ? 'block' : 'none';
    }
  }

  private nextPage(): void {
    this.currentPage++;
    this.handleSearch();
  }

  private previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.handleSearch();
    }
  }

  // Public methods that implement the DiscoveryWidget interface
  public async search(params: SearchParams): Promise<PaginationResult<AgentEntry>> {
    return this.api.search(params);
  }

  public async filter(agents: AgentEntry[], filter: SchemaFilter): Promise<AgentEntry[]> {
    // This would be implemented if we add schema filtering functionality
    return agents;
  }

  public async getRateLimitInfo(): Promise<RateLimitInfo> {
    return {
      remaining: 30, // Placeholder - would need to be implemented in DiscoveryAPI
      reset: Date.now() + 60000,
      limit: 30
    };
  }
}

// Register the web component
customElements.define('discovery-widget', DiscoveryWidget);