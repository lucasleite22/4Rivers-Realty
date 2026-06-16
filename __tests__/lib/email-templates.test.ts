import { newLeadAgentEmail } from '@/lib/email-templates/new-lead-agent'
import { leadConfirmationEmail } from '@/lib/email-templates/lead-confirmation'

describe('newLeadAgentEmail', () => {
  const base = {
    leadName: 'John Doe',
    leadEmail: 'john@example.com',
    leadPhone: '(352) 555-1234',
    leadType: 'BUYER',
    leadOrigin: 'WEBSITE',
    propertyInterest: 'Horse farm 30+ acres',
    budgetUsd: '2000000',
    notes: 'Prefers Ocala area',
    adminUrl: 'https://4riversrealty.com/admin/leads',
  }

  it('includes the lead name', () => {
    const html = newLeadAgentEmail(base)
    expect(html).toContain('John Doe')
  })

  it('includes origin label', () => {
    const html = newLeadAgentEmail(base)
    expect(html).toContain('Website')
  })

  it('formats budget with locale', () => {
    const html = newLeadAgentEmail(base)
    expect(html).toContain('2,000,000')
  })

  it('includes the admin CTA link', () => {
    const html = newLeadAgentEmail(base)
    expect(html).toContain('https://4riversrealty.com/admin/leads')
  })

  it('omits rows for null fields', () => {
    const html = newLeadAgentEmail({ ...base, leadPhone: null, notes: null })
    // Phone and Notes rows should not appear
    expect(html).not.toContain('(352) 555-1234')
    expect(html).not.toContain('Prefers Ocala')
  })
})

describe('leadConfirmationEmail', () => {
  const base = {
    leadName: 'Maria Santos',
    propertyInterest: 'Small farm 10-20 acres',
    agentPhone: '(352) 555-0100',
    agentEmail: 'info@4riversrealty.com',
  }

  it('uses first name only in greeting', () => {
    const html = leadConfirmationEmail(base)
    expect(html).toContain('Maria')
    expect(html).not.toContain('Thank you, Maria Santos')
  })

  it('includes property interest', () => {
    const html = leadConfirmationEmail(base)
    expect(html).toContain('Small farm 10-20 acres')
  })

  it('includes agent contact info', () => {
    const html = leadConfirmationEmail(base)
    expect(html).toContain('(352) 555-0100')
    expect(html).toContain('info@4riversrealty.com')
  })

  it('renders generic message when no property interest', () => {
    const html = leadConfirmationEmail({ ...base, propertyInterest: null })
    expect(html).toContain('perfect property')
  })
})
