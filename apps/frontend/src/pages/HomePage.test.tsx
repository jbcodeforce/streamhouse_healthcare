import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders demonstration overview and key capabilities', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Streamhouse Healthcare Demonstration/i)).toBeInTheDocument()
    expect(screen.getByText(/Debezium CDC/i)).toBeInTheDocument()
    expect(screen.getByText(/Lightning vs. Snapshot Query Benchmark/i)).toBeInTheDocument()
    expect(screen.getByText(/Complex Event Processing/i)).toBeInTheDocument()
  })
})
