import { on } from './index'
import { gmailAdapter } from '@/lib/mail/gmail'

let registered = false

// ponytail: event listeners with real email side-effects.
// Mail adapter is a stub unless GMAIL_API_KEY is set — emails silently fail in dev.
export function registerListeners() {
  if (registered) return
  registered = true

  on('lead.created', (event) => {
    console.log('[event] lead.created', event.data.name)
    gmailAdapter.sendEmail(
      event.data.email as string,
      'New lead received',
      `<p>A new lead <strong>${event.data.name}</strong> has been added to your pipeline.</p>`,
    ).catch(() => {})
  })

  on('lead.converted', (event) => {
    console.log('[event] lead.converted', event.data.leadId)
  })

  on('client.created', (event) => {
    console.log('[event] client.created', event.data.clientId)
  })

  on('agreement.sent', (event) => {
    console.log('[event] agreement.sent', event.data.agreementId)
    gmailAdapter.sendEmail(
      event.data.clientId as string,
      'Proposal sent',
      `<p>A proposal has been sent. Agreement ID: ${event.data.agreementId}</p>`,
    ).catch(() => {})
  })

  on('agreement.signed', (event) => {
    console.log('[event] agreement.signed', event.data.agreementId)
  })

  on('invoice.sent', (event) => {
    console.log('[event] invoice.sent', event.data.invoiceId)
  })

  on('invoice.paid', (event) => {
    console.log('[event] invoice.paid', event.data.invoiceId, event.data.amount)
  })

  on('expense.recorded', (event) => {
    console.log('[event] expense.recorded', event.data.amount)
  })

  on('project.completed', (event) => {
    console.log('[event] project.completed', event.data.projectId)
  })

  on('job.failed', (event) => {
    console.error('[event] job.failed', event.data.jobId, event.data.error)
  })
}