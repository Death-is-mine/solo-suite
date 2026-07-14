export interface MailAdapter {
  sendEmail(to: string, subject: string, body: string): Promise<void>
  sendTemplate(to: string, template: string, data: Record<string, string>): Promise<void>
}
