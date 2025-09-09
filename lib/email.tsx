import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: "Niger State Platform <noreply@nigerstate.gov.ng>",
      to: email,
      subject: "Welcome to Niger State Development Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to Niger State Development Platform</h1>
          <p>Dear ${name},</p>
          <p>Thank you for subscribing to our quarterly development reports. You will receive updates about development projects in your area every quarter.</p>
          <p>You can view all approved projects and track development progress at any time on our platform.</p>
          <p>Best regards,<br>Niger State Development Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send welcome email:", error)
  }
}

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

    await resend.emails.send({
      from: "Niger State Platform <noreply@nigerstate.gov.ng>",
      to: email,
      subject: "Reset Your Password - Niger State Development Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Reset Your Password</h1>
          <p>Dear ${name},</p>
          <p>You have requested to reset your password for your Niger State Development Platform account.</p>
          <p>Please click the link below to reset your password. This link will expire in 1 hour:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>For security reasons, this link will expire in 1 hour.</p>
          <p>Best regards,<br>Niger State Development Team</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${resetUrl}
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
  }
}

export async function sendQuarterlyReport(email: string, name: string, projects: any[]) {
  try {
    const projectsHtml = projects
      .map(
        (p) => `
      <div style="border: 1px solid #e5e7eb; padding: 16px; margin: 8px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">${p.title}</h3>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          ${p.lga_name} - ${p.ward_name} | Status: ${p.status}
        </p>
        <p style="margin: 8px 0 0 0; font-size: 14px;">${p.description}</p>
      </div>
    `,
      )
      .join("")

    await resend.emails.send({
      from: "Niger State Platform <noreply@nigerstate.gov.ng>",
      to: email,
      subject: "Niger State Quarterly Development Report",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Quarterly Development Report</h1>
          <p>Dear ${name},</p>
          <p>Here are the latest development projects in your area:</p>
          ${projectsHtml}
          <p>Visit our platform to see more details and track project progress.</p>
          <p>Best regards,<br>Niger State Development Team</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send quarterly report:", error)
  }
}
