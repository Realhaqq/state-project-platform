export function getHCaptchaSiteKey(): string {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY
  if (!siteKey) {
    throw new Error("NEXT_PUBLIC_HCAPTCHA_SITE_KEY environment variable is required")
  }
  return siteKey
}
