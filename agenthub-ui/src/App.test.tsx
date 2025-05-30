import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the AgentHub UI heading', () => {
    render(<App />)
    const headingElement = screen.getByRole('heading', { name: /agenthub ui/i })
    expect(headingElement).toBeInTheDocument()
  })

  it('displays the welcome message', () => {
    render(<App />)
    const welcomeMessage = screen.getByText(/welcome to the agenthub ui project/i)
    expect(welcomeMessage).toBeInTheDocument()
  })
})