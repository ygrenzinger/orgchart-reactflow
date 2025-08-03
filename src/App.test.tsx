import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App'

test('renders org chart application', () => {
  render(<App />)
  const headerElement = screen.getByText(/Organizational Chart/i)
  expect(headerElement).toBeInTheDocument()
})

test('renders layout selector', () => {
  render(<App />)
  const selectorElement = screen.getByTitle(/Select layout algorithm/i)
  expect(selectorElement).toBeInTheDocument()
})