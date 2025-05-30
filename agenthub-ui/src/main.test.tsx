import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App'

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}))

describe('main', () => {
  let root: HTMLElement

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    vi.resetModules()
    
    // Setup DOM
    root = document.createElement('div')
    root.id = 'root'
    document.body.appendChild(root)
  })

  afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = ''
  })

  it('should render App in StrictMode when root element exists', async () => {
    // Import main to trigger the code
    await import('./main')

    // Verify createRoot was called with root element
    expect(createRoot).toHaveBeenCalledWith(root)

    // Get mock instance
    const mockRoot = (createRoot as unknown as ReturnType<typeof vi.fn>).mock.results[0].value

    // Verify render was called with StrictMode wrapping App
    const renderCall = mockRoot.render.mock.calls[0][0]
    expect(renderCall.type).toBe(StrictMode)
    expect(renderCall.props.children.type.name).toBe('App')
  })

  it('should throw error when root element is not found', async () => {
    // Remove root element
    document.body.removeChild(root)
    
    // Mock document.getElementById to return null before importing
    vi.spyOn(document, 'getElementById').mockReturnValue(null)
    
    // The code should throw when imported
    try {
      await import('./main')
      // Should not reach here
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe('Root element not found')
    }
  })
})