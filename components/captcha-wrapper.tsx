"use client"

import { useEffect, useRef } from "react"
import { getHCaptchaSiteKey } from "@/lib/captcha-config"

declare global {
  interface Window {
    hcaptcha: any
  }
}

interface CaptchaWrapperProps {
  onVerify: (token: string) => void
  onError?: () => void
}

export function CaptchaWrapper({ onVerify, onError }: CaptchaWrapperProps) {
  const captchaRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  useEffect(() => {
    const siteKey = getHCaptchaSiteKey()

    const loadHCaptcha = () => {
      if (window.hcaptcha && captchaRef.current && !widgetId.current) {
        try {
          widgetId.current = window.hcaptcha.render(captchaRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            "error-callback": onError,
          })
        } catch (error) {
          console.error('Failed to render hCaptcha widget:', error)
        }
      }
    }

    if (window.hcaptcha) {
      loadHCaptcha()
    } else {
      const script = document.createElement("script")
      script.src = "https://js.hcaptcha.com/1/api.js"
      script.async = true
      script.defer = true
      script.onload = loadHCaptcha
      document.head.appendChild(script)
    }

    return () => {
      if (window.hcaptcha && widgetId.current) {
        try {
          // Check if the widget still exists before trying to remove it
          if (captchaRef.current && captchaRef.current.children.length > 0) {
            window.hcaptcha.remove(widgetId.current)
          }
        } catch (error) {
          // Silently handle the error - widget may already be removed
          console.warn('Failed to remove hCaptcha widget:', error)
        }
      }
    }
  }, [onVerify, onError])

  // if (!siteKey) {
  //   return null
  // }

  return <div ref={captchaRef} />
}
