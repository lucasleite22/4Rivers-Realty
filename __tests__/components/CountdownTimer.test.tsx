import { render, screen } from '@testing-library/react'
import CountdownTimer from '@/components/CountdownTimer'

// Framer Motion is SSR-incompatible in tests — mock it
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('CountdownTimer', () => {
  it('renders days, hours, minutes, seconds labels', () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    render(<CountdownTimer targetDate={future} label="Launch Event" />)
    expect(screen.getByText(/days/i)).toBeInTheDocument()
    expect(screen.getByText(/hours/i)).toBeInTheDocument()
    expect(screen.getByText(/minutes/i)).toBeInTheDocument()
    expect(screen.getByText(/seconds/i)).toBeInTheDocument()
  })

  it('renders the label prop', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    render(<CountdownTimer targetDate={future} label="Grand Opening" />)
    expect(screen.getByText('Grand Opening')).toBeInTheDocument()
  })

  it('shows expired message for past dates', () => {
    render(<CountdownTimer targetDate="2020-01-01T00:00:00" label="" />)
    expect(screen.getByText(/launched/i)).toBeInTheDocument()
  })
})
