import { AgentEntry } from '../../registry/registryManager';

/**
 * HTML templates for the Discovery Widget
 */

/**
 * Main container template
 */
export const containerTemplate = `
  <div class="widget-container">
    <div class="search-container">
      <input type="text" id="search-input" placeholder="Search agents..." aria-label="Search agents">
      <select id="tag-select" aria-label="Filter by tag">
        <option value="">All Tags</option>
      </select>
    </div>
    <div id="error-display"></div>
    <div id="loading-indicator">Loading...</div>
    <ul class="results-list"></ul>
    <div class="pagination">
      <button id="prev-page" disabled>Previous</button>
      <span id="page-info">Page 1</span>
      <button id="next-page" disabled>Next</button>
    </div>
  </div>
`;

/**
 * Template for rendering a single agent item
 */
export const agentItemTemplate = (agent: AgentEntry): string => `
  <li class="agent-item">
    <h3>${escapeHtml(agent.name)} <small>v${escapeHtml(agent.version)}</small></h3>
    <p>${escapeHtml(agent.description)}</p>
    <div class="tags">
      ${(agent.tags ?? [])
        .map((tag: string): string => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join('')}
    </div>
  </li>
`;

/**
 * Template for the error display
 */
export const errorTemplate = (message: string): string => `
  <div class="error-message">
    ${escapeHtml(message)}
  </div>
`;

/**
 * Template for no results found
 */
export const noResultsTemplate = `
  <div class="no-results">
    No agents found matching your search criteria
  </div>
`;

/**
 * Helper function to escape HTML special characters
 * @param unsafe The unsafe string that might contain HTML special characters
 * @returns The escaped safe string
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}