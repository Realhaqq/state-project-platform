import { Buffer } from 'buffer'
import process from 'process/browser'

if (typeof window !== 'undefined') {
  // Polyfills for browser environment
  window.Buffer = Buffer
  window.process = process
}
