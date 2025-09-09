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
      if (window.hcaptcha && captchaRef.current) {
        widgetId.current = window.hcaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "error-callback": onError,
        })
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
        window.hcaptcha.remove(widgetId.current)
      }
    }
  }, [onVerify, onError])

  // if (!siteKey) {
  //   return null
  // }

  return <div ref={captchaRef} />
}
