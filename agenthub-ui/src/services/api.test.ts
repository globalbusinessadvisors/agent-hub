import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiService } from './api';

describe('ApiService', () => {
  let apiService: ApiService;
  const mockFetch = vi.fn();
  
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockClear();
    apiService = new ApiService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('configuration', () => {
    it('should initialize with default base URL', () => {
      expect(apiService.baseUrl).toBe('http://localhost:3000/api');
    });

    it('should allow custom base URL configuration', () => {
      const customUrl = 'https://api.example.com';
      apiService = new ApiService(customUrl);
      expect(apiService.baseUrl).toBe(customUrl);
    });
  });

  describe('submitTask', () => {
    const mockTask = 'Test task';
    const mockMode = 'ask';
    const mockResponse = { message: 'Task received' };

    it('should submit task with correct payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      await apiService.submitTask(mockTask, mockMode);

      expect(mockFetch).toHaveBeenCalledWith(
        `${apiService.baseUrl}/task`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task: mockTask, mode: mockMode }),
        }
      );
    });

    it('should return response data on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await apiService.submitTask(mockTask, mockMode);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on non-ok response', async () => {
      const errorMessage = 'Invalid request';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: errorMessage,
      } as Response);

      await expect(apiService.submitTask(mockTask, mockMode))
        .rejects
        .toThrow(`API Error: ${errorMessage}`);
    });

    it('should retry failed requests up to 3 times', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        } as Response);

      const result = await apiService.submitTask(mockTask, mockMode);
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('switchMode', () => {
    const mockMode = 'code';
    const mockResponse = { mode: 'code', success: true };

    it('should send mode switch request with correct payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      await apiService.switchMode(mockMode);

      expect(mockFetch).toHaveBeenCalledWith(
        `${apiService.baseUrl}/mode`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mode: mockMode }),
        }
      );
    });

    it('should return response data on successful mode switch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const result = await apiService.switchMode(mockMode);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed mode switch', async () => {
      const errorMessage = 'Invalid mode';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: errorMessage,
      } as Response);

      await expect(apiService.switchMode(mockMode))
        .rejects
        .toThrow(`API Error: ${errorMessage}`);
    });
  });
});