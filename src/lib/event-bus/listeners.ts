import { on } from './index'

// ponytail: console-only, replace with real side-effects (email, push, webhook) when needed
export function registerListeners() {
  on('lead.created', (payload) => {
    console.log('[event] lead.created', payload.data.name)
  })
  on('lead.converted', (payload) => {
    console.log('[event] lead.converted', payload.data.name)
  })
  on('client.created', (payload) => {
    console.log('[event] client.created', payload.data.name)
  })
  on('agreement.sent', (payload) => {
    console.log('[event] agreement.sent', payload.data.id)
  })
  on('agreement.signed', (payload) => {
    console.log('[event] agreement.signed', payload.data.id)
  })
  on('invoice.sent', (payload) => {
    console.log('[event] invoice.sent', payload.data.id)
  })
  on('invoice.paid', (payload) => {
    console.log('[event] invoice.paid', payload.data.id)
  })
  on('expense.recorded', (payload) => {
    console.log('[event] expense.recorded', payload.data.amount)
  })
  on('project.completed', (payload) => {
    console.log('[event] project.completed', payload.data.name)
  })
  on('job.failed', (payload) => {
    console.error('[event] job.failed', payload.data.jobId, payload.data.error)
  })
}
