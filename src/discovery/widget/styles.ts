/**
 * CSS styles for the Discovery Widget
 */
export const styles = `
  .widget-container {
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  #search-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }

  #category-select {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    min-width: 150px;
  }

  .results-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .agent-item {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .agent-item h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
  }

  .agent-item h3 small {
    color: #666;
    font-size: 14px;
    margin-left: 8px;
  }

  .agent-item p {
    margin: 0 0 10px 0;
    color: #444;
  }

  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    background: #f0f0f0;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 14px;
    color: #666;
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
  }

  .pagination button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }

  .pagination button:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }

  #loading-indicator {
    text-align: center;
    padding: 20px;
    color: #666;
    display: none;
  }

  .error-message {
    color: #d32f2f;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ffa4a4;
    border-radius: 4px;
    background: #fff5f5;
  }

  .no-results {
    text-align: center;
    padding: 30px;
    color: #666;
    font-style: italic;
  }
`;